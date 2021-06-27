'use strict'

var FileMongo = require('../models/mongodb/files');
var File4j = require('../models/neo4j/file');
var Security = require('./security');
var Steps = require('../models/neo4j/steps');
var tmp = require('tmp');
var fs = require('fs');
var dbUtils = require('../neo4j/dbUtils');
var crypto = require('crypto'); //Para calcular(?) el hash

/*METODO PARA SUBIR ARCHIVO Y CIFRARLO*/
function saveFile(req, res){
  if (req.files){ //Si hay archivos en la petición
    var fileUp = req.files.file;
    var patientsId = req.params.patientsId;
    var stepsId=req.params.stepsId;
    Steps.getStepOwner(dbUtils.getSession(req), stepsId)
    .then(stepOwner => {
      if(req.user.id != stepOwner){
          return res.sendStatus(401);
      }
      Security.getKey(dbUtils.getSession(req), stepOwner)
      .then( key => {
        if(!key)throw("KEY IS NULL");
        //Obtener el tamaño del archivo
        //var fileSizeInBytes = fileUp.data.byteLength;
        //Convertir el tamaño a megabytes
        var fileSizeInMegabytes = fileUp.data.byteLength / 1000000.0
        //console.log("UPLOAD SIZE:", fileSizeInMegabytes);
        //console.log(stepOwner);
        //console.log(key);
        //Si el archivo es mayor de 10 MB
        if (fileSizeInMegabytes >= 10.00){
          return res.status(422).send({message: 'Archivo muy grande.'});
        }

          //Instanciar el objeto de la clase 'Hash' de la dependencia 'crypto'
          const hash = crypto.createHash('sha256');
          var file = new FileMongo(); 
          file.name = fileUp.name;
          file.data = Security.encryptFile(fileUp.data, key);
          file.hashcode = hash.update(file.data).digest('hex'); //Almacenar el hash del contenido del archivo
          file.encoding = fileUp.encoding;
          file.mimetype = fileUp.mimetype;
          file.steps_id = stepsId;
          file.patients_id = patientsId;
          file.save((err, fileStored) => {
            if(err) res.status(500).send({message: err});
            else{
              if(!fileStored){
                res.status(404).send({message: 'No se ha almacenado el archivo.'});
              }
              else
              {
                res.status(200).send({fileStored});
                //Obtener nombre del paciente al que pertenece el archivo que se acaba de subir
                 // File4j.getFilePatient(dbUtils.getSession(req), fileStored['_id'].toString())
                 // .then (patientName => {
                 //   if(patientName)
                 //     console.log(patientName);
                 //   res.status(200).send({fileStored});
                 // })
                 // .catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
              }
            }
          });
      })
      .catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
    })
    .catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
  }
  else{
    res.status(400).send({message: 'No seleccionó ningún archivo o está vacío.'})
  }
}

//Descargar archivo
function downloadFile(req, res){
  var fileId = req.params.id;
   //Instanciar el objeto de la clase 'Hash' de la dependencia 'crypto'
  const hash = crypto.createHash('sha256');
  Security.getKey(dbUtils.getSession(req), req.user.id)
  .then(key => {
     FileMongo.findById(fileId, (err, file) => {
        if(err){
          res.status(500).send({message: 'Error en la petición'});
        }
        else{
          if(!file){
            res.status(400).send({message: 'El archivo no existe'});
          }
          else{
            const currentHashcode = hash.update(file.data).digest('hex');
              if( currentHashcode !== file.hashcode){
                  return res.sendStatus(422);
              }

            //Se crea un archivo temporal, ahí se almacenará el archivo que se va a enviar al usuario
            tmp.file({mode: parseInt('0644',8)}, function _tempFileCreated(err, path, fd, cleanupCallback) {
              if (err) throw err;
              // console.log('File: ', path);
              // console.log('Filedescriptor: ', fd);

              //Se guarda el contenido en el archivo temporal
              /******** fs.appendFile(filedesciptor | filename, data to append, callback) ********/
              fs.appendFile(fd, Security.decryptFile(file.data, key), function (err) {
                if (err){
                  //throw err;
                  res.status(500).send({message: "error" + err});
                }
                  //console.log('Saved!');
              });

              const stats = fs.statSync(path);
              const fileSizeInBytes = stats.size;
              //Convert the file size to megabytes (optional)
              const fileSizeInMegabytes = fileSizeInBytes / 1000000.0;
              //console.log("DOWNLOAD SIZE: ", fileSizeInMegabytes);

              //Se descarga el archivo temporal, sobreescribiendo el nombre del archivo original (el que está en Mongo)
              res.setHeader('content-type', file.mimetype);
              res.download(path, file.name, function(err){
                if (err) {
                    // Handle error, but keep in mind the response may be partially-sent
                    // so check res.headersSent
                    if (!res.headersSent){
                      res.status(500).send({message: err});
                    }
                } 
                else {
                  //LIMPIAR ARCHIVO TEMPORAL
                  // If we don't need the file anymore we could manually call the cleanupCallback 
                  // But that is not necessary if we didn't pass the keep option because the library 
                  // will clean after itself. 
                    cleanupCallback();
                }
              });           
            });
          }
        }
      });
  })
  .catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
}

function getStepFiles (req, res){
  var stepId = req.params.id;
  File4j.getStepFiles(dbUtils.getSession(req), stepId)
  .then( files => { res.status(200).send(files); })
  .catch(function (err) {
    res.status(err.status).send({message: err.username});
    console.log(err);
  }) //Si ocurre un error
}

function getStepFilesByPatient(req, res){
  var stepId = req.params.id;
  Steps.getStepOwner(dbUtils.getSession(req),stepId)
  .then(userId => {
    if(req.user.id != userId ){ //Si no es el propietario de la etapa
      return res.sendStatus(401);
    }
    File4j.getStepFilesByPatient(dbUtils.getSession(req), stepId)
    .then(files => {
          //Obtener la subclave del usuario para cifrar la información de los pacientes
          Security.getSubkey(dbUtils.getSession(req), userId)
          .then( subkey => {
            //Aqui es donde se presenta el error.
              files.forEach (file => {
                console.log(files);
                for(var prop in file){
                  if(prop == 'patientName' || prop == 'patientAsurname' || prop == 'patientMsurname'){
                    file[prop] = Security.decryptPlain(file[prop], subkey);
                }
              }
            })
            res.status(200).send(files); 
          })
          .catch(function (err) {
            //res.status(err.status).send({message: err.username});
            console.log(err);
          }) //Si ocurre un error
         })
    .catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
  })
  .catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
}

function getStepFilesWithoutPatient(req, res){
  var stepId = req.params.id;
  Steps.getStepOwner(dbUtils.getSession(req),stepId)
  .then(userId => {
    File4j.getStepFilesWithoutPatient(dbUtils.getSession(req), stepId)
    .then( files => {
      res.status(200).send(files); 
    })
    .catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
  })
  .catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
}

function getStudioFiles (req, res){
  var studioId = req.params.id;
  File4j.getStudioFiles(dbUtils.getSession(req), studioId)
  .then( files => { res.status(200).send(files); })
  .catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
}

function deleteFile (req, res){
    var fileId = req.params.id;
    FileMongo.findByIdAndRemove(fileId).exec((err, deletedFile) =>{
    if(err){
      res.status(500).send({message: "Error en la petición"});
    }
    else{
      if(!deletedFile){
        res.status(404).send({message: "El archivo no ha sido eliminado"});
      }
      else{
        res.status(200).send({deletedFileId: deletedFile._id});
      }
    }
  });
}

module.exports = {
  saveFile,
  downloadFile,
  getStepFiles,
  getStudioFiles,
  deleteFile,
  getStepFilesByPatient,
  getStepFilesWithoutPatient
};

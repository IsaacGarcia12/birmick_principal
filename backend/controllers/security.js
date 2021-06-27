"use strict"

var config = require('../config');
var bcrypt = require('bcrypt-nodejs');
var secrets = require('secrets.js-grempe')
var jwt = require('../services/jwt');
var config = require('../config');
var crypto = require('crypto');

// function getSecretKey = function(userSubkey, userPassword){
//   var subkey = decryptPlain(userSubkey, userPassword);
//   return secrets.combine([subkey ,config.srvK]);
// }

//Obtener la clave para cifrar el archivo
var getKey = function (session, userId){
  return session
    .run('MATCH (user:User {_id: $id}) RETURN user.subkey as subkey',{id: userId})
    .then(function (result) {
      var key;
        if(!result.records.length)
         throw {username: "Unable to continue", status: 400}
        else {
            result.records.forEach(function (record){
              key = secrets.combine([record.get('subkey'),config.srvK]) //Combina la clave obtenida y la del servidor
            });
        }
        return key;
  })
  .catch( err => { throw err });
}

//Obtener la subclave de un usuario
var getSubkey = function (session, userId){
  return session
    .run('MATCH (user:User {_id: $id}) RETURN user.subkey as subkey',{id: userId})
    .then(function (result) {
        if(!result.records.length)
         throw {username: "Unable to continue", status: 400}
        else {
              return result.records[0].get('subkey');
        }
  })
  .catch( err => { throw err });
}


//Funciones de cifrado y descifrado
function encryptPlain(text, password){
  var algorithm = 'aes-256-ctr';
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

function decryptPlain(text, password){
  var algorithm = 'aes-256-ctr';
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

function encryptFile(data, key){
  var algorithm = 'aes-256-ctr'; //Va a cifrar utilizando AES 256 en el modo CTR
  var cipher = crypto.createCipher(algorithm,key);
  var crypted = Buffer.concat([cipher.update(data),cipher.final()]);
  return crypted;
}

function decryptFile(data, key){
  var algorithm = 'aes-256-ctr'; //Va a cifrar utilizando AES 256 en el modo CTR
  var decipher = crypto.createDecipher(algorithm,key)
  var dec = Buffer.concat([decipher.update(data) , decipher.final()]);
  return dec;
}

module.exports = {
  getKey,
  getSubkey,
  encryptPlain,
  decryptPlain,
  encryptFile,
  decryptFile
};

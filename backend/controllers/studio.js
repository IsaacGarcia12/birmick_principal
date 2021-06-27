'use strict'

var config = require('../config');
//Studios
var Studios = require('../models/neo4j/studios');
var Patients = require('../models/neo4j/patients');
var Steps = require('../models/neo4j/steps');
//Forms
var FileMongo = require('../models/mongodb/files');
var FormMongo = require('../models/mongodb/form');
var AnsweredForm = require('../models/mongodb/answeredForm');
var dbUtils = require('../neo4j/dbUtils')
var _ = require('lodash');


///// FUNCION PARA HACER LA MAYUSCULA LA PRIMER LETRA DE UN STRING Y LAS DEMAS EN MINUSCULAS ///////////
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

/////////////////////// MÉTODO PARA CREAR UN ESTUDIO ///////////////////////////
//CAMBIAR ESTA FUNCIÓN
function createStudio(req, res){
	var params = req.body;

	//Recoger el id del usuario que registra al paciente
	// if (!params.userId){
	// 	return res.status(400).send({message: 'Id del usuario no provisto'});
	// }
	
	// //Verificar que el usuario que registra el estudio es quien dice ser
	// if(req.user.id != params.userId){
	// 	return res.sendStatus(401);
	// }
	var userId = req.user.id;

	//Si la información está completa
	if(/*params.userId != null &&*/ params.name != null && params.appliedAt != null  && params.privacy != null &&  params.numSteps != null && params.numSeg != null && params.frecSamp != null && params.numSamp != null && params.lineaGrab != null && params.tmpoBase != null){
			//Registrar al usuario
			Studios.create(
				dbUtils.getSession(req), //Session
				//params.userId,
				userId,
				capitalize(params.name), 
				params.appliedAt,
				params.comments,
				/*params.date,
				params.hour, */
				params.privacy,
				params.numSteps, 
				params.numSeg, 
				params.frecSamp, 
				params.numSamp,
				params.lineaGrab,
				params.tmpoBase
			)
		    .then(studio => {res.status(200).send(studio);}) //Devolver los datos del estudio
		    .catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
		}
	else{
		res.status(400).send({message: 'Rellena todos los datos'});
	}
}

//Obtener estudio por id
function getStudio(req, res){
	var studioId = req.params.id;
	Studios.getStudio(dbUtils.getSession(req), studioId)
	.then(studio => {res.status(200).send(studio);}) //Devolver los datos del estudio
	.catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
}

//Obtener estudio por id validando al propietario
function getStudioByProprietary(req, res){
	var studioId = req.params.id;

	Studios.getStudioOwner(dbUtils.getSession(req),studioId)
	.then(userId => {
		if(req.user.id != userId ){ //Si no es el propietario del paciente
			return res.sendStatus(401);
		}
		Studios.getStudio(dbUtils.getSession(req), studioId)
		.then(studio => {res.status(200).send(studio);}) //Devolver los datos del estudio
		.catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
	})
	.catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
}

//Listar todos los estudios de un usuario
function getUserStudios(req, res){
	var userId = req.params.id;
	Studios.getUserStudiosList(dbUtils.getSession(req), userId)
	.then(studios => {res.status(200).send(studios);}) //Devolver los datos del estudio
	.catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
}


//Listar todos los estudios
function getAllStudios(req, res){
	Studios.getAllStudiosList(dbUtils.getSession(req))
	.then(studios => {res.status(200).send(studios);}) //Devolver los datos del estudio
	.catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
}

//Listar todos los estudios, excepto los de quien realiza la consulta
function getAllStudiosListButNotMine(req, res){
	var userId = req.user.id;
	console.log(userId);
	if (!userId){
		return res.status(400).send({message:"El id del usuario no pudo ser recuperado"});
	}
	Studios.getAllStudiosListButNotMine(dbUtils.getSession(req), userId)
	.then(studios => {res.status(200).send(studios);}) //Devolver los datos del estudio
	.catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
}

//Actualizar Estudios
function updateStudio(req, res){
	var update = req.body;
	var studioId = req.params.id;

	if(!studioId){
		return res.status(400).send({message: 'No se ha proveido un estudio'});
	}

	Studios.getStudioOwner(dbUtils.getSession(req),studioId)
	.then(userId => {
		if(req.user.id != userId ){ //Si no es el propietario del estudio
			return res.sendStatus(401);
		}
		//Si la información está completa
		if(update.name != null && update.comments != null && update.appliedAt != null  && update.privacy != null /*&& params.date != null && params.hour != null*/  &&  update.numSteps != null && update.numSeg != null && update.frecSamp != null && update.numSamp != null && update.lineaGrab != null && update.tmpoBase != null){
				//Registrar al usuario
				Studios.update(
					dbUtils.getSession(req), //Session
					studioId,
					{
						name: update.name, 
						/*date: params.date,
						hour: params.hour, */
						comments: update.comments,
						privacy: update.privacy,
						appliedAt: update.appliedAt,
						numSteps: update.numSteps, 
						numSeg: update.numSeg, 
						frecSamp: update.frecSamp, 
						numSamp: update.numSamp,
						lineaGrab: update.lineaGrab,
						tmpoBase: update.tmpoBase 
					}				
				)
			    .then(studioUpdated => {res.status(200).send(studioUpdated);}) //Devolver los datos del paciente almacenado
			    .catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
			}
		else{
			res.status(400).send({message: 'Rellena todos los datos'});
		}
	})
	.catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
}


function addPatient (req, res){
	var studioId = req.body.studioId;
	var patientId = req.body.patientId;

	//Checar al propietario del estudio
	Studios.getStudioOwner(dbUtils.getSession(req),studioId)
	.then(userId => {
		if(req.user.id != userId ){ //Si no es el propietario del estudio
			return res.sendStatus(401);
		}
		//Checar al propietario del paciente
		Patients.getPatientOwner (dbUtils.getSession(req), patientId)
		.then(patientOwner => {
			if(req.user.id != patientOwner ){ //Si no es el propietario del paciente
				return res.sendStatus(401);
			}
			//Checar si el paciente ya está en el estudio
			Studios.checkIfPatientIsInStudy(dbUtils.getSession(req), studioId, patientId)
			.then(isInStudy => {
				if(isInStudy) return res.status(409).send({message: "El paciente ya está en el estudio"}); //Si ya está en el estudio
				Studios.addPatient(dbUtils.getSession(req), studioId, patientId)
				.then(results => {res.status(200).send(results);}) //Devolver los datos del estudio
				.catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
			}) 
			.catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
		})
		.catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
	})
	.catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
}

//Eliminar Estudio
function deleteStudio(req, res){
	var studioId = req.params.id;

	Studio.findById(studioId).findByIdAndRemove((err, studioRemoved) => {
					if(err){
						res.status(500).send({mesagge: 'Error al eliminar el estudio'});
					}
					else{
						if(!studioRemoved){
							res.status(404).send({mesagge: 'El estudio no ha sido elimindado'});
						}
						else{
							file.find({studio: studioRemoved._id}).remove((err, fileRemoved) => {
								if(err){
									res.status(500).send({mesagge: 'Error al eliminar el archivo'});
								}
								else{
									if(!fileRemoved){
										res.status(404).send({mesagge: 'El archivo no ha sido eliminado'});
									}
									else{
										res.status(200).send({studio: studioRemoved});
									}
								}
							});
						}
					}
				
				});
}

//Listar todos los estudios
function searchStudiosByName(req, res){
	var keyword = req.params.keyword;
	var userId = req.user.id;
	Studios.searchStudiosByName(dbUtils.getSession(req), keyword, userId)
	.then(studios => {res.status(200).send(studios);}) //Devolver los datos del estudio
	.catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
}

//Listar todos los estudios
function removePatient(req, res){
	var studioId = req.body.studioId;
	var patientId = req.body.patientId;

			//Eliminar los archivos del paciente
	FileMongo.remove({ patients_id: patientId }).exec((err) =>{
		if(err){
			res.status(500).send({message: "Error en la petición"});
		}
	});

	Studios.removePatient(dbUtils.getSession(req), studioId, patientId)
	.then(patientId => {res.status(200).send({patientId});}) //Devolver los datos del estudio
	.catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
}

//Eliminar estudio
function deleteStudio(req, res){
	var studioId = req.params.id;
	//Eliminar etapas (una por una)
	Studios.getStepsIds(dbUtils.getSession(req), studioId)
	.then(stepsIds => {
		//Si hay etapas
		if(stepsIds){
			//Para cada etapa
			stepsIds.forEach(function (stepId){
				//Eliminar las respuestas de todos los formularios de la etapa
				Steps.getFormsIds(dbUtils.getSession(req), stepId)
				.then(formsIds => {
					if(formsIds){
						formsIds.forEach(function (formId){
							AnsweredForm.remove({ form_id: formId}).exec((err) =>{
						    if(err){
						     	return res.status(500).send({message: "Error en la petición"});
						    }
						  });
						});
					}
					//Eliminar los formularios de la etapa
					FormMongo.remove({ steps_id: stepId }).exec((err) =>{
						if(err){
							return res.status(500).send({message: "Error en la petición"});
						}
					});

					//Eliminar los archivos de la etapa
					FileMongo.remove({ steps_id: stepId }).exec((err) =>{
						if(err){
							return res.status(500).send({message: "Error en la petición"});
						}
					});

					//Eliminar la etapa (nodo y todas sus relaciones)
					Steps.deleteStep(dbUtils.getSession(req), stepId)
					.then( stepId  => {})
					.catch(function (err) {return res.status(err.status).send({message: err.username});}) //Si ocurre un error
				})
				.catch(function (err) {return res.status(err.status).send({message: err.username});}) //Si ocurre un error
			})
		}
		//Eliminar estudio independientemente a si tiene etapas o no
		Studios.deleteStudio(dbUtils.getSession(req), studioId)
		.then( studioId  => {return res.status(200).send({studioId});})
		.catch(function (err) {return res.status(err.status).send({message: err.username});}) //Si ocurre un error
	})
	.catch(function (err) {return res.status(err.status).send({message: err.username});}) //Si ocurre un error
}

module.exports = {
	createStudio,
	getStudio,
	getUserStudios,
	getAllStudios,
	getAllStudiosListButNotMine,
	updateStudio,
	deleteStudio,
	addPatient,
	getStudioByProprietary,
	searchStudiosByName,
	removePatient,
	deleteStudio
};
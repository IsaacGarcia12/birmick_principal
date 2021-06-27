'use strict'

var config = require('../config');
var Steps = require('../models/neo4j/steps');
var FileMongo = require('../models/mongodb/files');
var FormMongo = require('../models/mongodb/form');
var AnsweredForm = require('../models/mongodb/answeredForm');
var Studios = require('../models/neo4j/studios');
var dbUtils = require('../neo4j/dbUtils')
var _ = require('lodash');

function capitalize(string){
	return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function create(req, res){
	var params = req.body;
	var studioId = params.studioId;

	if (!studioId){
		return res.status(400).send({message: 'Id del estudio no provisto'});
	}
	Studios.getStudioOwner(dbUtils.getSession(req),studioId)
	.then(userId => {
		if(req.user.id != userId ){ //Si no es el propietario del estudio
			return res.sendStatus(401);
		}
		Steps.validateStepNumber( // Validar que el número de etapa no haya sido registrado
			dbUtils.getSession(req), //Session
			params.studioId,
			parseInt(params.numStep) //En entero para poder utilizar este campo para ordenar las etapas de un estudio
		)
		.then(stepExists => {
			if(stepExists) res.status(400).send({message: "El número de etapa ya ha sido registrado"});
			else{
				if(params.numStep != null && params.name != null && params.during != null){
					Steps.create(
						dbUtils.getSession(req), //Session
						params.studioId,
						parseInt(params.numStep), //En entero para poder utilizar este campo para ordenar las etapas de un estudio
						params.name,
						params.during,
						params.comments
					)
					.then(step => {res.status(200).send(step);}) //Devolver los datos de la etapa
					.catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
					}
					else{
						res.status(400).send({message: 'Rellene todos los datos'});
					}
			}
		})
		.catch(function (err) {console.log(err); res.status(err.status).send({message: err.username});}) //Si ocurre un error		
	})
	.catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
}

//Actualizar etapa
function updateStep(req, res){
	var update = req.body;
	var stepId = req.params.id;

	if(!stepId){
		return res.status(400).send({message: 'No se ha provisto una etapa'});
	}

	Steps.getStepOwner(dbUtils.getSession(req),stepId)
	.then(userId => {
		if(req.user.id != userId ){ //Si no es el propietario de la etapa
			return res.sendStatus(401);
		}
		//Si la información está completa
		if(update.name != null && update.during != null && update.comments != null){
				//Registrar al usuario
				Steps.update(
					dbUtils.getSession(req), //Session
					stepId,
					{
						name: update.name,
						during: update.during,
						comments: update.comments
					}				
				)
			    .then(stepUpdated => {res.status(200).send(stepUpdated);}) //Devolver los datos del paciente almacenado
			    .catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
			}
		else{
			res.status(400).send({message: 'Rellena todos los datos'});
		}
	})
	.catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
}

//Obtener etapa por id
function getStep(req, res){
	var stepId = req.params.id;
	if(req.user.role === 'ROLE_VISITOR'){ //Si es visitante
		return res.sendStatus(401);
	}
	Steps.getStep(dbUtils.getSession(req), stepId)
	.then(step => {res.status(200).send(step);}) //Devolver los datos del estudio
	.catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
}

//Obtener todas las etpas de un estudio
function getStepsList(req, res){
	if(req.user.role === 'ROLE_VISITOR'){ //Si es visitante
		return res.sendStatus(401);
	}
	var studioId = req.params.id;
	Steps.getStudioStepsList(dbUtils.getSession(req), studioId)
	.then(steps => {res.status(200).send(steps);}) //Devolver los datos del estudio
	.catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
}

function deleteStep(req, res){
	var stepId = req.params.id;
	
	//Eliminar las respuestas de todos los formularios de la etapa
	Steps.getFormsIds(dbUtils.getSession(req), stepId)
	.then(formsIds => {
		if(formsIds){
			formsIds.forEach(function (formId){
				AnsweredForm.remove({ form_id: formId}).exec((err) =>{
			    if(err){
			      res.status(500).send({message: "Error en la petición"});
			    }
			  });
			});
		}
		//Eliminar los formularios de la etapa
		FormMongo.remove({ steps_id: stepId }).exec((err) =>{
			if(err){
				res.status(500).send({message: "Error en la petición"});
			}
		});

		//Eliminar los archivos de la etapa
		FileMongo.remove({ steps_id: stepId }).exec((err) =>{
			if(err){
				res.status(500).send({message: "Error en la petición"});
			}
		});

		//Eliminar la etapa (nodo y todas sus relaciones)
		Steps.deleteStep(dbUtils.getSession(req), stepId)
		.then( stepId  => {res.status(200).send({stepId});})
		.catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
	})
	.catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
}

function validateStepNumber(req, res){
	var stepNumber = req.params.stepNumber;	
	var studioId = req.params.studioId;

	if (!studioId){
		return res.status(400).send({message: 'Id del estudio no provisto'});
	}
	Studios.getStudioOwner(dbUtils.getSession(req),studioId)
	.then(userId => {
		if(req.user.id != userId ){ //Si no es el propietario del estudio
			return res.sendStatus(401);
		}
		if(stepNumber != null && studioId != null){
		Steps.validateStepNumber(
			dbUtils.getSession(req), //Session
			studioId,
			parseInt(stepNumber) //En entero para poder utilizar este campo para ordenar las etapas de un estudio
		)
		.then(result => {res.status(200).send(result);}) //Devolver los datos de la etapa
		.catch(function (err) {console.log(err); res.status(err.status).send({message: err.username});}) //Si ocurre un error
		}
		else{
			res.status(400).send({message: 'Petición incompleta'});
		}
	})
	.catch(function (err) {console.log(err); res.status(err.status).send({message: err.username});}) //Si ocurre un error
}

module.exports = {
	create,
	updateStep,
	getStep,
	getStepsList,
	deleteStep,
	validateStepNumber
};
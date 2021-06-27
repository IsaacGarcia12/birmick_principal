'use strict'

var uuid = require('uuid');
var _ = require('lodash');
var dbUtils = require('../../neo4j/dbUtils');
var Step = require('./schemas/step');

//Crear etapa
var create= function(session, studioId, numStep, name, during, comments){
	return session.run('MATCH (studio:Studio {_id: $studioId}) CREATE (step:steps:Document { _id: $id, numStep: $numStep, name: $name, during: $during, comments: $comments})<-[:Has]-(studio) RETURN step',
	{
		studioId: studioId,
		id: uuid.v1(),
		numStep: numStep,
		name: name,
		during: during,
		comments: comments
	})
	.then(results => {
		return new Step(results.records[0]._fields[0]);
	})
	.catch((err) => {throw {username: err, status:400}});
}

//Obtener etapa por id
var getStep = function(session, stepId){
	return session.run('MATCH (step:steps {_id: $id}) RETURN step', {id: stepId})
		.then(results => {
			if(_.isEmpty(results.records)){
				throw {id: 'La etapa no existe', status: 400}
			}
			else{
				return new Step(results.records[0]._fields[0]);
			}
		})
		.catch((err) => {throw err});
}

//Obtener lista de etapas de un estudio
var getStudioStepsList = function (session, studioId) {
	return session.run('MATCH (studio:Studio {_id: $studioId}) -[:Has]->(step:steps) RETURN step ORDER BY step.numStep',{studioId: studioId})
	.then(results => {
		if(_.isEmpty(results.records)){
			throw {username: 'No hay etapas registradas', status: 404}
			console.log(results);
		}
		else{
			var steps = [];
			results.records.forEach(function (record) { //PARA CADA RECORD RECIBIDO
            	steps.push(new Step(record._fields[0]));
        	});
			return steps;
		}
    })
    .catch((err) => {throw err;
	console.log(err);}
	);
}

//Obtener el propietario de una etapa
var getStepOwner = function(session, stepId){
	return session.run('MATCH (step:steps {_id: $stepId})<-[:Has]-(:Studio)<-[:Create]-(user:User) RETURN user._id',{stepId: stepId})
	.then(results => {
		if(_.isEmpty(results.records)){
			throw {username: 'Error al obtener el propietario', status: 404}
		}
		return results.records[0].get("user._id");
	})
    .catch((err) => {throw err});
}

//Actualizar una etapa
var update = function (session, stepId, update) {
  return session.run('MATCH (step:steps {_id: $id}) SET step += $update RETURN step',
  {
    id: stepId,
    update: update
  })
  .then(results => {
    if (_.isEmpty(results.records)) {
    	throw {username: 'La etapa no ha sido actualizada', status: 404}
    }
    else{
    	return new Step(results.records[0]._fields[0]);
    }
  })
  .catch( err => {
    throw err
  })
};

//Eliminar etapa
var deleteStep = function (session, stepId) {
  return session.run('MATCH (step:steps {_id: $id}) WITH step, step._id as id DETACH DELETE step RETURN id',{ id: stepId })
  .then(results => {
    if (_.isEmpty(results.records)) {
    	throw {username: 'La etapa no ha sido eliminada', status: 404}
    }
    else{
    	return results.records[0]._fields[0];
    }
  })
  .catch( err => { throw err })
};

var getFormsIds = function (session, stepId){
	return session.run('MATCH (step:steps {_id: $stepId})<-[:forms_steps]-(form:forms) RETURN form._id ',{stepId: stepId})
	.then(results => {
		var formIds = [];
			results.records.forEach(function (record) { //PARA CADA RECORD RECIBIDO
	          	formIds.push(record._fields[0]);
	    	});
		return formIds;
	})
    .catch((err) => {throw err});
}

var validateStepNumber = function (session, studioId, numStep) {
	return session.run('MATCH (studio:Studio {_id: $studioId}) -[:Has]->(step:steps {numStep: $numStep}) RETURN step',{studioId: studioId, numStep: numStep})
	.then(results => {
		if(_.isEmpty(results.records)){
			return false; //Etapa no registrada
		}
		else{
			return true; //Etapa registrada
		}
  })
  .catch((err) => {throw err});
}

module.exports = {
	create: create,
	update: update,
	getFormsIds, //No en ruta, para uso interno del back
	getStepOwner,
	getStudioStepsList,
	getStep,
	deleteStep,
	validateStepNumber
}
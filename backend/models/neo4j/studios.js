'use strict'

var uuid = require('uuid');
var _ = require('lodash');
var dbUtils = require('../../neo4j/dbUtils');
var Studio = require('./schemas/studio');
var SharedStudio = require('./schemas/sharedStudio');
var Patient = require('./schemas/patient');
var Step = require('./schemas/step')


/////////////////    FUNCIÓN PARA CREAR UN ESTUDIO   /////////////////

var create = function(session, userId, name, appliedAt, comments, privacy, numSteps, numSeg, frecSamp, numSamp, lineaGrab, tmpoBase){
	return session.run('MATCH (user:User {_id: $userId}) CREATE (studio:Studio {_id: $id, name: $name, appliedAt: $appliedAt, comments: $comments, privacy: $privacy, createdAt: $createdAt, numSteps: $numSteps, numSeg: $numSeg, frecSamp: $frecSamp, numSamp: $numSamp, lineaGrab: $lineaGrab, numSeg: $numSeg, tmpoBase: $tmpoBase})<-[r:Create]-(user) RETURN studio',
	{
		userId: userId,
		id: uuid.v1(),
		name: name,
		appliedAt: appliedAt,
		comments: comments,
		privacy: privacy,
		createdAt: Date.now(),
		numSteps: numSteps,
		numSeg: numSeg, 
		frecSamp: frecSamp,
		numSamp: numSamp,
		lineaGrab: lineaGrab,
		tmpoBase: tmpoBase
	})
	.then(results => {
		return new Studio(results.records[0]._fields[0]);
	})
    .catch((err) => {throw {username: err, status:400}});
}

//Obtener estudio por id
var getStudio = function(session, studioId){
	return session.run('MATCH (studio:Studio {_id: $id}) RETURN studio', {id: studioId})
		.then(results => {
			if(_.isEmpty(results.records)){
				console.log(results);
				throw {id: 'El estudio no existe', status: 400}
			}
			else{
				return new Studio(results.records[0]._fields[0]);
			}
		})
}

//Obtener lista de todos los estudios
var getAllStudiosList = function (session) {
	return session.run('MATCH (studio:Studio) RETURN studio')
	.then(results => {
		if(_.isEmpty(results.records)){
			console.log(results);
			throw {username: 'No hay estudios registrados', status: 404}
		}
		else{
			var studios = [];
			results.records.forEach(function (record) { //PARA CADA RECORD RECIBIDO
            	studios.push(new Studio(record._fields[0]));
        	});
			return studios;
		}
    })
    .catch((err) => {throw {username: err, status:400}});
}

//Obtener lista de todos los estudios, excepto los de quien realiza la consulta
var getAllStudiosListButNotMine = function (session, userId) {
	return session.run("MATCH (studio:Studio {privacy:'public'})<-[:Create]-(u:User) WHERE u._id = $userId RETURN studio, u._id, u.name, u.asurname, u.msurname ORDER BY studio.createdAt",{userId: userId})
	.then(results => {
		if(_.isEmpty(results.records)){
			throw {username: 'No hay estudios registrados', status: 404}
		}
		else{
			var studios = [];
			results.records.forEach(function (record) { //PARA CADA RECORD RECIBIDO
				//      studio,             u._id         u.name,        u.asurname,        u.msurname
				//record._fields[0],record._fields[1],record._fields[2],record._fields[3],record._fields[4]
            	studios.push(new SharedStudio(record._fields[0], record._fields[1], record._fields[2], record._fields[3], record._fields[4]));
        	});
			return studios;
		}
    })
    .catch((err) => {throw err});
}

//Obtener lista de estudios de un usuario
var getUserStudiosList = function (session, userId) {
	return session.run('MATCH (user:User {_id: $userId}) -[:Create]->(studio:Studio) RETURN studio ORDER BY studio.createdAt',{userId: userId})
	.then(results => {
		if(_.isEmpty(results.records)){
			throw {username: 'No hay estudios registrados', status: 404}
		}
		else{
			var studios = [];
			results.records.forEach(function (record) { //PARA CADA RECORD RECIBIDO
            	studios.push(new Studio(record._fields[0]));
        	});
			return studios;
		}
    })
    .catch((err) => {throw err});
}

//Obtener lista de estudios de un usuario
var getUserStudiosIds = function (session, userId) {
	return session.run('MATCH (user:User {_id: $userId}) -[:Create]->(studio:Studio) RETURN studio._id',{userId: userId})
	.then(results => {
		let studiosIds = [];
			results.records.forEach(function (record) { //PARA CADA RECORD RECIBIDO
	          	studiosIds.push(record._fields[0]);
	    	});
		return studiosIds;
	})
    .catch((err) => {throw err});
}

//Obtener el propietario de un estudio
var getStudioOwner = function(session, studioId){
	return session.run('MATCH (user: User)-[:Create]->(studio:Studio {_id: $studioId}) RETURN user._id',{studioId: studioId})
	.then(results => {
		if(_.isEmpty(results.records)){
			throw {username: 'Error al obtener el propietario', status: 404}
		}
		return results.records[0].get("user._id");
	})
    .catch((err) => {throw err});
}

//Actualizar un estudio
var update = function (session, studioId, update) {
  return session.run('MATCH (studio:Studio {_id: $id}) SET studio += $update RETURN studio',
  {
    id: studioId,
    update: update
  })
  .then(results => {
    if (_.isEmpty(results.records)) {
    	throw {username: 'El estudio no ha sido actualizado', status: 404}
    }
    else{
    	return new Studio(results.records[0]._fields[0]);
    }
  })
  .catch( err => {throw err})
};

var checkIfPatientIsInStudy = function (session, studioId, patientId) {
 return session.run('MATCH (patient:patients {_id: $patientId})-[r:Attend]->(studio:Studio {_id: $studioId}) RETURN r',
  {
    studioId: studioId,
    patientId: patientId
  })
  .then(results => {
    if (_.isEmpty(results.records)) {
    	return false;
    }
    else{
    	return true;
    }
  })
  .catch( err => {
    throw {username: err, status: 400}
  })
 };

var addPatient = function (session, studioId, patientId) {
 return session.run('MATCH (studio:Studio {_id: $studioId}), (patient:patients {_id: $patientId}) CREATE (patient)-[:Attend]->(studio) RETURN studio',
  {
    studioId: studioId,
    patientId: patientId
  })
  .then(results => {
    if (_.isEmpty(results.records)) {
    	throw {username: 'El estudio no ha sido actualizado', status: 404}
    }
    else{
    	return new Studio(results.records[0]._fields[0]);
    }
  })
  .catch( err => {
    throw {username: err, status: 400}
  })
};

var removePatient = function (session, studioId, patientId) {
 return session.run('MATCH (patient:patients {_id: $patientId})-[r:Attend]->(studio:Studio {_id: $studioId}) DELETE r RETURN patient._id',
  { studioId: studioId, patientId: patientId })
  .then(results => {
    if (_.isEmpty(results.records)) {
    	throw {username: 'El estudio no ha sido actualizado', status: 404}
    }
    else{
    	return results.records[0]._fields[0];
    }
  })
  .catch( err => {
    throw {username: err, status: 400}
  })
};

//Buscar estudios por nombre
//https://neo4j.com/docs/developer-manual/current/cypher/clauses/where/
var searchStudiosByName = function (session, keyword, userId){
	var lowKeyword = keyword.toLowerCase();
	var expression = '(?i)'+lowKeyword+'.*';
	return session.run("MATCH (studio:Studio{privacy:'public'})<-[:Create]-(user:User)  WHERE user._id <> $userId AND (studio.name =~ $expression OR studio.name CONTAINS $keyword) RETURN studio, user._id, user.name, user.asurname, user.msurname", 
		{expression: expression,
		keyword: lowKeyword,
		userId: userId
		})
	.then(results => {
		if(_.isEmpty(results.records)){
			throw {username: 'No hay estudios', status: 404}
		}
		else{
			var studios = [];
			results.records.forEach(function (record) { //PARA CADA RECORD RECIBIDO
				//      studio,             u._id         u.name,        u.asurname,        u.msurname
				//record._fields[0],record._fields[1],record._fields[2],record._fields[3],record._fields[4]
            	studios.push(new SharedStudio(record._fields[0], record._fields[1], record._fields[2], record._fields[3], record._fields[4]));
        	});
			return studios;
		}
	})
	.catch(  err => {throw err})
 }

 //Eliminar estudio
var deleteStudio = function (session, studioId) {
  return session.run('MATCH (studio:Studio {_id: $id}) WITH studio, studio._id as id DETACH DELETE studio RETURN id',{ id: studioId })
  .then(results => {
    if (_.isEmpty(results.records)) {
    	throw {username: 'El estudio no ha sido eliminado', status: 404}
    }
    else{
    	return results.records[0]._fields[0];
    }
  })
  .catch( err => { throw err })
};

var getStepsIds = function (session, studioId){
	return session.run('MATCH (studio:Studio {_id: $studioId}) -[:Has]->(step:steps) RETURN step._id ',{studioId: studioId})
	.then(results => {
		var stepsIds = [];
			results.records.forEach(function (record) { //PARA CADA RECORD RECIBIDO
	          	stepsIds.push(record._fields[0]);
	    	});
		return stepsIds;
	})
    .catch((err) => {throw err});
}

module.exports = {
	create: create,
	update: update,
	getStudioOwner,
	getUserStudiosList,
	getAllStudiosList,
	getStudio,
	addPatient,
	removePatient,
	checkIfPatientIsInStudy,
	getAllStudiosListButNotMine,
	searchStudiosByName,
	deleteStudio,
	getStepsIds,
	getUserStudiosIds
}

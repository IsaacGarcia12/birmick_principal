"use strict"

var uuid = require('uuid');
var _ = require('lodash');
var dbUtils = require('../../neo4j/dbUtils');
var Patient = require('./schemas/patient'); //Modelo del paciente


/////////////////////// MÉTODO PARA REGISTRAR A UN PACIENTE ///////////////////////////
var register = function (session, userId, name, asurname, msurname, age, gender, weight, height, mainActivity) {
  return session.run('MATCH (user:User {_id: $userId}) CREATE (patient:patients:Document { _id: $id, name: $name, asurname: $asurname, msurname: $msurname, age: $age, gender: $gender, weight: $weight, height: $height, mainActivity: $mainActivity})<-[relation:Register]-(user) RETURN patient',
	{
		userId: userId,
		id: uuid.v1(), //Genera un id, tomando como base un timestamp (https://www.npmjs.com/package/uuid)
		name: name,
		asurname: asurname,
		msurname: msurname,
		age: age,
		gender: gender,
		weight: weight,
		height: height,
		mainActivity: mainActivity
	})
	.then(results => {
		if (_.isEmpty(results.records)) {
    		throw {username: 'El paciente no ha sido creado', status: 404}
        console.log(results);
    	}
    	else{
    		return new Patient(results.records[0]._fields[0]);
    	}
    })
    .catch( err => {throw err})
}

/////////////////////// MÉTODO PARA ACTUALIZAR A UN PACIENTE ///////////////////////////
var update = function (session, patientId, update) {
  return session.run('MATCH (patient:patients {_id: $id}) SET patient += $update RETURN patient',
  {
    id: patientId,
    update: update
  })
  .then(results => {
    if (_.isEmpty(results.records)) {
    	throw {username: 'El paciente no ha sido actualizado', status: 404}
    }
    else{
    	return new Patient(results.records[0]._fields[0]);
    }
  })
  .catch( err => {
    throw err
  })
};

/////////////////////// MÉTODO PARA OBTENER EL PROPIETARIO DE UN PACIENTE ///////////////////////////
var getPatientOwner = function(session, patientId){
	return session.run('MATCH (patient:patients{_id: $patientId})<-[r:Register]-(user:User) RETURN user._id',{patientId: patientId})
	.then(results => {
		if(_.isEmpty(results.records)){
			throw {username: 'Error al editar al obtener el propietario', status: 404}
      console.log(err);
		}
		return results.records[0].get("user._id");
	})
    .catch((err) => {throw err});
}

/////////////////////// MÉTODO PARA RECUPERAR LA LISTA DE PACIENTES ///////////////////////////
var getPatientList = function (session, userId) {
  return session.run('MATCH (patient:patients)<-[r:Register]-(user:User{_id: $userId}) RETURN patient',{userId: userId})
  .then(results => {
    //console.log(results.records);
    if(_.isEmpty(results.records)){
      throw {username: 'No hay pacientes registrados', status: 404}
    }
    else{
      // console.log(results.records);
      var patients = [];
      //console.log("Despues de patients");
      results.records.forEach(function (record) { //PARA CADA RECORD RECIBIDO
              patients.push(new Patient(record._fields[0])); //Mete a los pacientes en un arreglo
          });
      return patients;
    }
    })
    .catch((err) => {throw err});
}

/////////////////////// MÉTODO PARA RECUPERAR LA LISTA DE IDS DE PACIENTES ///////////////////////////
var getPatientIds = function (session, userId) {
	return session.run('MATCH (patient:patients)<-[r:Register]-(user:User{_id: $userId}) RETURN patient._id',{userId: userId})
  .then(results => {
    var patientsIds = [];
      results.records.forEach(function (record) { //PARA CADA RECORD RECIBIDO
              patientsIds.push(record._fields[0]);
        });
    return patientsIds;
  })
    .catch((err) => {throw err});
}

/////////////////////// MÉTODO PARA RECUPERAR UN PACIENTE///////////////////////////
var getPatient = function (session, patientId) {
	return session.run('MATCH (patient:patients {_id:$id}) RETURN patient',{id: patientId})
	.then(results => {
		if(_.isEmpty(results.records)){
			throw {username: 'No se puede recuperar el paciente', status: 404}
		}
		else{
    		return new Patient(results.records[0]._fields[0]);
		}
    })
    .catch((err) => {throw {username: err, status:400}});
}
var getPatientsInTheStudio = function (session, studioId) {
 return session.run('MATCH (patient:patients)-[:Attend]-> (studio:Studio {_id: $studioId}) RETURN patient',
  {
    studioId: studioId
  })
  .then(results => {
    if (_.isEmpty(results.records)) {
    	throw {username: 'No hay pacientes en el estudio', status: 404}
    }
    else{
		var patients = [];
		results.records.forEach(function (record) { //PARA CADA RECORD RECIBIDO
			//console.log(record._fields[0]);
           	patients.push(new Patient(record._fields[0]));
       	});
		return patients;    
	}
  })
  .catch( err => {throw err})
}; 

//Listar los pacientes en un estudio
var getPatientsInTheStudio = function (session, studioId) {
 return session.run('MATCH (patient:patients)-[:Attend]-> (studio:Studio {_id: $studioId}) RETURN patient',
  {
    studioId: studioId
  })
  .then(results => {
    if (_.isEmpty(results.records)) {
    	throw {username: 'No hay pacientes en el estudio', status: 404}
    }
    else{
		var patients = [];
		results.records.forEach(function (record) { //PARA CADA RECORD RECIBIDO
           	patients.push(new Patient(record._fields[0]));
       	});
		return patients;    
	}
  })
  .catch( err => {throw err})
}; 

//Listar los pacientes que no están en un estudio
var getPatientsThatAreNotInTheStudio = function (session, studioId, userId) {
 return session.run('MATCH (:User{_id:$userId})-[:Register]->(patient:patients) WHERE NOT ((patient)-[:Attend]->(:Studio {_id:$studioId})) RETURN patient',
  {
  	userId: userId,
    studioId: studioId
  })
  .then(results => {
    if (_.isEmpty(results.records)) {
    	throw {username: 'No hay pacientes', status: 404}
    }
    else{
		var patients = [];
		results.records.forEach(function (record) { //PARA CADA RECORD RECIBIDO
           	patients.push(new Patient(record._fields[0]));
       	});
		return patients;    
	}
  })
  .catch( err => {throw err})
}; 


//Eliminar paciente y todas sus relaciones
var deletePatient = function (session, patientId) {
	return session.run('MATCH ( patient:patients {_id:$id} ) WITH patient, patient._id as id DETACH DELETE patient RETURN id',{id: patientId})
  .then(results => {
    if (_.isEmpty(results.records)) {
      throw {username: 'El paciente no ha sido eliminado', status: 404}
    }
    else{
      return results.records[0]._fields[0];
    }
  })
  .catch( err => { throw err })
};

module.exports = {
  register: register,
  update: update,
  getPatientOwner,
  getPatientList,
  getPatient,
	getPatientsInTheStudio,
	getPatientsThatAreNotInTheStudio,
  deletePatient,
  getPatientIds
}
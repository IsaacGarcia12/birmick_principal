'use strict'

var config = require('../config');
var Patients = require('../models/neo4j/patients');
var FileMongo = require('../models/mongodb/files');
var Studios = require('../models/neo4j/studios');
var Security = require('./security');
var dbUtils = require('../neo4j/dbUtils');
var _ = require('lodash');


///// FUNCION PARA HACER LA MAYUSCULA LA PRIMER LETRA DE UN STRING Y LAS DEMAS EN MINUSCULAS ///////////
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

/////////////////////// MÉTODO PARA REGISTRAR A UN PACIENTE ///////////////////////////
function register(req, res){
	var params = req.body;

	//Recoger el id del usuario que registra al paciente
	if (!params.userId){
		return res.status(400).send({message: 'Id del usuario no provisto'});
	}
	
	//Verificar que el usuario que registra al paciente es quien dice ser
	if(req.user.id != params.userId){ //Si no es el propietario de los pacientes
		return res.sendStatus(401);
	}
	
	//Si la información está completa
	if(params.userId != null && params.name != null && params.asurname != null && params.msurname != null  &&  params.age != null && params.gender != null && params.weight != null && params.height != null){
		//Obtener la subclave del usuario para cifrar la información de los pacientes
		Security.getSubkey(dbUtils.getSession(req), params.userId)
		.then( subkey => {
			for(var prop in params){
				if(prop != 'userId'){
					if(params[prop]){
						if(prop == 'name' || prop == 'asurname' || prop == 'msurname')
							params[prop] = Security.encryptPlain(capitalize(params[prop].toString()), subkey.toString());
						else
							params[prop] = Security.encryptPlain(params[prop].toString(), subkey.toString());
					}
				}
			}
			//Registrar al paciente
			Patients.register(
				dbUtils.getSession(req), //Session
				params.userId,
				params.name,
				params.asurname,
				params.msurname, 
				params.age,
				params.gender,
				params.weight,
				params.height,
				params.mainActivity
			)
		    .then(patient => {res.status(200).send(patient);}) //Devolver los datos del paciente almacenado
		    .catch(function (err) {console.log(err); res.status(err.status).send({message: err.username});}) //Si ocurre un error
		})
		.catch(function (err) {
			//res.status(err.status).send({message: err.username});
			console.log(err);
		}) //Si ocurre un error
	}
	else{
		res.status(400).send({message: 'Rellena todos los datos'});
	}
}

/////////////////////// MÉTODO PARA EDITAR A UN PACIENTE ///////////////////////////

function update(req, res){
	var update = req.body;
	var patientId = req.params.id;

	if(!patientId){
		return res.status(400).send({message: 'No se ha proveido un paciente'});
	}

	Patients.getPatientOwner(dbUtils.getSession(req),patientId)
	.then(userId => {
		if(req.user.id != userId ){ //Si no es el propietario del paciente
			return res.sendStatus(401);
		}
		//Si la información está completa
		if(update.name != null && update.asurname != null && update.msurname != null  &&  update.age != null && update.gender != null && update.weight != null && update.height != null){
		//Obtener la subclave del usuario para cifrar la información de los pacientes
			Security.getSubkey(dbUtils.getSession(req), userId)
			.then( subkey => {
				for(var prop in update){
					if(update[prop]){
						if(prop == 'name' || prop == 'asurname' || prop == 'msurname')
							update[prop] = Security.encryptPlain(capitalize(update[prop].toString()), subkey.toString());
						else
							update[prop] = Security.encryptPlain(update[prop].toString(), subkey.toString());
					}
				}
				//Registrar al usuario
				Patients.update(
					dbUtils.getSession(req), //Session
					patientId,
					{
						name: update.name,
						asurname: update.asurname,
						msurname: update.msurname,
						age: update.age, 
						gender: update.gender,
						weight: update.weight,
						height: update.height, 
						mainActivity: update.mainActivity
					}				
				)
			    .then(patient => {res.status(200).send(patient);}) //Devolver los datos del paciente almacenado
			    .catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
			    // .catch(next);
			})
			.catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
		}
		else{
			res.status(400).send({message: 'Rellena todos los datos'});
		}
	})
	.catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
}

/////////////////////// MÉTODO PARA  RECUPERAR LA LISTA DE LOS PACIENTES DE UN USUARIO //////////////////
function getPatientList(req, res){
	var userId = req.params.id;

	if(!userId){
		return res.status(400).send({message: 'No se ha proveido el usuario'});
	}

	if(req.user.id != userId){ //Si no es el propietario de los pacientes
		return res.sendStatus(401);
	}

	//Obtener la subclave del usuario para cifrar la información de los pacientes
	Security.getSubkey(dbUtils.getSession(req), userId)
	.then( subkey => {
		Patients.getPatientList(dbUtils.getSession(req), userId)
		.then(patientsEnc => {
			let patients = [];
			patientsEnc.forEach(patient => {
				for(var prop in patient){
					if(prop != '_id')
						//Descifrar la propiedad del paciente
						if(patient[prop])
							patient[prop] = Security.decryptPlain(patient[prop].toString(), subkey);
				}
				patients.push(patient);
			})
			res.status(200).send({patients});
		})
		.catch(function (err) {console.log(err); res.status(err.status).send({message: err.username});}) //Si ocurre un error
	})
	.catch(function (err) {console.log(err); res.status(err.status).send({message: err.username});}) //Si ocurre un error
}

/////////////////////// MÉTODO PARA RECUPERAR UN PACIENTE //////////////////
function getPatient(req, res){
	var patientId = req.params.id;

	if(!patientId){
		return res.status(400).send({message: 'No se ha proveido un paciente'});
	}

	Patients.getPatientOwner(dbUtils.getSession(req),patientId)
	.then(userId => {
		if(req.user.id != userId ){ //Si no es el propietario del paciente
			return res.sendStatus(401);
		}
			//Obtener la subclave del usuario para cifrar la información de los pacientes
		Security.getSubkey(dbUtils.getSession(req), userId)
		.then( subkey => {
			Patients.getPatient(dbUtils.getSession(req), patientId)
			.then(patient => { 
				for(var prop in patient){
					if(prop != '_id')
						if(patient[prop])
						patient[prop] = Security.decryptPlain(patient[prop].toString(), subkey);
				}
				res.status(200).send({patient});
			})
			.catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error})
		.catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
		})
	})
	.catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
}

//Listar los pacientes de un estudio
function getPatientsInTheStudio(req, res){
	var studioId = req.params.id;
	//Checar al propietario del estudio
	Studios.getStudioOwner(dbUtils.getSession(req),studioId)
	.then(userId => {
		if(req.user.id != userId ){ //Si no es el propietario del estudio
			return res.sendStatus(401);
		}
		//Obtener la subclave del usuario para cifrar la información de los pacientes
		Security.getSubkey(dbUtils.getSession(req), userId)
		.then( subkey => {
			Patients.getPatientsInTheStudio(dbUtils.getSession(req), studioId)
			.then(patientsEnc => {
				let patients = [];
				patientsEnc.forEach(patient => {
					for(var prop in patient){
						if(prop != '_id')
							//Descifrar la propiedad del paciente
							if(patient[prop])
								patient[prop] = Security.decryptPlain(patient[prop].toString(), subkey);
					}
				patients.push(patient);
				})
				res.status(200).send(patients);
			})
			.catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
		})
		.catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
	})
	.catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
}


//Listar los pacientes que no están en un estudio
function getPatientsThatAreNotInTheStudio(req, res){
	var studioId = req.params.id;
	//Checar al propietario del estudio
	Studios.getStudioOwner(dbUtils.getSession(req),studioId)
	.then(userId => {
		if(req.user.id != userId ){ //Si no es el propietario del estudio
			return res.sendStatus(401);
		}
		//Obtener la subclave del usuario para cifrar la información de los pacientes
		Security.getSubkey(dbUtils.getSession(req), userId)
		.then( subkey => {
			Patients.getPatientsThatAreNotInTheStudio(dbUtils.getSession(req), studioId, userId)
			.then(patientsEnc => {
				let patients = [];
				patientsEnc.forEach(patient => {
					for(var prop in patient){
						if(prop != '_id')
							//Descifrar la propiedad del paciente
							if(patient[prop])
								patient[prop] = Security.decryptPlain(patient[prop].toString(), subkey);
					}
					patients.push(patient);
				});
				res.status(200).send(patients);
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


/////////////////////// MÉTODO PARA ELIMINAR UN PACIENTE //////////////////
function deletePatient(req, res){
	var patientId = req.params.id;

	if(!patientId){
		return res.status(400).send({message: 'No se ha provisto un paciente'});
	}

	Patients.getPatientOwner(dbUtils.getSession(req),patientId)
	.then(userId => {
		if(req.user.id != userId ){ //Si no es el propietario del paciente
			return res.sendStatus(401);
		}
		//Eliminar los archivos del paciente
		FileMongo.remove({ patients_id: patientId }).exec((err) =>{
			if(err){
				res.status(500).send({message: "Error en la petición"});
			}
		});
		Patients.deletePatient(dbUtils.getSession(req), patientId)
		.then(deletedPatient => { res.status(200).send({deletedPatient});})
		.catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
	})
	.catch();
}

module.exports = {
	register,
	update,
	getPatientList,
	getPatient,
	getPatientsInTheStudio,
	getPatientsThatAreNotInTheStudio,
	deletePatient
};

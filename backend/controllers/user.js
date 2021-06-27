/*
EN ESTA VERSIÓN SE LE ASIGNA LA SUBCLAVE AL USUARIO HASTA QUE ES VALIDADO,
LA VALIDACIÓN SE CONTROLA A PARTIR DEL CAMPO SUBKEY,
HACERLO ASÍ PREVIENE QUE SE NO SE DESPERDICIEN SUBCLAVES EN USUARIOS QUE AÚN NO SE VALIDAN Y POR TANTO NO TENDRÍAN ACCESO A LA CLAVE SECRETA
*/

'use strict'

var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var config = require('../config');
var Users = require('../models/neo4j/users');
var Studios = require('../models/neo4j/studios');
var Patients = require('../models/neo4j/patients');
var Steps = require('../models/neo4j/steps');
var FileMongo = require('../models/mongodb/files');
var FormMongo = require('../models/mongodb/form');
var AnsweredForm = require('../models/mongodb/answeredForm');
var dbUtils = require('../neo4j/dbUtils')
var _ = require('lodash');


///// FUNCION PARA HACER LA MAYUSCULA LA PRIMER LETRA DE UN STRING Y LAS DEMAS EN MINUSCULAS ///////////
function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

/////////////////////// MÉTODO PARA REGISTRAR A UN USUARIO ///////////////////////////
function register(req, res){
	var params = req.body;
	if(params.password){
		//"Cifrar" contraseña y guardar datos
		bcrypt.hash(params.password, null, null, function(err,hash){
			//Si la información está completa
			if(params.username != null && params.name != null && params.asurname != null && params.msurname != null  &&  params.email != null && params.gender != null){
					//Registrar al usuario
					Users.register(
						dbUtils.getSession(req), //Session
						params.username.toLowerCase(), 
						capitalize(params.name), 
						capitalize(params.asurname), 
						capitalize(params.msurname), 
						params.email.toLowerCase(), 
						params.gender,
						'ROLE_VISITOR', //role
						null, //subkey
						hash //password
					)
				    .then(userRegistered => {res.status(200).send({userRegistered: userRegistered});}) //Devolver los datos del usuario almacenado
				    .catch(function(err){
						console.log(err);
						//res.status(err.status).send({message: err.username});
					}); //Si ocurre un error
				    // .catch(next);
				}
			else{
				res.status(400).send({message: 'Rellena todos los datos'});
			}
		});
	}
	else{
		res.status(400).send({message: 'Introduce la contraseña'});
	}
}

/////////////////////// MÉTODO PARA ACTUALIZAR A UN USUARIO ///////////////////////////
function updateUser(req, res){
	var userId = req.params.id;
	var params = req.body;

	//Comprobar si el userId es igual que el id que viene en el token
	if(req.user.role != 'ROLE_ADMIN'){
		return res.sendStatus(401);
	}

	//Si la información está completa
	if(params.name != null && params.asurname != null && params.msurname != null && params.role != null){
		//Registrar al usuario
		Users.update(
			dbUtils.getSession(req), //Session
			userId,
			params.name, 
			capitalize(params.asurname), 
			capitalize(params.msurname),
			params.role
		)
		.then(response => {res.status(200).send(response);}) //Devolver los datos del usuario almacenado
		.catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
		  // .catch(next);
	}
	else{
		res.status(400).send({message: 'Rellena todos los datos'});
	}

}
function isEmail(email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

// /////////////////////// MÉTODO PARA EL LOGIN ///////////////////////////
function loginUser(req, res){
	var params = req.body;
	var identifier = params.identifier;
	var password = params.password;

	if (identifier && password) {
		//Si se introduce un email
		if(isEmail(identifier)){
			Users.loginByEmail(dbUtils.getSession(req), identifier, password)
				.then( user => {
						//console.log(user);
						bcrypt.compare(password, user.password, function(err,check){
							if(check){
								if (user.subkey) {delete user.subkey;}
								if (user.password) {delete user.password;}1
								if(params.gethash){
								//Devolver un token de jwt
								res.status(200).send({
									token: jwt.createToken(user)
									});
								}
								else{
									//Devolver los datos del usuario loggeado
									res.status(200).send({user});
								}
							}
							else{
								res.status(422).send({message: 'Contraseña incorrecta'});
							}
						});
					}
				)
				.catch(function (err) {
				//console.log(err);
				res.status(err.status).send({message: err.username});}) //Si ocurre un error
		}
		//Si se introduce un nombre de usuario
		else{
			Users.loginByUsername(dbUtils.getSession(req), identifier, password)
				.then( user => {
						//console.log(user);
						bcrypt.compare(password, user.password, function(err,check){
							if(check){
								if (user.subkey) {delete user.subkey;}
								if (user.password) {delete user.password;}1
								if(params.gethash){
								//Devolver un token de jwt
								res.status(200).send({
									token: jwt.createToken(user)
									});
								}
								else{
									//Devolver los datos del usuario loggeado
									res.status(200).send({user});
								}
							}
							else{
								res.status(422).send({message: 'Contraseña incorrecta'});
							}
						});
					}
				)
				.catch(function (err) {
				console.log(err);});
				//res.status(err.status).send({message: err.username});}) //Si ocurre un error
		}
	}
	else{
		res.status(400).send({message: 'Rellene todos los datos'});
	}
}

// /////////////////////// MÉTODO PARA VALIDAR UN USUARIO, ASIGNARLE UNA SUBCLAVE Y UN ROL///////////////////////////
function validateUser(req, res){
	var userId = req.params.id;
	var newRole = req.body.role;
	if(!newRole)
		return res.status(400).send({message: "Nuevo rol no provisto"});
	if(newRole != "ROLE_ADMIN" && newRole != "ROLE_PROJMANAG" && newRole != "ROLE_RESCH")
		return res.status(400).send({message: "Rol inválido"});
  	Users.verify(dbUtils.getSession(req), userId, newRole)
  	.then(user => {res.status(200).send({user});})
	.catch(function (err) {
		res.status(err.status).send({message: err.username});
		console.log(err);
	}) //Si ocurre un error
}

//Obtener a los usuarios no validados
function getNotValidatedUsers(req, res){
	Users.getNoValidatedUsers(dbUtils.getSession(req))
	.then(users => {res.status(200).send(users);}) //Devolver los datos del estudio
	.catch(function (err) {
		res.status(err.status).send({message: err.username});
		console.log(err);
	}) //Si ocurre un error 
}

//Obtener a los usuarios
function getUsers(req, res){
	Users.getUsers(dbUtils.getSession(req), req.user.id)
	.then(users => {res.status(200).send(users);}) //Devolver los datos del estudio
	.catch(function (err) {console.log(err); res.status(err.status).send({message: err.username});}) //Si ocurre un error
}

//Obtener a los usuarios
function getUser(req, res){
	var userId = req.params.id;
	Users.getUser(dbUtils.getSession(req), userId)
	.then(user => {res.status(200).send(user);}) //Devolver los datos del estudio
	.catch(function (err) {res.status(err.status).send({message: err.username});}) //Si ocurre un error
}

//Eliminar usuario
function deleteUser(req, res){
	//Comprobar si el usuario es administrador
	if(req.user.role != 'ROLE_ADMIN'){
		return res.sendStatus(401);
	}
	var userId = req.params.id;
	//Obtener los estudios del usuario para eliminarlos
	Studios.getUserStudiosIds(dbUtils.getSession(req), userId)
	.then(studiosIds => {
		if(studiosIds){
			//Para cada estudio
			studiosIds.forEach(function (studioId){
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
								.catch(function (err) {console.log(err); return res.status(err.status).send({message: err.username});}) //Si ocurre un error
							})
							.catch(function (err) {console.log(err); return res.status(err.status).send({message: err.username});}) //Si ocurre un error
						})
					}
					//Eliminar estudio independientemente a si tiene etapas o no
					Studios.deleteStudio(dbUtils.getSession(req), studioId)
					.then( studioId  => {})
					.catch(function (err) {console.log(err); return res.status(err.status).send({message: err.username});}) //Si ocurre un error
				})
				.catch(function (err){ console.log(err); return res.status(err.status).send({message: err.username});}) //Si ocurre un error
			})
		}

		//Recuperar los pacientes para eliminarlos
		Patients.getPatientIds(dbUtils.getSession(req), userId)
		.then(patientsIds => {
			//Si hay pacientes
			if(patientsIds){
				//Para cada paciente
				patientsIds.forEach(function (patientId){
					Patients.deletePatient(dbUtils.getSession(req), patientId)
					.then( patientId  => {})
					.catch(function (err) {console.log(err); return res.status(err.status).send({message: err.username});}) //Si ocurre un error
				})
			}

			//Eliminar el nodo correspondiente al usuario, independientemente si tiene o no estudios y/o pacientes
			Users.deleteUser(dbUtils.getSession(req), userId)
			.then( userId  => {return res.status(200).send({userId});})
			.catch(function (err) {console.log(err); return res.status(err.status).send({message: err.username});}) //Si ocurre un error
		})
		.catch(function (err) {console.log(err); return res.status(err.status).send({message: err.username});}) //Si ocurre un error
	})
	.catch(function (err) {console.log(err); return res.status(err.status).send({message: err.username});}) //Si ocurre un error
}

module.exports = {
	register,
	loginUser,
	validateUser,
	updateUser,
	getNotValidatedUsers,
	getUsers,
	getUser,
	deleteUser
};

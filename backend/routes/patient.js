'use strict'

var express = require('express')
var PatientController = require('../controllers/patient')
var md_auth = require('../middlewares/authenticated')

var api = express.Router();

//RUTA PARA REGISTRAR UN USUARIO (UTILIZA POST)
api.post('/register', md_auth.ensureAuth, PatientController.register);

//RUTA PARA EDITAR UN USUARIO (UTILIZA PUT) REQUIERE ESTAR IDENTIFICADO
api.put('/update/:id', md_auth.ensureAuth, PatientController.update);//Requiere el id del usuario ':id', si fuera opcional se pone ':id?'

//RUTA PARA OBTENER LA LISTA DE PACIENTES DE UN USUARIO (UTILIZA GET)
api.get('/getList/:id', md_auth.ensureAuth, PatientController.getPatientList);

//RUTA PARA OBTENER UN PACIENTE (UTILIZA GET)
api.get('/getPatient/:id', md_auth.ensureAuth, PatientController.getPatient);

//RUTA PARA OBTENER A LOS PACIENTES DE UN ESTUDIO
api.get('/getPatientsInTheStudio/:id', md_auth.ensureAuth, PatientController.getPatientsInTheStudio);

//RUTA PARA OBTENER A LOS PACIENTES QUE NO ESTAN EN UN ESTUDIO
api.get('/getPatientsNotInTheStudio/:id', md_auth.ensureAuth, PatientController.getPatientsThatAreNotInTheStudio);

//RUTA PARA ELIMINAR UN PACIENTE (UTILIZA GET)
api.delete('/deletePatient/:id', md_auth.ensureAuth, PatientController.deletePatient);

module.exports = api;

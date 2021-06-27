'use strict'

var express = require('express')
var StudioController = require('../controllers/studio')
var md_auth = require('../middlewares/authenticated')

var api = express.Router();

//RUTA PARA REGISTRAR UN ESTUDIO
api.post('/createStudio', md_auth.ensureAuth, StudioController.createStudio);

//RUTA PARA OBTENER UN ESTUDIO
api.get('/getStudio/:id', md_auth.ensureAuth, StudioController.getStudio);

//RUTA PARA OBTENER UN ESTUDIO VALIDANDO AL PROPIETARIO
api.get('/getStudioByProprietary/:id', md_auth.ensureAuth, StudioController.getStudioByProprietary);

//RUTA PARA OBTENER LOS ESTUDIOS DE UN USUARIO
api.get('/getUserStudios/:id', md_auth.ensureAuth, StudioController.getUserStudios);

//RUTA PARA OBTENER TODOS LOS ESTUDIOS
api.get('/getAllStudios', md_auth.ensureAuth, StudioController.getAllStudios);

//RUTA PARA OBTENER TODOS LOS ESTUDIOS
api.get('/searchStudiosByName/:keyword', md_auth.ensureAuth, StudioController.searchStudiosByName);

//RUTA PARA OBTENER TODOS LOS ESTUDIOS
api.get('/getAllStudiosListButNotMine/', md_auth.ensureAuth, StudioController.getAllStudiosListButNotMine);

//RUTA PARA ACTUALIZAR UN ESTUDIO
api.put('/updateStudio/:id', md_auth.ensureAuth, StudioController.updateStudio);

//RUTA PARA AÑADIR UN PACIENTE
api.put('/addPatient', md_auth.ensureAuth, StudioController.addPatient);

//RUTA PARA AÑADIR UN PACIENTE
api.put('/removePatient', md_auth.ensureAuth, StudioController.removePatient);

//RUTA PARA ELIMINAR UN ESTUDIO
api.delete('/deleteStudio/:id', md_auth.ensureAuth, StudioController.deleteStudio);

module.exports = api;

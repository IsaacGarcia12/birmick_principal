'use strict'

var express = require('express')
var FileController = require('../controllers/file')
var md_auth = require('../middlewares/authenticated')

var api = express.Router();

//RUTA PARA GUARDAR UN ARCHIVO (UTILIZA POST)
api.post('/saveFile/:stepsId/:patientsId', md_auth.ensureAuth, FileController.saveFile);

//RUTA PARA DESCAGAR UN ARCHIVO
api.get('/downloadFile/:id', md_auth.ensureAuth, FileController.downloadFile);

//RUTA PARA DESCAGAR UN ARCHIVO
api.get('/getStepFiles/:id', md_auth.ensureAuth, FileController.getStepFiles);

//RUTA PARA DESCAGAR UN ARCHIVO
api.get('/getStepFilesByPatient/:id', md_auth.ensureAuth, FileController.getStepFilesByPatient);

api.get('/getStepFilesWithoutPatient/:id', md_auth.ensureAuth, FileController.getStepFilesWithoutPatient);

//RUTA PARA DESCAGAR UN ARCHIVO
api.get('/getStudioFiles/:id', md_auth.ensureAuth, FileController.getStudioFiles);

//RUTA PARA ELIMINAR UN ARCHIVO
api.delete('/deleteFile/:id', md_auth.ensureAuth, FileController.deleteFile);

module.exports = api;

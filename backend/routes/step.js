'use strict'

var express = require('express')
var StepController = require('../controllers/step')
var md_auth = require('../middlewares/authenticated')

var api = express.Router();

api.post('/createStep', md_auth.ensureAuth,  StepController.create);

api.get('/getStep/:id', md_auth.ensureAuth, StepController.getStep);

api.put('/updateStep/:id', md_auth.ensureAuth, StepController.updateStep);

api.get('/validateStepNumber/:studioId/:stepNumber', md_auth.ensureAuth, StepController.validateStepNumber);

//Obtener todas las etpas de un estudio
api.get('/getStepsList/:id', md_auth.ensureAuth, StepController.getStepsList);

//Elimina una etapa y todo lo asociado a ella
api.delete('/deleteStep/:id', md_auth.ensureAuth, StepController.deleteStep);



module.exports = api;
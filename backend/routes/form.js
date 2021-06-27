'use strict'

var express = require('express')
var FormController = require('../controllers/form')
var md_auth = require('../middlewares/authenticated')

var api = express.Router();

//RUTA PARA GUARDAR UN ARCHIVO (UTILIZA POST)
api.post('/createForm/:id', md_auth.ensureAuth, FormController.createForm);

//RUTA PARA GUARDAR UN ARCHIVO (UTILIZA POST)
api.put('/addQuestion/:id', md_auth.ensureAuth, FormController.addQuestion);

api.put('/removeQuestion/:id', md_auth.ensureAuth, FormController.removeQuestion);

api.get('/getForm/:id', md_auth.ensureAuth, FormController.getForm);

api.get('/getStepForms/:id', md_auth.ensureAuth, FormController.getStepForms);

api.post('/answerForm/:id', md_auth.ensureAuth, FormController.answerForm);

api.get('/getAnswersList/:id', md_auth.ensureAuth, FormController.getAnswersList);

api.get('/getAnswers/:id', md_auth.ensureAuth, FormController.getAnswers);

api.delete('/deleteAllFormAnswers/:id', md_auth.ensureAuth, FormController.deleteAllFormAnswers);

api.delete('/deleteAnsweredForm/:id', md_auth.ensureAuth, FormController.deleteAnsweredForm);

api.delete('/deleteForm/:id', md_auth.ensureAuth, FormController.deleteForm);

module.exports = api;

'use strict'

var express = require('express')
var UserController = require('../controllers/user')
var md_auth = require('../middlewares/authenticated')

var api = express.Router();

//RUTA PARA REGISTRAR UN USUARIO (UTILIZA POST)
api.post('/register', UserController.register);

//RUTA PARA ACTUALIZAR UN USUARIO (UTILIZA PUT)
api.put('/update/:id', md_auth.ensureAuth, UserController.updateUser);

//RUTA PARA ACTUALIZAR UN USUARIO (UTILIZA PUT)
api.get('/getUsers', md_auth.ensureAuth, UserController.getUsers);

//RUTA PARA ACTUALIZAR UN USUARIO (UTILIZA PUT)
api.get('/getUser/:id', md_auth.ensureAuth, UserController.getUser);

// //RUTA PARA LOGIN (UTILIZA POST)
api.post('/login', UserController.loginUser);

//RUTA PARA VALIDAR UN USUARIO (UTILIZA PUT)
api.put('/validate/:id', md_auth.ensureAuth, UserController.validateUser);

//RUTA PARA OBTENER LOS USUARIOS NO VALIDADOS (VISITANTES)
api.get('/notValidated', md_auth.ensureAuth, UserController.getNotValidatedUsers);

//RUTA PARA ELIMINAR UN USUARIO
api.delete('/deleteUser/:id', md_auth.ensureAuth, UserController.deleteUser);

module.exports = api;

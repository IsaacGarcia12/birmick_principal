//Un modelo es una representación de una entidad de la base de datos
'use strict'

/**
 * Dependencia utilizada para crear una Aplicación web
 * @requires module:express
 */
var express = require('express');
var fs = require('fs');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var path = require('path');
var secrets = require('secrets.js-grempe');
var fileUpload = require('express-fileupload'); //Necesario para poder cargar archivos


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//cargar rutas
var user_routes = require('./routes/user');
var patient_routes = require('./routes/patient');
var file_routes = require('./routes/file');
var studio_routes = require('./routes/studio');
var step_routes = require('./routes/step');
var form_routes = require('./routes/form');

app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(fileUpload()); //Necesario para poder cargar archivos
// log only 4xx and 5xx responses to console
app.use(morgan('dev', {
  skip: function (req, res) { return res.statusCode < 400 }
}))
 
// log all requests to access.log
app.use(morgan('common', {
  stream: fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})
}))
 
//configurar cabeceras http
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*') //Permite el acceso a la api
  res.header('Access-Control-Allow-Headers','Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Allow-Request-Method');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

//rutas base
//Se cargan las rutas en base a '/api'
app.use('/api/user', user_routes);
app.use('/api/patient', patient_routes);
app.use('/api/file', file_routes);
app.use('/api/studio', studio_routes);
app.use('/api/step', step_routes);
app.use('/api/form', form_routes);

//Configurar ruta de archivos estáticos (javascripts, imagenes, html, etc.)
app.use(express.static(path.join(__dirname, 'dist'))); //dist porque ahí está el build de angular 


// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});



module.exports = app;

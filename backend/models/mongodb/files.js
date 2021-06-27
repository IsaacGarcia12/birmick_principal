'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema; //Esquema de los datos

var FileSchema = Schema({
  name: String,
  data: Buffer, //Arreglo de buffer
  encoding: String,
  mimetype: String,
  hashcode: String,
  steps_id: String, //Apunta al Objeto documento del esquema de la entidad Step
  patients_id: String //Apunta al Objeto documento del esquema de la entidad Step
});

//Exportamos el modelo
//Se va a tener un objeto Step que se va a poder instanciar y automaticamente se le asignan valores al esquema de la base de datos
module.exports = mongoose.model('File', FileSchema);
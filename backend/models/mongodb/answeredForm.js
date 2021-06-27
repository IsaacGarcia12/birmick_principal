'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema; //Esquema de los datos

var AnsweredFormSchema = Schema({
  form_id: {type: Schema.ObjectId, ref: 'Form'},
  answeredAt: {type: Date, default: Date.now},
  answersBy: String,
  answers:{type: Array, default: []}
});

//Exportamos el modelo
//Se va a tener un objeto Step que se va a poder instanciar y automaticamente se le asignan valores al esquema de la base de datos
module.exports = mongoose.model('AnsweredForm', AnsweredFormSchema);
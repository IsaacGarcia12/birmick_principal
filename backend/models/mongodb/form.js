'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema; //Esquema de los datos


var question = Schema({
  	sentence: String,
  	questionType: String,
  	options: {type: [String], default: undefined}
  //},{ _id : false });
});

var FormSchema = Schema({
  name: String,
  steps_id: String,
  questions:{type: [question], default: undefined}
});

//Exportamos el modelo
//Se va a tener un objeto Step que se va a poder instanciar y automaticamente se le asignan valores al esquema de la base de datos
module.exports = mongoose.model('Form', FormSchema);
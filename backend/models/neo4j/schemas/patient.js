// extracts just the data from the query results

var _ = require('lodash'); //El nombre de la variable es '_'

var Patient = module.exports = function (_node) {
  /*

	'_.extend' es una función de lodash (es similar a assign): https://lodash.com/docs/4.17.4#assign

  */
  _.extend(this, {
    '_id': _node.properties['_id'],
    'name':  _node.properties['name'],
    'asurname':  _node.properties['asurname'],
    'msurname':  _node.properties['msurname'],
    'age':  _node.properties['age'], //Funcion para convertir numeros enteros
    'gender':  _node.properties['gender'],
    'weight':  _node.properties['weight'], //Funcion para convertir numeros enteros
    'height':  _node.properties['height'],//Funcion para convertir numeros enteros
    'mainActivity':  _node.properties['mainActivity']
  });
};
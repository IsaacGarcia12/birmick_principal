// extracts just the data from the query results

var _ = require('lodash'); //El nombre de la variable es '_'

var User = module.exports = function (_node) {
  var username = _node.properties['username'];

  /*

	'_.extend' es una función de lodash (es similar a assign): https://lodash.com/docs/4.17.4#assign

  */

  _.extend(this, {
    '_id': _node.properties['_id'],
    'username': _node.properties['username'],
    'name':  _node.properties['name'],
    'asurname':  _node.properties['asurname'],
    'msurname':  _node.properties['msurname'],
    'email':  _node.properties['email'],
    'gender':  _node.properties['gender'],
    'role':  _node.properties['role'],
    'subkey':  _node.properties['subkey'],
    'password':  _node.properties['password']
  });
};
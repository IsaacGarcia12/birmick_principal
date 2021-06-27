// extracts just the data from the query results

var _ = require('lodash'); //El nombre de la variable es '_'

var File = module.exports = function (_node, patientName, patientAsurname, patientMsurname) {
  /*

	'_.extend' es una función de lodash (es similar a assign): https://lodash.com/docs/4.17.4#assign

  */
  _.extend(this, {
    '_id': _node.properties['_id'],
    'name':  _node.properties['name'],
    'patientName':  patientName,
    'patientAsurname': patientAsurname,
    'patientMsurname': patientMsurname
  });
};
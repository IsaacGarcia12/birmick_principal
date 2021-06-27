'use strict'

var _ = require('lodash');
var dbUtils = require('../../neo4j/dbUtils');
var Form = require('./schemas/form'); //Modelo del usuario

var getStepForms = function (session, stepId){
	return session.run('MATCH (step:steps {_id: $stepId})<-[:forms_steps]-(form:forms) RETURN form ORDER BY form.name',{stepId: stepId})
	.then(results => {
		if(_.isEmpty(results.records)){
			throw {username: 'No hay formularios registrados', status: 404}
		}
		else{
			var forms = [];
			results.records.forEach(function (record) { //PARA CADA RECORD RECIBIDO
            	forms.push(new Form(record._fields[0]));
        	});
			return forms;
		}
    })
    .catch((err) => {throw err});
}


module.exports = {
	getStepForms
}
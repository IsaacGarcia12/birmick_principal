'use strict'

var _ = require('lodash');
var dbUtils = require('../../neo4j/dbUtils');
var File = require('./schemas/file'); //Modelo del usuario
var FilePatient = require('./schemas/filePatient'); //Modelo del usuario
var Patient = require('./schemas/patient'); //Modelo del usuario

var getStepFiles = function (session, stepId){
	return session.run('MATCH (step:steps {_id: $stepId})<-[:files_steps]-(file:files) RETURN file ORDER BY file.name',{stepId: stepId})
	.then(results => {
		if(_.isEmpty(results.records)){
			throw {username: 'No hay archivos registrados', status: 404}
		}
		else{
			var files = [];
			results.records.forEach(function (record) { //PARA CADA RECORD RECIBIDO
            	files.push(new File(record._fields[0]));
        	});
			return files;
		}
    })
    .catch((err) => {throw err});
}

var getStepFilesByPatient = function (session, stepId){
	return session.run('MATCH (step:steps {_id: $stepId})<-[:files_steps]-(file:files)-[:files_patients]->(patient:patients) RETURN file, patient._id, patient.name, patient.asurname, patient.msurname order by patient._id',{stepId: stepId})
	.then(results => {
		if(_.isEmpty(results.records)){
			throw {username: 'No hay pacientes con archivos en la etapa', status: 404}
		}
		else{
			var files = [];
			results.records.forEach(function (record) { //PARA CADA RECORD RECIBIDO
            	files.push(new FilePatient(record._fields[0], record._fields[2], record._fields[3], record._fields[4]));
        	});
        	return files;
		}
    })
    .catch((err) => {
		//throw err
		console.log(err);
	});
}

var getStepFilesWithoutPatient = function (session, stepId){
	return session.run('MATCH (step:steps {_id: $stepId})<-[:files_steps]-(file:files)-[:files_patients]->(patient:patients) RETURN file, patient._id, patient.name, patient.asurname, patient.msurname order by patient._id',{stepId: stepId})
	.then(results => {
		if(_.isEmpty(results.records)){
			throw {username: 'No hay pacientes con archivos en la etapa', status: 404}
		}
		else{
			var files = [];
			var currentPatient;
			var patCount = 0;
			results.records.forEach(function (record){ //PARA CADA RECORD RECIBIDO
				if( currentPatient !== record._fields[1] || !currentPatient){
					currentPatient = record._fields[1];
					patCount++;
				}
            	files.push(new FilePatient(record._fields[0], "Sujeto " + patCount, "", ""));
        	});
        	return files;
		}
    })
    .catch((err) => {
		//throw err
		console.log(err);
	});
}

var getStudioFiles = function (session, studioId){
	return session.run('MATCH (studio:Studio {_id: $studioId})-[:Has]->()<-[:files_steps]-(file:files) RETURN file ORDER BY file.name',{studioId: studioId})
	.then(results => {
		if(_.isEmpty(results.records)){
			throw {username: 'No hay archivos registrados', status: 404}
		}
		else{
			var files = [];
			results.records.forEach(function (record) { //PARA CADA RECORD RECIBIDO
            	files.push(new File(record._fields[0]));
        	});
			return files;
		}
    })
    .catch((err) => {throw err});
}

var getFilePatient = function (session, fileId){
	console.log(fileId);
	return session.run('MATCH (file:files {_id: $fileId})-[:files_patients]->(patient:patients) RETURN patient.name, patient.asurname, patient.msurname',{fileId: fileId})
	.then(results => {
		console.log(results);
		if(_.isEmpty(results.records)){
			// throw {username: 'No se pudo recuperar el paciente del archivo', status: 404}
			return null;
		}
		else{
			var patient;
			patient = results.records[0]._fields[0] + " " + results.records[0]._fields[1] + " " + results.records[0]._fields[2];
        	return patient;
		}
    })
    .catch((err) => {throw err});
}

module.exports = {
	getStepFiles,
	getStudioFiles,
	getStepFilesByPatient,
	getFilePatient,
	getStepFilesWithoutPatient
}
//1. Crear la conexión a la base de datos (da igual a qué SDGBD)
//2. Crear servidor de Nodejs para que escuche las peticiones http etc.
'use strict'

//Se carga la librería de Neo4j
//var neo4j = require ('neo4j-driver').v1;
var mongoose = require ('mongoose');
var app = require('./app');
var port = process.env.PORT || 3000;

mongoose.Promise = global.Promise;
//Conexión a la base de datos
mongoose.connect('mongodb://localhost:27017/ProyectoTerminal', {useMongoClient: true})
.then((db)=>{
	console.log("La conexión a MongoDB está funcionado correctamente...");
	app.listen(port, function(){
		console.log("Servidor del api rest del PT escuchando en http://localhost:"+port);
	});
})
.catch((err)=>{
		throw err; //Muestra el error
});

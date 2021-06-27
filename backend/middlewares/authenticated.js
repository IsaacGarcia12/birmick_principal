'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'laclavemasseguradeloeste';

//Comprueba si los datos del Token son correctos
//next para salir del middleware
exports.ensureAuth = function(req, res, next){
	//En caso que no exista el header
	if(!req.headers.authorization)
	{
		//return res.status(403).send({message: 'La petición no tiene la cabecera de autenticación'});
		return res.sendStatus(403);
	}

	var token = req.headers.authorization.replace(/['"]+/g,'');//Quitamos las comillas del token

	try{
		var payload = jwt.decode(token, secret);

		//Si ya ha pasado la fecha de expiración del token
		if(payload.exp<=moment().unix())
		{
			return res.status(200).send({message: 'El token ha expirado'});
		}
	}
	catch(ex){
		//console.log(ex);
		return res.status(200).send({message: 'Token no válido'});
	}

	req.user = payload;
	next();
}

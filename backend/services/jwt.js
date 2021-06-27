'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'laclavemasseguradeloeste';

exports.createToken = function(user){
	var payload = {
		id: user._id,
		name: user.name,
		asurname: user.asurname,
		msurname: user.msurname,
		email: user.email,
		role: user.role,
		//subkey: user.subkey,
		//image: user.image,
		iat: moment().unix(), //Fecha de creación del token (en formato UNIX timestamp)
		exp: moment().add(30,'days').unix() //Fecha de expiración (Cada 30 días)

	};

	return jwt.encode(payload, secret);
};

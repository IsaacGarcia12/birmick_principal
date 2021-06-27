'use strict'

var uuid = require('uuid');
var _ = require('lodash');
var dbUtils = require('../../neo4j/dbUtils');
var User = require('./schemas/user'); //Modelo del usuario
var jwt = require('../../services/jwt'); 
var config = require('../../config');
var secrets = require('secrets.js-grempe');


/////////////////////// MÉTODO PARA REGISTRAR A UN USUARIO ///////////////////////////
var register = function (session, username, name, asurname, msurname, email, gender, role, subkey, password) {
  /**********  Verificar si el username ya está registrado    ***********/
  return session.run('MATCH (user:User {username: $username}) RETURN user', {username: username})
    .then(results => {
      if (!_.isEmpty(results.records)) {
        throw {username: 'El username ya ha sido registrado', status: 400}
      }
      else {
        /**********  Verificar si el email ya ha sido registrado ***********/
        return session.run('MATCH (user:User {email: $email}) RETURN user', {email: email})
        .then(results => {
          if (!_.isEmpty(results.records)) {
            throw {username: 'El email ya ha sido registrado', status: 400}
          }
          else {
            return session.run('CREATE (user:User {_id: $id, username: $username, name: $name, asurname: $asurname, msurname: $msurname, email: $email, gender: $gender, role: $role, subkey: $subkey, password: $password}) RETURN user',
              {
                id: uuid.v1(), //Genera un id, tomando como base un timestamp (https://www.npmjs.com/package/uuid)
                username: username,
                name: name,
                asurname: asurname,
                msurname: msurname,
                email: email,
                gender: gender,
                role: role,
                subkey: subkey,
                password: password
              }
            )
            .then(results => {
              return new User(results.records[0]._fields[0]);
            })
            .catch( err => {
                throw {username: err, status: 400}
                console.log(err);
            })
          }
        });
      }
    });
};

/////////////////////// MÉTODO PARA ACTUALIZAR A UN USUARIO ///////////////////////////
var update = function (session, userId,  name, asurname, msurname, role) {
  return session.run('MATCH (user:User {_id: $id}) SET user += $update RETURN user',
  {
    id: userId,
    update : {
      name: name,
      asurname: asurname,
      msurname: msurname,
      role: role
    }
  })
  .then(results => {
    if (_.isEmpty(results.records)) {
      throw {username: 'El usuario no ha sido actualizado', status: 404}
    }
    else{
      return {userId, name, asurname, msurname};
    }
  })
  .catch( err => { throw {username: err, status: 400} })
};


/////////////////////// MÉTODO PARA EL LOGIN POR EMAIL ///////////////////////////

var loginByEmail = function (session, email, password) {
  return session.run('MATCH (user:User {email: $email}) RETURN user', {email: email})
    .then(results => {
        if (_.isEmpty(results.records)) {
          throw {username: 'El correo  no existe', status: 400}
        }
        else {
         return new User(results.records[0]._fields[0]);
        }
      })
    .catch( err => {throw err});
};

/////////////////////// MÉTODO PARA EL LOGIN POR NOMBRE DE USUARIO ///////////////////////////

var loginByUsername = function (session, username, password) {
  return session.run('MATCH (user:User {username: $username}) RETURN user', {username: username})
    .then(results => {
        if (_.isEmpty(results.records)) {
          throw {username: 'El nombre de usuario no existe', status: 400}
        }
        else {
         return new User(results.records[0]._fields[0]);
        }
      })
    .catch( err => {throw err});
};


/////////////////////// MÉTODO PARA VALIDAR UN USUARIO, ASIGNARLE UNA SUBCLAVE Y UN ROL///////////////////////////

var verify = function (session, userId, role) {
  var subkeys = [config.srvK]; //Inicializa el arreglo con la subclave del servidor
  return session.run('MATCH (user:User {_id: $id}) RETURN user.subkey as subkey, user.role as role', {id: userId})
    .then(results => {
        if (_.isEmpty(results.records)) {
          throw {username: 'El usuario no existe', status: 400};
          console.log(results);
        }
        else {
          var userSk = results.records[0].get('subkey');
          var userRole = results.records[0].get('role');
          if (userSk && userRole) { //Si el usuario existe pero ya fue validado
            throw {username: 'El usuario ya ha sido validado y tiene un rol asignado', status: 400}
          }
          // else if(userSk && !userRole){
          //   throw {username: 'El usuario ya ha sido validado pero no tiene rol asignado', status: 400}
          // }
          // else if(userRole && !userSk){
          //   throw {username: 'El usuario aún no ha sido validado pero tiene rol asignado', status: 400}
          // }
          else{
            return session.run('MATCH (u:User) RETURN u.subkey AS subkey')
            .then( results => {
               results.records.forEach(function(result){
                if(result.get('subkey')){ //Si la subclave no es null
                  subkeys.push(result.get('subkey')) //Almacena en el arreglo las subclaves que estan almacenadas en la base de datos
                }
              });
                 if(subkeys.length <= 1){ //Si no hay al menos dos subclaves
                  throw {username: 'No se ha podido obetener una nueva sk para el usuario', status: 404}
                }
              else{
                var newsubKey = secrets.newShare(subkeys.length+1, subkeys); //Obtiene la nueva subclave
                //Actualizar el usuario
                return session.run('MATCH (user:User {_id: $id}) SET user.subkey = $subkey, user.role = $role RETURN user', 
                  {id: userId,
                  subkey: newsubKey,
                  role: role
                  })
                .then(results => {return new User(results.records[0]._fields[0]);})
                }
          });
        }
      }
    })
    .catch( err => { throw {username: err, status: 400} })
};

//Obtener a todos los usuarios que no han sido validados
var getNoValidatedUsers = function (session){
  return session.run("MATCH (user:User {role: 'ROLE_VISITOR'}) RETURN user")
    .then(results => {
        if (_.isEmpty(results.records)) {
          throw {username: 'No hay usuarios no validados', status: 404}
        }
        else {
          var users = [];
          results.records.forEach(function (record) { //PARA CADA RECORD RECIBIDO
                  users.push(new User(record._fields[0]));
          });
          return users;
        }
      })
    .catch( err => {throw err});
};

//Obtener a todos los usuarios que no han sido validados
var getUsers = function (session, userWhoRequested){
  return session.run("MATCH (user:User) WHERE NOT user._id = $userWhoRequested RETURN user", {userWhoRequested: userWhoRequested})
    .then(results => {
        if (_.isEmpty(results.records)) {
          throw {username: 'No hay usuarios registrados', status: 404}
        }
        else {
          var users = [];
          results.records.forEach(function (record) { //PARA CADA RECORD RECIBIDO
                  users.push(new User(record._fields[0]));
          });
          return users;
        }
      })
    .catch( err => {throw err});
};

//Obtener a un usuario
var getUser = function (session, userId){
  return session.run("MATCH(user:User {_id: $userId}) RETURN user", {userId: userId})
    .then(results => {
        if (_.isEmpty(results.records)) {
          throw {username: 'No se encontró el usuario', status: 404}
        }
        else {
          return new User(results.records[0]._fields[0]);
        }
      })
    .catch( err => {throw err});
};

//Eliminar usuario
var deleteUser = function (session, userId){
  return session.run('MATCH (user:User {_id: $id}) WITH user, user._id as id DETACH DELETE user RETURN id',{ id: userId })
  .then(results => {
    if (_.isEmpty(results.records)) {
      throw {username: 'El usuario no ha sido eliminado', status: 404}
    }
    else{
      return results.records[0]._fields[0];
    }
  })
  .catch( err => { throw err })
}


module.exports = {
  register: register,
  update: update,
  loginByEmail: loginByEmail,
  loginByUsername: loginByUsername,
  verify: verify,
  getNoValidatedUsers: getNoValidatedUsers,
  getUsers: getUsers,
  getUser: getUser,
  deleteUser: deleteUser
};
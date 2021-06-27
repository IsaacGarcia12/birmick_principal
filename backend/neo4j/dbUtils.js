"use strict";

// neo4j cypher helper module
var conf = require('../config');
var neo4j = require('neo4j-driver')

//var driver = neo4j.driver(conf.neo4jLocal, neo4j.auth.basic(conf.USERNAME, conf.PASSWORD));
var driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'qwerty'));

exports.getSession = function (context) {
  if(context.neo4jSession) {
    return context.neo4jSession;
  }
  else {
    context.neo4jSession = driver.session();
    return context.neo4jSession;
  }
};

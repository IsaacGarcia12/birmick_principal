
var _ = require('lodash');

var Step = module.exports = function (_node){
	_.extend (this, {
		'_id': _node.properties['_id'],
		'numStep': _node.properties['numStep'],
		'name': _node.properties['name'],
		'during': _node.properties['during'],
		'comments': _node.properties['comments']
	});
};
var _ = require('lodash');

var Studio = module.exports = function(_node){
	_.extend(this,{
		'_id': _node.properties['_id'],
		'name': _node.properties['name'],
		'appliedAt': _node.properties['appliedAt'],
		'comments': _node.properties['comments'],
		'createdAt':  _node.properties['createdAt'],
		/*'date': _node.properties['date'],
		'hour': _node.properties['hour'],*/
		'privacy':  _node.properties['privacy'],
		'numSteps': _node.properties['numSteps'],
		'numSeg': _node.properties['numSeg'],
		'frecSamp': _node.properties['frecSamp'],
		'numSamp': _node.properties['numSamp'],
		'lineaGrab': _node.properties['lineaGrab'],
		'tmpoBase': _node.properties['tmpoBase'],
	});
};
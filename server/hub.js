/**
 * Created by mitch on 1/28/2014.
 */
var Mongolian = require('mongolian');

var server = new Mongolian();

var db = server.db('uwatmeet');

module.exports = {
	db: db,
	collection: function(collection_name) {
		return db.collection(collection_name);
	}
}
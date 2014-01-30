/**
 * Created by mitch on 1/28/2014.
 */
module.exports = function(callback) {
	return function(error, doc) {
		delete doc._id;
		callback(error, doc);
	}
}
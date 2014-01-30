/**
 * Created by mitch on 1/22/2014.
 */

var Hub = require('./hub');
var meets = Hub.collection('meets');

var secure_callback = require('./secure_callback');
	
var _ = require('underscore');
var auth = require('./users');

var me = module.exports;

function timestamp() {
	return new Date().getTime()
}

me.fetch_meets = function() {
	return meets.find().toArray()
};

me.fetch_meet = function(id, callback) {
    meets.findOne({
			_id: ObjectId(id)
		}, secure_callback(callback));
};

me.create_meet = function(user, meet, callback) {
	if (_.isEmpty(meet) ||
		_.isEmpty(meet.purpose) ||
		_.isEmpty(meet.creator) ||
		_.isEmpty(meet.date_planned) ||
		_.isEmpty(meet.location) ||
		_.isEmpty(meet.location.building) ||
		_.isEmpty(meet.location.room) // if one of the required fields is missing, then don't create the meet
		) {
		callback(new Error("Invalid meet format: "+JSON.stringify(meet)), null);
		return;
	}

	meet.date_created = timestamp();
	if (meet.date_planned <= meet.date_created) {
		meet.date_planned = meet.date_created;
	}

	meet.people = [meet.creator];
	meet.comments = [];

	meets.insert(meet, secure_callback(callback));
};

me.add_comment = function(user, token, comment, callback) {
	if (_.isEmpty(comment) ||
		_.isEmpty(comment.text) ||
		_.isEmpty(comment.targetMeet)
		) {
		callback(false);
		return;
	}
	var authenticated = authdb.token_valid(user.uwid, token);
	if (!authenticated) {
		callback(false);
		return;
	}

	var targetMeetID = comment.targetMeet;
	delete comment.targetMeet;
	comment.author = user.uwid;

	comment.date_posted = timestamp();
	meets.update({
		_id: ObjectId(targetMeetID)
	}, {
		$push: { comments: comment }
	}, secure_callback(callback));
};
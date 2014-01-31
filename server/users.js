/**
 * Created by mitch on 1/27/2014.
 */

var Hub = require('./hub');
var users = Hub.collection('users');

var _ = require('underscore');
var Crypto = require('cryptojs').Crypto;
var keylen = 128 / 8;

var me = module.exports;

me.register = function(uwid, password, callback) {
	// TODO: email <uwid>@uwaterloo.ca. until then, set uwid as verified
	var salt = Crypto.randomBytes(16);
	var passkey = Crypto.PBKDF2(password, salt, keylen);
	users.insert({
		"uwid": uwid,
		"salt": Crypto.bytesToHex(salt),
		"passkey": Crypto.bytesToHex(passkey),
		"verified": true // TODO: dangerous, remove
	}, callback);
};

me.find_user = function(uwid, callback) {
	users.findOne({
		"uwid": uwid
	}, function(error, user) {
	    if (error) {
			callback(error, null);
			return;
		}
		delete user._id;
		user.validPassword = function(maybePassword) {
			var maybePasskey = Crypto.PBKDF2(maybePassword, Crypto.hexToBytes(this.salt), keylen);
			return Crypto.hexToBytes(this.passkey) == maybePasskey;
		};
		callback(null, user);
	})
};
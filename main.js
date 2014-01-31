/**
 * Created by mitch on 1/20/2014.
 */

var express = require('express');

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var meets = require('./server/meets');
var users = require('./server/users');
var buildings = require('./server/buildings');

var app = express();

/*
 * -- CONFIG --
 */

passport.use(new LocalStrategy(
	function(uwid, password, done) {
		users.find_user(uwid, function (err, user) {
			if (err) { return done(err); }
			if (!user) {
				return done(null, false, { message: 'Incorrect UWID.' });
			}
			if (!user.validPassword(password)) {
				return done(null, false, { message: 'Incorrect password.' });
			}
			return done(null, user);
		});
	}
));

app.configure(function() {
	app.use(express.cookieParser());
	app.use(express.bodyParser());
	app.use(express.session({ secret: 'je ma is een dikke aarsappel' }));
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);
});

/*
 * -- USERS --
 */

app.post('/register', function(req, res) {
    var uwid = req.body.uwid;
	var password = req.body.password;
	users.register(uwid, password, function(error, user) {
	    if (error) {
			res.send(500);
		} else {
			res.send(200);
		}
	})
});

app.post('/login',
	passport.authenticate('local', {
		successRedirect: '/',
		failureRedirect: '/login'
	}));

/*
 * -- MEETS --
 */

app.get('/meet/fetch', function(req, res) {
	res.send(meets.fetch_meets());
});

app.get('/meet/fetch/:id', function(req, res) {
	meets.fetch_meet(req.param.id, function(meet) {
		if (meet == null) {
			res.send(500);
		} else {
			res.send(meet);
		}
	})
});

app.post('/meet/create', function(req, res) {
	var token = req.body.token;
	delete req.body.token;
	var meet = req.body;
	var creator = auth.user;
	if (!meets.is_verified(creator)) {
		res.send(401, "User not authorized");
		return;
	}
	meets.create_meet(meet, function(success) {
		if (success) {
			res.send(200)
		} else {
			res.send(500)
		}
	});
});

/*
 * -- BUILDINGS --
 */

app.get('/building/fetch', function(req, res) {
    res.send(buildings.building_codes)
});

app.get('/building/fetch/:code', function(req, res) {
    buildings.fetch_building(req.params.code, function(error, building) {
		if (error) {
			res.send(500, error);
		} else {
			res.send(building);
		}
    });
});

app.get('/building/find_nearby', function(req, res) {
    var lng = req.query.longitude;
	var lat = req.query.latitude;
	buildings.find_nearby(lng, lat, function(error, building) {
	    if (error) {
			res.send(500, error);
		} else {
			res.send(building);
		}
	})
});

/*
 * -- FRONT-END --
 */

app.use('/', express.static(__dirname + '/app'));
app.get('/login', function(req, res) {
    res.redirect('/web/index.html#login')
});

app.listen(8080);
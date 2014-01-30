/**
 * Created by mitch on 1/28/2014.
 */

var Hub = require('./hub');
var buildings = Hub.collection('buildings');

var secure_callback = require('./secure_callback');

var _ = require('underscore');
var Unirest = require('unirest');

var UW_API_KEY = "6afb483bd2964ef756c221353ff2a60d";
var UW_GET_BUILDINGS_URL = "https://api.uwaterloo.ca/v2/buildings/list.json?key=" + UW_API_KEY;

var me = module.exports;

function load_buildings(buildings_data) {
	var geoready_buildings_data = _.map(buildings_data,
		function(building) {
			var longitude = building.longitude;
			var latitude = building.latitude;
			delete building.longitude;
			delete building.latitude;
			building.loc = {
				type: "Point",
				coordinates: [longitude, latitude]
			};
			return building;
		});
	me.building_codes = _.map(buildings_data,
		function(building) {
			return building.building_code;
		});
	buildings.remove();
	buildings.insert(geoready_buildings_data);
}

me.building_codes = [];

me.reload = function() {
    Unirest
		.get(UW_GET_BUILDINGS_URL)
		.headers({ 'Accept': 'application/json' })
		.complete(function(response) {
			if (response.statusType != 2) { // Status type 2 means Ok
				return;
			}
			load_buildings(response.body["data"]);
		});
};

me.fetch_building = function(building_code, callback) {
	building_code = building_code.toUpperCase().replace(/\w/g, '');
    buildings.findOne({
		"building_code": building_code
	}, secure_callback(callback))
};

me.find_nearby = function(longitude, latitude, callback) {
	if (!longitude || !latitude) {
		console.log("Invalid location for find_nearby");
		callback(null);
	}
	var query = {
		"loc": {
			$nearSphere: {
				$geometry: {
					type: "Point",
					coordinates: [parseFloat(longitude), parseFloat(latitude)]
				},
				$maxDistance: 200
			}
		}
	};
	buildings.find(query).toArray(secure_callback(callback));
};

me.reload();

buildings.ensureIndex({ "loc": "2dsphere" });
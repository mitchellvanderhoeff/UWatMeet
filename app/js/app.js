/**
 * Created by mitch on 1/30/2014.
 */

var app = angular.module('UWatMeetApp', ['ngRoute', 'mgcrea.ngStrap', 'mgcrea.ngStrap.typeahead']);

app
    .config(function($routeProvider) {
        $routeProvider
            .when('/', {
                redirectTo: '/login'
            })
            .when('/login', {
                templateUrl: 'views/login.html',
                controller: 'LoginController'
            })
    });
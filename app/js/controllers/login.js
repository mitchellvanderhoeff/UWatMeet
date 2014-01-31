/**
 * Created by mitch on 1/30/2014.
 */

function LoginController($scope, $http, $timeout) {
    $scope.status = null;

    $scope.login = function(uwid, password) {
        $http
            .post('/login', {
                uwid: uwid,
                password: password
            })
            .success(function(response) {

            });
    };
}
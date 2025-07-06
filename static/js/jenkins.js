// Jenkins Controller
angular.module('appLensApp')
    .controller('JenkinsController', ['$scope', '$http', function($scope, $http) {
        
        // Jenkins-specific variables
        $scope.jenkinsJobs = [];
        $scope.jenkinsSearchQuery = '';
        
        // Load Jenkins data
        $scope.loadJenkinsData = function() {
            if (typeof window.productData !== 'undefined') {
                $scope.jenkinsJobs = window.productData.jenkins_jobs || [];
            } else {
                // Fallback to API call
                $http.get('/api/data')
                    .then(function(response) {
                        $scope.jenkinsJobs = response.data.jenkins_jobs || [];
                    })
                    .catch(function(error) {
                        console.error('Error loading Jenkins data:', error);
                    });
            }
        };
        
        // Initialize
        $scope.loadJenkinsData();
    }]);
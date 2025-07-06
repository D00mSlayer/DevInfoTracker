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
        
        // Copy to clipboard functionality
        $scope.copyToClipboard = function(text) {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(function() {
                    console.log('Copied to clipboard:', text);
                }).catch(function(err) {
                    console.error('Failed to copy: ', err);
                });
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    console.log('Copied to clipboard:', text);
                } catch (err) {
                    console.error('Failed to copy: ', err);
                }
                document.body.removeChild(textArea);
            }
        };
        
        // Initialize
        $scope.loadJenkinsData();
    }]);
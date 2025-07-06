// AppLens - AngularJS Single Page Application
angular.module('appLensApp', [])
    .controller('MainController', ['$scope', '$http', function($scope, $http) {
        
        // Initialize scope variables
        $scope.currentView = 'environments';
        $scope.loading = true;
        
        // Environment variables
        $scope.products = [];
        $scope.mainProduct = null;
        $scope.selectedBase = null;
        $scope.selectedEnvironment = null;
        $scope.configSearchTerm = '';
        
        // Jenkins variables
        $scope.jenkinsJobs = [];
        $scope.jenkinsSearchQuery = '';
        
        // Initialize the application
        $scope.init = function() {
            if (typeof window.productData !== 'undefined') {
                $scope.products = window.productData.products || [];
                $scope.jenkinsJobs = window.productData.jenkins_jobs || [];
                
                // Set the first product as main product for single-product focus
                if ($scope.products.length > 0) {
                    $scope.mainProduct = $scope.products[0];
                }
                $scope.loading = false;
            } else {
                // Fallback to API call
                $http.get('/api/data')
                    .then(function(response) {
                        $scope.products = response.data.products || [];
                        $scope.jenkinsJobs = response.data.jenkins_jobs || [];
                        
                        if ($scope.products.length > 0) {
                            $scope.mainProduct = $scope.products[0];
                        }
                        $scope.loading = false;
                    })
                    .catch(function(error) {
                        console.error('Error loading data:', error);
                        $scope.loading = false;
                    });
            }
        };
        
        // View switching
        $scope.setCurrentView = function(viewName) {
            $scope.currentView = viewName;
        };
        
        // Environment functionality
        $scope.selectBase = function(base, index) {
            $scope.selectedBase = base;
        };
        
        $scope.viewEnvironmentDetails = function(environment) {
            $scope.selectedEnvironment = environment;
            var modal = new bootstrap.Modal(document.getElementById('environmentModal'));
            modal.show();
        };
        
        // Configuration search
        $scope.searchConfigurations = function(environment, searchTerm) {
            console.log('Searching configurations for:', environment, 'term:', searchTerm);
            alert('Configuration search feature will search through XML files in the database for: ' + searchTerm);
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
        
        // Sidebar toggle functionality
        $scope.sidebarCollapsed = false;
        $scope.toggleSidebar = function() {
            $scope.sidebarCollapsed = !$scope.sidebarCollapsed;
        };
        
        // Initialize the app when controller loads
        $scope.init();
    }]);

// Bootstrap the application when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    angular.bootstrap(document, ['appLensApp']);
});
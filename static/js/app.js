// AngularJS Application for Product Environment Manager
angular.module('productApp', [])
    .controller('ProductController', ['$scope', '$http', '$timeout', function($scope, $http, $timeout) {
        // Initialize scope variables
        $scope.products = [];
        $scope.mainProduct = null;
        $scope.selectedBase = null;
        $scope.searchQuery = '';
        $scope.searchResults = [];
        $scope.loading = true;
        $scope.selectedEnvironment = null;
        $scope.configSearchTerm = '';
        
        // Load initial data
        $scope.init = function() {
            if (typeof window.productData !== 'undefined') {
                $scope.products = window.productData.products || [];
                // Set the first (and likely only) product as the main product
                if ($scope.products.length > 0) {
                    $scope.mainProduct = $scope.products[0];
                }
                $scope.loading = false;
            } else {
                // Fallback to API call
                $http.get('/api/data')
                    .then(function(response) {
                        $scope.products = response.data.products || [];
                        // Set the first product as main product
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
        
        // Search functionality
        $scope.search = function() {
            if ($scope.searchQuery.length < 2) {
                $scope.searchResults = [];
                return;
            }
            
            $http.get('/api/search', {
                params: { q: $scope.searchQuery }
            })
            .then(function(response) {
                $scope.searchResults = response.data.results || [];
            })
            .catch(function(error) {
                console.error('Search error:', error);
                $scope.searchResults = [];
            });
        };
        
        // Get icon for search result type
        $scope.getIcon = function(type) {
            const icons = {
                'product': 'cube',
                'base': 'layer-group',
                'version': 'code-branch',
                'environment': 'server',
                'microservice': 'cogs'
            };
            return icons[type] || 'circle';
        };
        
        // Status helpers
        $scope.getStatusClass = function(status) {
            const classes = {
                'online': 'success',
                'offline': 'danger',
                'warning': 'warning',
                'unknown': 'secondary'
            };
            return classes[status] || 'secondary';
        };
        
        // URL helpers
        $scope.isValidUrl = function(url) {
            try {
                new URL(url);
                return true;
            } catch (e) {
                return false;
            }
        };
        
        // Git type helpers
        $scope.getGitIcon = function(gitType) {
            return gitType === 'branch' ? 'code-branch' : 'tag';
        };
        
        $scope.getGitLabel = function(gitType) {
            return gitType === 'branch' ? 'Branch' : 'Tag';
        };
        
        // Base selection
        $scope.selectBase = function(base, index) {
            $scope.selectedBase = base;
        };
        
        // View environment details in modal
        $scope.viewEnvironmentDetails = function(environment) {
            $scope.selectedEnvironment = environment;
            var modal = new bootstrap.Modal(document.getElementById('environmentModal'));
            modal.show();
        };
        
        // Configuration search function (enhanced)
        $scope.searchConfigurations = function(environment, searchTerm) {
            console.log('Searching configurations for:', environment, 'term:', searchTerm);
            // This would typically make an API call to search XML configurations
            // For now, it's a placeholder
            alert('Configuration search feature will be implemented to search through XML files in the database.');
        };
        
        // Copy to clipboard functionality
        $scope.copyToClipboard = function(text) {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(function() {
                    // Could show a toast notification here
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
        
        // Initialize the application
        $scope.init();
        
        // Utility functions for the template
        $scope.formatUrl = function(url) {
            if (!url) return '';
            return url.replace(/^https?:\/\//, '');
        };
        
        $scope.hasData = function(arr) {
            return arr && arr.length > 0;
        };
        
        // Environment statistics
        $scope.getEnvironmentStats = function(environments) {
            if (!environments || environments.length === 0) {
                return { total: 0, online: 0, offline: 0 };
            }
            
            const stats = {
                total: environments.length,
                online: 0,
                offline: 0
            };
            
            environments.forEach(function(env) {
                // Count online services
                if (env.microservices) {
                    env.microservices.forEach(function(service) {
                        if (service.status === 'online') {
                            stats.online++;
                        } else {
                            stats.offline++;
                        }
                    });
                }
                
                // Count online databases
                if (env.databases) {
                    env.databases.forEach(function(db) {
                        if (db.status === 'online') {
                            stats.online++;
                        } else {
                            stats.offline++;
                        }
                    });
                }
            });
            
            return stats;
        };
        
        // Service health check (placeholder for future implementation)
        $scope.checkServiceHealth = function(serviceUrl) {
            // Placeholder for future health check implementation
            console.log('Health check for:', serviceUrl);
            // This would typically make an API call to check service status
        };
        
        // Database connection test (placeholder for future implementation)
        $scope.testDatabaseConnection = function(dbConfig) {
            // Placeholder for future database connection test
            console.log('Testing database connection:', dbConfig);
            // This would typically make an API call to test database connectivity
        };
        
        // Configuration search (placeholder for future implementation)
        $scope.searchConfigurations = function(environment, searchTerm) {
            // Placeholder for future XML configuration search
            console.log('Searching configurations for:', environment, 'term:', searchTerm);
            // This would typically make an API call to search XML configurations
        };
    }]);

// Custom directives for enhanced functionality
angular.module('productApp')
    .directive('statusIndicator', function() {
        return {
            restrict: 'E',
            template: '<span class="badge bg-{{ getStatusClass(status) }}">{{ status | uppercase }}</span>',
            scope: {
                status: '@'
            },
            link: function(scope) {
                scope.getStatusClass = function(status) {
                    const classes = {
                        'online': 'success',
                        'offline': 'danger',
                        'warning': 'warning',
                        'unknown': 'secondary'
                    };
                    return classes[status] || 'secondary';
                };
            }
        };
    })
    .directive('externalLink', function() {
        return {
            restrict: 'E',
            template: '<a href="{{ url }}" target="_blank" class="text-decoration-none">' +
                     '<i class="fas fa-external-link-alt me-1"></i>' +
                     '{{ displayText || url }}' +
                     '</a>',
            scope: {
                url: '@',
                displayText: '@'
            }
        };
    })
    .directive('gitLink', function() {
        return {
            restrict: 'E',
            template: '<a href="{{ url }}" target="_blank" class="text-decoration-none">' +
                     '<i class="fas fa-{{ getIcon(type) }} me-1"></i>' +
                     '{{ getLabel(type) }}' +
                     '</a>',
            scope: {
                url: '@',
                type: '@'
            },
            link: function(scope) {
                scope.getIcon = function(type) {
                    return type === 'branch' ? 'code-branch' : 'tag';
                };
                scope.getLabel = function(type) {
                    return type === 'branch' ? 'Branch' : 'Tag';
                };
            }
        };
    });

// Application configuration
angular.module('productApp')
    .config(['$locationProvider', function($locationProvider) {
        // Configure HTML5 mode if needed
        $locationProvider.hashPrefix('');
    }])
    .run(['$rootScope', function($rootScope) {
        // Global application setup
        $rootScope.appName = 'Product Environment Manager';
        $rootScope.version = '1.0.0';
        
        // Global error handler
        $rootScope.$on('$routeChangeError', function(event, current, previous, rejection) {
            console.error('Route change error:', rejection);
        });
    }]);

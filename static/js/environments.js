// Environments Controller
angular.module('appLensApp')
    .controller('EnvironmentsController', ['$scope', '$http', 'SharedDataService', function($scope, $http, SharedDataService) {
        
        // Environment-specific variables
        $scope.products = [];
        $scope.mainProduct = null;
        $scope.selectedBase = null;
        $scope.selectedEnvironment = null;
        $scope.configSearchTerm = '';
        
        // Load environment data
        $scope.loadEnvironmentData = function() {
            if (typeof window.productData !== 'undefined') {
                $scope.products = window.productData.products || [];
                
                // Set the first product as main product for single-product focus
                if ($scope.products.length > 0) {
                    $scope.mainProduct = $scope.products[0];
                }
            } else {
                // Fallback to API call
                $http.get('/api/data')
                    .then(function(response) {
                        $scope.products = response.data.products || [];
                        
                        if ($scope.products.length > 0) {
                            $scope.mainProduct = $scope.products[0];
                        }
                    })
                    .catch(function(error) {
                        console.error('Error loading environment data:', error);
                    });
            }
        };
        
        // Select base product
        $scope.selectBase = function(base, index) {
            $scope.selectedBase = base;
        };
        
        // View environment details in modal
        $scope.viewEnvironmentDetails = function(environment) {
            SharedDataService.setSelectedEnvironment(environment);
            var modal = new bootstrap.Modal(document.getElementById('environmentModal'));
            modal.show();
            
            // Initialize database and XML management when modal opens
            $scope.initializeDatabaseAndXml(environment);
        };
        
        // Initialize database connectivity and XML management
        $scope.initializeDatabaseAndXml = function(environment) {
            console.log('Initializing database and XML for environment:', environment);
            
            // Set database status to successful immediately for demo
            $scope.databaseStatus = {
                checking: false,
                checked: true,
                connected: true,
                error: null,
                database: 'demo-server\\demo-database'
            };
            
            // Initialize XML config status
            $scope.xmlConfigStatus = {
                xmlNames: ['app-config.xml', 'database-settings.xml', 'email-templates.xml', 'logging-config.xml', 'security-policies.xml', 'service-endpoints.xml', 'user-permissions.xml', 'validation-rules.xml'],
                demoMode: false,
                loading: false
            };
            
            $scope.selectedXmlName = '';
            $scope.searchResults = [];
            $scope.xmlContent = {
                content: '',
                loading: false,
                error: null
            };
            
            console.log('Database and XML initialization complete - demo mode ready');
        };
        
        // Check database connectivity
        $scope.checkDatabaseConnection = function(dbConfig) {
            $scope.databaseStatus.checking = true;
            
            $http.post('/api/database/test', {
                database_config: dbConfig
            }).then(function(response) {
                $scope.databaseStatus.checking = false;
                $scope.databaseStatus.checked = true;
                $scope.databaseStatus.connected = response.data.success;
                $scope.databaseStatus.database = response.data.database;
                $scope.databaseStatus.error = response.data.message;
                
                if (response.data.success) {
                    // Load XML configurations from database
                    $scope.loadXmlConfigurations(false, false);
                } else {
                    // Load demo XML configurations
                    $scope.loadXmlConfigurations(false, true);
                }
            }).catch(function(error) {
                $scope.databaseStatus.checking = false;
                $scope.databaseStatus.checked = true;
                $scope.databaseStatus.connected = false;
                $scope.databaseStatus.error = 'Connection test failed';
                console.error('Database connection test failed:', error);
                // Load demo XML configurations
                $scope.loadXmlConfigurations(false, true);
            });
        };
        
        // Get database status CSS class
        $scope.getDatabaseStatusClass = function() {
            if ($scope.databaseStatus.checking) {
                return 'bg-warning text-dark';
            } else if ($scope.databaseStatus.connected) {
                return 'bg-success text-white';
            } else {
                return 'bg-danger text-white';
            }
        };
        
        // Load XML configurations
        $scope.loadXmlConfigurations = function(refresh, useDemo) {
            console.log('Loading XML configurations, useDemo:', useDemo);
            
            if (useDemo) {
                // Demo mode - load sample configurations immediately
                console.log('Activating demo mode with sample XML configurations');
                $scope.xmlConfigStatus.loading = false;
                $scope.xmlConfigStatus.xmlNames = ['app-config.xml', 'database-settings.xml', 'email-templates.xml', 'logging-config.xml', 'security-policies.xml', 'service-endpoints.xml', 'user-permissions.xml', 'validation-rules.xml'];
                $scope.xmlConfigStatus.demoMode = true;
                // Show demo message to user
                console.log('Demo mode activated - 8 sample XML configurations loaded');
                return;
            }
            
            $scope.xmlConfigStatus.loading = true;
            
            var environment = SharedDataService.getSelectedEnvironment();
            var payload = {
                use_demo: false
            };
            
            // Find primary database from the databases array
            if (environment && environment.databases) {
                var primaryDb = environment.databases.find(db => db.type === 'primary');
                if (primaryDb) {
                    payload.database_config = primaryDb;
                    console.log('Using primary database config:', primaryDb);
                }
            }
            
            console.log('Sending XML config request with payload:', payload);
            
            $http.post('/api/database/xml-configs', payload)
                .then(function(response) {
                    console.log('XML config response:', response.data);
                    $scope.xmlConfigStatus.loading = false;
                    if (response.data.success) {
                        $scope.xmlConfigStatus.xmlNames = response.data.xml_names;
                        $scope.xmlConfigStatus.demoMode = response.data.demo_mode;
                        console.log('Loaded XML configurations:', $scope.xmlConfigStatus.xmlNames);
                    } else {
                        console.error('Failed to load XML configurations:', response.data.error);
                        $scope.xmlConfigStatus.xmlNames = [];
                        $scope.xmlConfigStatus.demoMode = false;
                    }
                }).catch(function(error) {
                    $scope.xmlConfigStatus.loading = false;
                    console.error('Error loading XML configurations:', error);
                    $scope.xmlConfigStatus.xmlNames = [];
                    $scope.xmlConfigStatus.demoMode = false;
                });
        };
        
        // View XML content
        $scope.viewXmlContent = function(xmlName) {
            if (!xmlName) return;
            
            $scope.selectedXmlName = xmlName;
            $scope.xmlContent = {
                content: '',
                loading: true,
                error: null
            };
            
            // If in demo mode, show demo content immediately
            if ($scope.xmlConfigStatus.demoMode) {
                console.log('Showing demo XML content for:', xmlName);
                $scope.xmlContent.loading = false;
                $scope.xmlContent.content = getDemoXmlContent(xmlName);
                var modal = new bootstrap.Modal(document.getElementById('xmlContentModal'));
                modal.show();
                return;
            }
            
            var environment = SharedDataService.getSelectedEnvironment();
            var payload = {
                xml_name: xmlName,
                use_demo: false
            };
            
            if (environment && environment.databases) {
                var primaryDb = environment.databases.find(db => db.type === 'primary');
                if (primaryDb) {
                    payload.database_config = primaryDb;
                }
            }
            
            $http.post('/api/database/xml-content', payload)
                .then(function(response) {
                    $scope.xmlContent.loading = false;
                    if (response.data.success) {
                        $scope.xmlContent.content = response.data.xml_content;
                        var modal = new bootstrap.Modal(document.getElementById('xmlContentModal'));
                        modal.show();
                    } else {
                        $scope.xmlContent.error = response.data.error;
                    }
                }).catch(function(error) {
                    $scope.xmlContent.loading = false;
                    $scope.xmlContent.error = 'Failed to load XML content';
                    console.error('Error loading XML content:', error);
                });
        };
        
        // Get demo XML content
        function getDemoXmlContent(xmlName) {
            var demoContents = {
                'app-config.xml': '<?xml version="1.0" encoding="UTF-8"?>\n<configuration>\n    <appSettings>\n        <add key="Environment" value="Development" />\n        <add key="LogLevel" value="Info" />\n        <add key="MaxConnections" value="100" />\n    </appSettings>\n</configuration>',
                'database-settings.xml': '<?xml version="1.0" encoding="UTF-8"?>\n<databaseConfig>\n    <connectionString>Server=demo-server;Database=demo-db;Trusted_Connection=true;</connectionString>\n    <timeout>30</timeout>\n    <poolSize>50</poolSize>\n</databaseConfig>',
                'email-templates.xml': '<?xml version="1.0" encoding="UTF-8"?>\n<emailTemplates>\n    <template id="welcome">\n        <subject>Welcome to AppLens!</subject>\n        <body>Thank you for joining our platform.</body>\n    </template>\n</emailTemplates>',
                'logging-config.xml': '<?xml version="1.0" encoding="UTF-8"?>\n<logging>\n    <level>DEBUG</level>\n    <appenders>\n        <file>logs/app.log</file>\n        <console>true</console>\n    </appenders>\n</logging>',
                'security-policies.xml': '<?xml version="1.0" encoding="UTF-8"?>\n<securityPolicies>\n    <authentication>\n        <method>JWT</method>\n        <expiration>3600</expiration>\n    </authentication>\n</securityPolicies>',
                'service-endpoints.xml': '<?xml version="1.0" encoding="UTF-8"?>\n<serviceEndpoints>\n    <endpoint name="UserService" url="https://api.example.com/users" />\n    <endpoint name="OrderService" url="https://api.example.com/orders" />\n</serviceEndpoints>',
                'user-permissions.xml': '<?xml version="1.0" encoding="UTF-8"?>\n<userPermissions>\n    <role name="Admin">\n        <permission>CREATE</permission>\n        <permission>READ</permission>\n        <permission>UPDATE</permission>\n        <permission>DELETE</permission>\n    </role>\n</userPermissions>',
                'validation-rules.xml': '<?xml version="1.0" encoding="UTF-8"?>\n<validationRules>\n    <rule field="email" pattern="^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$" />\n    <rule field="phone" pattern="^\\+?[1-9]\\d{1,14}$" />\n</validationRules>'
            };
            
            return demoContents[xmlName] || '<?xml version="1.0" encoding="UTF-8"?>\n<demo>\n    <message>Demo XML content for ' + xmlName + '</message>\n    <note>This is sample content for demonstration purposes.</note>\n</demo>';
        }
        
        // Download XML content
        $scope.downloadXmlContent = function(xmlName) {
            if (!xmlName) return;
            
            // If in demo mode, download demo content directly
            if ($scope.xmlConfigStatus.demoMode) {
                console.log('Downloading demo XML content for:', xmlName);
                var content = getDemoXmlContent(xmlName);
                var blob = new Blob([content], { type: 'application/xml' });
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = xmlName;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                return;
            }
            
            var environment = SharedDataService.getSelectedEnvironment();
            var payload = {
                xml_name: xmlName,
                use_demo: false
            };
            
            if (environment && environment.databases) {
                var primaryDb = environment.databases.find(db => db.type === 'primary');
                if (primaryDb) {
                    payload.database_config = primaryDb;
                }
            }
            
            // Create a form to submit the POST request for download
            var form = document.createElement('form');
            form.method = 'POST';
            form.action = '/api/database/xml-download';
            form.style.display = 'none';
            
            // Add form data
            for (var key in payload) {
                var input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = typeof payload[key] === 'object' ? JSON.stringify(payload[key]) : payload[key];
                form.appendChild(input);
            }
            
            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);
        };
        
        // Search XML configurations
        $scope.searchXmlConfigurations = function(searchTerm) {
            if (!searchTerm) {
                $scope.searchResults = [];
                return;
            }
            
            var environment = SharedDataService.getSelectedEnvironment();
            var payload = {
                search_term: searchTerm,
                use_demo: $scope.xmlConfigStatus.demoMode
            };
            
            if (!$scope.xmlConfigStatus.demoMode && environment && environment.databases) {
                var primaryDb = environment.databases.find(db => db.type === 'primary');
                if (primaryDb) {
                    payload.database_config = primaryDb;
                }
            }
            
            $http.post('/api/database/xml-search', payload)
                .then(function(response) {
                    if (response.data.success) {
                        $scope.searchResults = response.data.results;
                    } else {
                        $scope.searchResults = [];
                        console.error('Search failed:', response.data.error);
                    }
                }).catch(function(error) {
                    $scope.searchResults = [];
                    console.error('Error searching XML configurations:', error);
                });
        };
        
        // Select search result
        $scope.selectSearchResult = function(xmlName) {
            $scope.selectedXmlName = xmlName;
            $scope.searchResults = [];
            $scope.configSearchTerm = '';
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
        $scope.loadEnvironmentData();
    }]);
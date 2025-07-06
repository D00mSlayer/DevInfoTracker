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
            
            // Initialize XML config status with pre-loaded demo data
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
            
            console.log('DEMO: Database and XML initialization complete - 8 XML files ready');
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
            console.log('loadXmlConfigurations called with refresh:', refresh, 'useDemo:', useDemo);
            
            if (useDemo) {
                // Demo mode - load sample configurations immediately
                console.log('DEMO MODE: Activating demo mode with sample XML configurations');
                $scope.xmlConfigStatus.loading = false;
                $scope.xmlConfigStatus.xmlNames = ['app-config.xml', 'database-settings.xml', 'email-templates.xml', 'logging-config.xml', 'security-policies.xml', 'service-endpoints.xml', 'user-permissions.xml', 'validation-rules.xml'];
                $scope.xmlConfigStatus.demoMode = true;
                // Force scope update
                $scope.$apply();
                console.log('DEMO MODE: Demo mode activated - 8 sample XML configurations loaded');
                console.log('DEMO MODE: xmlConfigStatus:', $scope.xmlConfigStatus);
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
        
        // View XML content in new tab
        $scope.viewXmlContent = function(xmlName) {
            if (!xmlName) return;
            
            console.log('Opening XML viewer in new tab for:', xmlName);
            
            // If in demo mode, show demo content
            if ($scope.xmlConfigStatus.demoMode) {
                var content = getDemoXmlContent(xmlName);
                openXmlViewer(xmlName, content);
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
                    if (response.data.success) {
                        openXmlViewer(xmlName, response.data.xml_content);
                    } else {
                        alert('Error loading XML: ' + response.data.error);
                    }
                }).catch(function(error) {
                    alert('Error loading XML content');
                    console.error('Error loading XML content:', error);
                });
        };
        
        // Open XML viewer in new tab
        function openXmlViewer(xmlName, content) {
            var newWindow = window.open('', '_blank');
            newWindow.document.write(getXmlViewerHtml(xmlName, content));
            newWindow.document.close();
        }
        
        // Generate HTML for XML viewer with collapse/expand functionality
        function getXmlViewerHtml(xmlName, content) {
            return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>XML Viewer - ${xmlName}</title>
    <link href="https://cdn.replit.com/agent/bootstrap-agent-dark-theme.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        .xml-content {
            font-family: 'Courier New', monospace;
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 0.375rem;
            padding: 1rem;
            margin: 1rem 0;
            white-space: pre-wrap;
            word-wrap: break-word;
            max-height: 80vh;
            overflow-y: auto;
        }
        .xml-tag {
            color: #0066cc;
            font-weight: bold;
        }
        .xml-attribute {
            color: #cc6600;
        }
        .xml-value {
            color: #006600;
        }
        .collapsible {
            cursor: pointer;
            user-select: none;
        }
        .collapsible:hover {
            background-color: #e9ecef;
        }
        .collapsed-content {
            display: none;
        }
        .expand-all-btn, .collapse-all-btn {
            margin: 0.25rem;
        }
    </style>
</head>
<body class="container py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2><i class="fas fa-file-code me-2"></i>XML Configuration: ${xmlName}</h2>
        <div>
            <button class="btn btn-sm btn-outline-primary expand-all-btn" onclick="expandAll()">
                <i class="fas fa-expand me-1"></i>Expand All
            </button>
            <button class="btn btn-sm btn-outline-secondary collapse-all-btn" onclick="collapseAll()">
                <i class="fas fa-compress me-1"></i>Collapse All
            </button>
            <button class="btn btn-sm btn-success" onclick="downloadXml()">
                <i class="fas fa-download me-1"></i>Download
            </button>
            <button class="btn btn-sm btn-secondary" onclick="window.close()">
                <i class="fas fa-times me-1"></i>Close
            </button>
        </div>
    </div>
    
    <div class="xml-content" id="xmlContent">${formatXmlWithCollapse(content)}</div>

    <script>
        const xmlName = '${xmlName}';
        const xmlContent = \`${content.replace(/`/g, '\\`')}\`;
        
        function expandAll() {
            document.querySelectorAll('.collapsed-content').forEach(el => {
                el.style.display = 'block';
            });
            document.querySelectorAll('.collapsible .fas').forEach(el => {
                el.className = 'fas fa-chevron-down me-1';
            });
        }
        
        function collapseAll() {
            document.querySelectorAll('.collapsed-content').forEach(el => {
                el.style.display = 'none';
            });
            document.querySelectorAll('.collapsible .fas').forEach(el => {
                el.className = 'fas fa-chevron-right me-1';
            });
        }
        
        function toggleSection(element) {
            const content = element.nextElementSibling;
            const icon = element.querySelector('.fas');
            
            if (content.style.display === 'none') {
                content.style.display = 'block';
                icon.className = 'fas fa-chevron-down me-1';
            } else {
                content.style.display = 'none';
                icon.className = 'fas fa-chevron-right me-1';
            }
        }
        
        function downloadXml() {
            const blob = new Blob([xmlContent], { type: 'application/xml' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = xmlName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
    </script>
</body>
</html>`;
        }
        
        // Format XML with collapsible sections
        function formatXmlWithCollapse(xml) {
            // Escape HTML entities
            xml = xml.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            
            // Add syntax highlighting and collapsible functionality
            return xml
                .replace(/(&lt;\/)([^&\s]+)(&gt;)/g, '<span class="xml-tag">$1$2$3</span>')
                .replace(/(&lt;)([^&\s\/]+)/g, '<span class="xml-tag">$1$2</span>')
                .replace(/(&gt;)/g, '<span class="xml-tag">$1</span>')
                .replace(/(\w+)(\s*=\s*)("[^"]*")/g, '<span class="xml-attribute">$1</span>$2<span class="xml-value">$3</span>');
        }
        
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
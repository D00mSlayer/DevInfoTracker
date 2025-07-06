// Jira Analysis Controller
angular.module('appLensApp')
    .controller('JiraController', ['$scope', '$timeout', function($scope, $timeout) {
        
        // Jira-specific variables
        $scope.jiraTicketId = '';
        $scope.analysisResults = null;
        $scope.isAnalyzing = false;
        
        // Sample data for demonstration
        $scope.sampleAnalysisData = {
            summary: {
                totalTickets: 7,
                totalGitLinks: 12,
                maxDepth: 3,
                ticketTypes: 4
            },
            tickets: [
                {
                    key: 'PROJ-1234',
                    type: 'Epic',
                    summary: 'User Authentication System Overhaul',
                    status: 'In Progress',
                    assignee: 'John Smith',
                    url: 'https://company.atlassian.net/browse/PROJ-1234',
                    gitLinks: [
                        {
                            url: 'https://github.com/company/auth-service/pull/456',
                            type: 'Pull Request',
                            commentedBy: 'John Smith'
                        },
                        {
                            url: 'https://github.com/company/auth-service/commit/abc123def456',
                            type: 'Commit',
                            commentedBy: 'John Smith'
                        }
                    ],
                    children: [
                        {
                            key: 'PROJ-1235',
                            type: 'User Story',
                            summary: 'Implement OAuth 2.0 Integration',
                            status: 'Done',
                            assignee: 'Jane Doe',
                            url: 'https://company.atlassian.net/browse/PROJ-1235',
                            gitLinks: [
                                {
                                    url: 'https://github.com/company/auth-service/pull/123',
                                    type: 'Pull Request',
                                    commentedBy: 'Jane Doe'
                                },
                                {
                                    url: 'https://github.com/company/frontend/pull/789',
                                    type: 'Pull Request',
                                    commentedBy: 'Jane Doe'
                                }
                            ],
                            children: [
                                {
                                    key: 'PROJ-1236',
                                    type: 'Task',
                                    summary: 'Configure OAuth providers',
                                    status: 'Done',
                                    assignee: 'Mike Wilson',
                                    url: 'https://company.atlassian.net/browse/PROJ-1236',
                                    gitLinks: [
                                        {
                                            url: 'https://github.com/company/config/commit/def789ghi012',
                                            type: 'Commit',
                                            commentedBy: 'Mike Wilson'
                                        }
                                    ],
                                    children: []
                                },
                                {
                                    key: 'PROJ-1237',
                                    type: 'Sub-task',
                                    summary: 'Update OAuth callback URLs',
                                    status: 'Done',
                                    assignee: 'Sarah Johnson',
                                    url: 'https://company.atlassian.net/browse/PROJ-1237',
                                    gitLinks: [
                                        {
                                            url: 'https://github.com/company/auth-service/commit/ghi345jkl678',
                                            type: 'Commit',
                                            commentedBy: 'Sarah Johnson'
                                        }
                                    ],
                                    children: []
                                }
                            ]
                        },
                        {
                            key: 'PROJ-1238',
                            type: 'User Story',
                            summary: 'Implement Multi-Factor Authentication',
                            status: 'In Progress',
                            assignee: 'Tom Brown',
                            url: 'https://company.atlassian.net/browse/PROJ-1238',
                            gitLinks: [
                                {
                                    url: 'https://github.com/company/auth-service/pull/234',
                                    type: 'Pull Request',
                                    commentedBy: 'Tom Brown'
                                }
                            ],
                            children: [
                                {
                                    key: 'PROJ-1239',
                                    type: 'Task',
                                    summary: 'Integrate TOTP library',
                                    status: 'In Progress',
                                    assignee: 'Tom Brown',
                                    url: 'https://company.atlassian.net/browse/PROJ-1239',
                                    gitLinks: [
                                        {
                                            url: 'https://github.com/company/auth-service/commit/jkl901mno234',
                                            type: 'Commit',
                                            commentedBy: 'Tom Brown'
                                        }
                                    ],
                                    children: []
                                }
                            ]
                        },
                        {
                            key: 'PROJ-1240',
                            type: 'Bug',
                            summary: 'Fix session timeout issues',
                            status: 'To Do',
                            assignee: 'Lisa Davis',
                            url: 'https://company.atlassian.net/browse/PROJ-1240',
                            gitLinks: [],
                            children: [
                                {
                                    key: 'PROJ-1241',
                                    type: 'Sub-task',
                                    summary: 'Investigate session storage mechanism',
                                    status: 'To Do',
                                    assignee: 'Lisa Davis',
                                    url: 'https://company.atlassian.net/browse/PROJ-1241',
                                    gitLinks: [
                                        {
                                            url: 'https://github.com/company/auth-service/branch/session-debug',
                                            type: 'Branch',
                                            commentedBy: 'Lisa Davis'
                                        }
                                    ],
                                    children: []
                                }
                            ]
                        }
                    ]
                }
            ]
        };
        
        // Analyze Jira ticket function
        $scope.analyzeJiraTicket = function(ticketId) {
            if (!ticketId) return;
            
            $scope.isAnalyzing = true;
            $scope.analysisResults = null;
            
            // Simulate API call with timeout
            $timeout(function() {
                // In a real implementation, this would make an API call to Jira
                console.log('Analyzing Jira ticket:', ticketId);
                $scope.analysisResults = $scope.sampleAnalysisData;
                $scope.isAnalyzing = false;
            }, 2000);
        };
        
        // Get ticket type styling
        $scope.getTicketTypeClass = function(type) {
            const typeClasses = {
                'Epic': 'bg-primary',
                'User Story': 'bg-success',
                'Task': 'bg-info',
                'Sub-task': 'bg-warning',
                'Bug': 'bg-danger',
                'Defect': 'bg-danger'
            };
            return typeClasses[type] || 'bg-secondary';
        };
        
        // Get border class for tickets
        $scope.getTicketBorderClass = function(type) {
            const borderClasses = {
                'Epic': 'border-primary',
                'User Story': 'border-success',
                'Task': 'border-info',
                'Sub-task': 'border-warning',
                'Bug': 'border-danger',
                'Defect': 'border-danger'
            };
            return borderClasses[type] || 'border-secondary';
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
    }]);
// Jira Analysis Controller
angular.module('appLensApp')
    .controller('JiraController', ['$scope', '$timeout', '$http', function($scope, $timeout, $http) {
        
        // Jira-specific variables
        $scope.jiraTicketId = '';
        $scope.analysisResults = null;
        $scope.isAnalyzing = false;
        
        // Sample data for demonstration
        $scope.sampleAnalysisData = {
            summary: {
                totalTickets: 8,
                totalGitLinks: 12, // Unique count (some duplicates removed)
                maxDepth: 3,
                hasCyclicReferences: true,
                cyclicReferences: ['PROJ-1242'],
                ticketTypeBreakdown: {
                    'Epic': 1,
                    'User Story': 2,
                    'Task': 2,
                    'Sub-task': 2,
                    'Bug': 1
                }
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
                        },
                        {
                            url: 'https://github.com/company/auth-service/branch/feature/oauth-redesign',
                            type: 'Branch',
                            commentedBy: 'John Smith'
                        },
                        {
                            url: 'https://github.com/company/documentation/pull/78',
                            type: 'Pull Request',
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
                                },
                                {
                                    url: 'https://github.com/company/auth-service/pull/456',
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
                                },
                                {
                                    key: 'PROJ-1242',
                                    type: 'Task',
                                    summary: 'Link back to main epic (cyclic reference example)',
                                    status: 'To Do',
                                    assignee: 'System Admin',
                                    url: 'https://company.atlassian.net/browse/PROJ-1242',
                                    gitLinks: [],
                                    children: [],
                                    cyclicReference: true,
                                    error: 'Cyclic reference detected - this ticket was already processed at a higher level'
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
            $scope.analysisError = null;
            
            // Check configuration first
            $http.get('/api/jira/config')
                .then(function(response) {
                    if (!response.data.jira_configured || !response.data.gitlab_configured) {
                        $scope.analysisError = 'API credentials not configured. Please set up Jira and GitLab API credentials.';
                        $scope.isAnalyzing = false;
                        return;
                    }
                    
                    // Make API call to analyze ticket
                    return $http.post('/api/jira/analyze', {ticket_id: ticketId});
                })
                .then(function(response) {
                    if (response && response.data) {
                        if (response.data.error) {
                            $scope.analysisError = response.data.error;
                        } else {
                            $scope.analysisResults = response.data;
                        }
                    }
                    $scope.isAnalyzing = false;
                })
                .catch(function(error) {
                    console.error('Error analyzing Jira ticket:', error);
                    if (error.status === 400 || error.status === 500) {
                        $scope.analysisError = error.data?.error || 'Failed to analyze ticket. Please check your API credentials.';
                    } else {
                        $scope.analysisError = 'Network error. Please check your connection and try again.';
                    }
                    $scope.isAnalyzing = false;
                });
        };
        
        // Show sample data for demonstration
        $scope.showSampleData = function() {
            $scope.isAnalyzing = false;
            $scope.analysisError = null;
            $scope.analysisResults = $scope.sampleAnalysisData;
            $scope.jiraTicketId = 'PROJ-1234';
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
        
        // Get unique ticket types count
        $scope.getUniqueTicketTypesCount = function(ticketTypeBreakdown) {
            return ticketTypeBreakdown ? Object.keys(ticketTypeBreakdown).length : 0;
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
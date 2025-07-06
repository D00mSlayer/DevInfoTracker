# Jira and GitLab API Setup

## Environment Variables Required

To use the Jira Analysis feature with real data, set these environment variables:

### Jira Configuration
```bash
# Your Jira instance URL
JIRA_URL=https://your-company.atlassian.net

# Your Jira username (email)
JIRA_USERNAME=your.email@company.com

# Your Jira API token (create at: https://id.atlassian.com/manage-profile/security/api-tokens)
JIRA_API_TOKEN=your_jira_api_token_here
```

### GitLab Configuration
```bash
# Your GitLab instance URL
GITLAB_URL=https://gitlab.your-company.com

# Your GitLab personal access token (create at: GitLab > User Settings > Access Tokens)
# Required scopes: api, read_api, read_repository
GITLAB_TOKEN=your_gitlab_token_here
```

## How to Set Environment Variables in Replit

1. Go to the "Secrets" tab in your Replit project
2. Add each variable as a new secret:
   - Key: Variable name (e.g., `JIRA_URL`)
   - Value: Your actual value

## Testing

- Use the "Demo" button to test the interface with sample data
- Use real ticket IDs once API credentials are configured
- The system will show configuration errors if credentials are missing

## API Permissions

### Jira API Token
- Create at: https://id.atlassian.com/manage-profile/security/api-tokens
- Permissions: Read access to projects, issues, and comments

### GitLab Personal Access Token
- Create at: GitLab > User Settings > Access Tokens
- Required scopes:
  - `api` - Full API access
  - `read_api` - Read-only API access
  - `read_repository` - Read repository data

## Supported Git Link Types

The system automatically detects and analyzes:
- Merge Requests (`/merge_requests/123`)
- Commits (`/commit/abc123`)
- Branches (`/tree/branch-name`)
- Files (`/blob/main/file.txt`)
- Compare views (`/compare/branch1...branch2`)
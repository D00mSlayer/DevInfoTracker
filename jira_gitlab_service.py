"""
Jira and GitLab API Integration Service
Handles ticket hierarchy analysis and git link extraction
"""

import os
import re
import logging
from typing import Dict, List, Optional, Any
from jira import JIRA
import gitlab
import requests
from urllib.parse import urlparse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class JiraGitLabService:
    """Service for integrating Jira and GitLab APIs"""
    
    def __init__(self):
        # Jira configuration
        self.jira_url = os.environ.get('JIRA_URL', 'https://your-company.atlassian.net')
        self.jira_username = os.environ.get('JIRA_USERNAME', '')
        self.jira_api_token = os.environ.get('JIRA_API_TOKEN', '')
        
        # GitLab configuration
        self.gitlab_url = os.environ.get('GITLAB_URL', 'https://gitlab.com')
        self.gitlab_token = os.environ.get('GITLAB_TOKEN', '')
        
        # Initialize clients
        self.jira_client = None
        self.gitlab_client = None
        
        # Git link patterns for GitLab
        self.git_link_patterns = [
            r'https?://[^/]+/[^/]+/[^/]+/-/merge_requests/\d+',
            r'https?://[^/]+/[^/]+/[^/]+/-/commit/[a-f0-9]+',
            r'https?://[^/]+/[^/]+/[^/]+/-/tree/[^/\s]+',
            r'https?://[^/]+/[^/]+/[^/]+/-/blob/[^/\s]+',
            r'https?://[^/]+/[^/]+/[^/]+/-/compare/[^/\s]+',
        ]
    
    def _initialize_jira_client(self) -> bool:
        """Initialize Jira client with authentication"""
        try:
            if not self.jira_username or not self.jira_api_token:
                logger.error("Jira credentials not configured")
                return False
            
            self.jira_client = JIRA(
                server=self.jira_url,
                basic_auth=(self.jira_username, self.jira_api_token)
            )
            
            # Test connection
            self.jira_client.current_user()
            logger.info("Jira client initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize Jira client: {e}")
            return False
    
    def _initialize_gitlab_client(self) -> bool:
        """Initialize GitLab client with authentication"""
        try:
            if not self.gitlab_token:
                logger.error("GitLab token not configured")
                return False
            
            self.gitlab_client = gitlab.Gitlab(
                url=self.gitlab_url,
                private_token=self.gitlab_token
            )
            
            # Test connection
            self.gitlab_client.auth()
            logger.info("GitLab client initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize GitLab client: {e}")
            return False
    
    def analyze_jira_ticket(self, ticket_id: str) -> Dict[str, Any]:
        """
        Analyze a Jira ticket and its hierarchy, extracting git links from comments
        
        Args:
            ticket_id: The Jira ticket ID to analyze
            
        Returns:
            Dictionary containing analysis results
        """
        if not self._initialize_jira_client():
            return {"error": "Failed to connect to Jira"}
        
        if not self._initialize_gitlab_client():
            return {"error": "Failed to connect to GitLab"}
        
        try:
            # Get the root ticket
            root_ticket = self.jira_client.issue(ticket_id)
            
            # Build the hierarchy
            ticket_hierarchy = self._build_ticket_hierarchy(root_ticket)
            
            # Extract git links from all tickets
            self._extract_git_links_from_hierarchy(ticket_hierarchy)
            
            # Calculate summary
            summary = self._calculate_summary(ticket_hierarchy)
            
            return {
                "success": True,
                "summary": summary,
                "tickets": [ticket_hierarchy]
            }
            
        except Exception as e:
            logger.error(f"Error analyzing ticket {ticket_id}: {e}")
            return {"error": f"Failed to analyze ticket: {str(e)}"}
    
    def _build_ticket_hierarchy(self, ticket, depth=0, max_depth=10) -> Dict[str, Any]:
        """
        Recursively build ticket hierarchy
        
        Args:
            ticket: Jira ticket object
            depth: Current depth in hierarchy
            max_depth: Maximum depth to traverse
            
        Returns:
            Dictionary representing ticket and its children
        """
        if depth > max_depth:
            return None
        
        # Get ticket details
        ticket_data = {
            "key": ticket.key,
            "type": ticket.fields.issuetype.name,
            "summary": ticket.fields.summary,
            "status": ticket.fields.status.name,
            "assignee": ticket.fields.assignee.displayName if ticket.fields.assignee else None,
            "url": f"{self.jira_url}/browse/{ticket.key}",
            "gitLinks": [],
            "children": []
        }
        
        # Get child tickets
        try:
            # Search for tickets that link to this one
            jql = f'parent = {ticket.key} OR "Epic Link" = {ticket.key}'
            child_issues = self.jira_client.search_issues(jql, maxResults=100)
            
            for child_issue in child_issues:
                child_data = self._build_ticket_hierarchy(child_issue, depth + 1, max_depth)
                if child_data:
                    ticket_data["children"].append(child_data)
                    
        except Exception as e:
            logger.warning(f"Error fetching children for {ticket.key}: {e}")
        
        return ticket_data
    
    def _extract_git_links_from_hierarchy(self, ticket_data: Dict[str, Any]) -> None:
        """
        Extract git links from ticket comments and update ticket data
        
        Args:
            ticket_data: Ticket data dictionary to update
        """
        try:
            # Get the ticket from Jira
            ticket = self.jira_client.issue(ticket_data["key"])
            
            # Extract git links from comments
            git_links = []
            comments = self.jira_client.comments(ticket)
            
            for comment in comments:
                links = self._extract_git_links_from_text(comment.body)
                for link in links:
                    git_info = self._get_git_link_info(link)
                    if git_info:
                        git_info["commentedBy"] = comment.author.displayName
                        git_links.append(git_info)
            
            # Also check description
            if ticket.fields.description:
                links = self._extract_git_links_from_text(ticket.fields.description)
                for link in links:
                    git_info = self._get_git_link_info(link)
                    if git_info:
                        git_info["commentedBy"] = ticket.fields.reporter.displayName if ticket.fields.reporter else "Unknown"
                        git_links.append(git_info)
            
            ticket_data["gitLinks"] = git_links
            
        except Exception as e:
            logger.error(f"Error extracting git links for {ticket_data['key']}: {e}")
        
        # Recursively process children
        for child in ticket_data["children"]:
            self._extract_git_links_from_hierarchy(child)
    
    def _extract_git_links_from_text(self, text: str) -> List[str]:
        """
        Extract git links from text using regex patterns
        
        Args:
            text: Text to search for git links
            
        Returns:
            List of found git links
        """
        links = []
        if not text:
            return links
        
        for pattern in self.git_link_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            links.extend(matches)
        
        return list(set(links))  # Remove duplicates
    
    def _get_git_link_info(self, url: str) -> Optional[Dict[str, str]]:
        """
        Get additional information about a git link from GitLab API
        
        Args:
            url: Git link URL
            
        Returns:
            Dictionary with git link information
        """
        try:
            parsed_url = urlparse(url)
            path_parts = parsed_url.path.strip('/').split('/')
            
            if len(path_parts) < 2:
                return {"url": url, "type": "Unknown", "status": "Unknown"}
            
            project_path = '/'.join(path_parts[:2])
            
            # Determine link type based on URL structure
            if '/merge_requests/' in url:
                mr_id = path_parts[-1]
                return self._get_merge_request_info(project_path, mr_id, url)
            elif '/commit/' in url:
                commit_id = path_parts[-1]
                return self._get_commit_info(project_path, commit_id, url)
            elif '/tree/' in url or '/blob/' in url:
                return {"url": url, "type": "Branch/File", "status": "Active"}
            else:
                return {"url": url, "type": "Repository", "status": "Active"}
                
        except Exception as e:
            logger.error(f"Error getting git link info for {url}: {e}")
            return {"url": url, "type": "Unknown", "status": "Unknown"}
    
    def _get_merge_request_info(self, project_path: str, mr_id: str, url: str) -> Dict[str, str]:
        """Get merge request information from GitLab API"""
        try:
            project = self.gitlab_client.projects.get(project_path)
            mr = project.mergerequests.get(mr_id)
            
            return {
                "url": url,
                "type": "Merge Request",
                "status": mr.state.capitalize(),
                "title": mr.title,
                "author": mr.author.get('name', 'Unknown')
            }
        except Exception as e:
            logger.error(f"Error getting MR info: {e}")
            return {"url": url, "type": "Merge Request", "status": "Unknown"}
    
    def _get_commit_info(self, project_path: str, commit_id: str, url: str) -> Dict[str, str]:
        """Get commit information from GitLab API"""
        try:
            project = self.gitlab_client.projects.get(project_path)
            commit = project.commits.get(commit_id)
            
            return {
                "url": url,
                "type": "Commit",
                "status": "Committed",
                "title": commit.title,
                "author": commit.author_name
            }
        except Exception as e:
            logger.error(f"Error getting commit info: {e}")
            return {"url": url, "type": "Commit", "status": "Unknown"}
    
    def _calculate_summary(self, ticket_hierarchy: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate summary statistics for the ticket hierarchy
        
        Args:
            ticket_hierarchy: Root ticket data
            
        Returns:
            Summary statistics
        """
        total_tickets = 0
        total_git_links = 0
        max_depth = 0
        ticket_types = {}
        
        def traverse(ticket_data, depth=0):
            nonlocal total_tickets, total_git_links, max_depth, ticket_types
            
            total_tickets += 1
            total_git_links += len(ticket_data.get("gitLinks", []))
            max_depth = max(max_depth, depth)
            
            ticket_type = ticket_data.get("type", "Unknown")
            ticket_types[ticket_type] = ticket_types.get(ticket_type, 0) + 1
            
            for child in ticket_data.get("children", []):
                traverse(child, depth + 1)
        
        traverse(ticket_hierarchy)
        
        return {
            "totalTickets": total_tickets,
            "totalGitLinks": total_git_links,
            "maxDepth": max_depth,
            "ticketTypeBreakdown": ticket_types
        }
    
    def check_configuration(self) -> Dict[str, bool]:
        """
        Check if API credentials are configured
        
        Returns:
            Dictionary with configuration status
        """
        return {
            "jira_configured": bool(self.jira_username and self.jira_api_token),
            "gitlab_configured": bool(self.gitlab_token),
            "jira_url": self.jira_url,
            "gitlab_url": self.gitlab_url
        }
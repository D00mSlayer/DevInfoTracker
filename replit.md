# AppLens

## Overview

AppLens is a Flask-based internal developer tool that provides environment and service management for a single product organization. The application offers a clean, desktop-optimized interface for developers to quickly access environment information, database configurations, microservice details, and perform configuration searches across XML files.

## System Architecture

The application follows a simple client-server architecture:

- **Frontend**: HTML templates with AngularJS for dynamic interactions
- **Backend**: Flask web framework providing both web routes and REST API endpoints
- **Data Storage**: YAML file-based data storage (no database required)
- **Styling**: Bootstrap with dark theme and custom CSS
- **Icons**: Font Awesome for visual elements

## Key Components

### Backend (Flask)
- **app.py**: Main Flask application with route definitions
- **main.py**: Application entry point with development server configuration
- **Data Loading**: YAML file parsing with error handling
- **API Endpoints**: RESTful endpoints for data retrieval and search

### Frontend
- **base.html**: Base template with Bootstrap integration and navigation
- **index.html**: Main dashboard template with AngularJS integration
- **custom.css**: Custom styling for enhanced UI appearance
- **app.js**: AngularJS controller for dynamic functionality

### Data Management
- **data.yaml**: YAML-based data storage for products and environments
- **File-based approach**: Simple data persistence without database complexity

## Data Flow

1. **Initial Load**: Flask serves the main page with embedded data
2. **Dynamic Loading**: AngularJS can fetch data via API endpoints if needed
3. **Search**: Real-time search queries sent to backend API
4. **Response**: JSON responses formatted for frontend consumption

## External Dependencies

### Python Libraries
- **Flask**: Web framework for routing and templating
- **PyYAML**: YAML file parsing
- **Flask-CORS**: Cross-origin resource sharing support

### Frontend Libraries
- **Bootstrap 5.3**: UI framework with dark theme
- **AngularJS 1.8**: Frontend framework for dynamic interactions
- **Font Awesome 6.4**: Icon library

### CDN Resources
- Bootstrap CSS/JS from CDN
- AngularJS from Google CDN
- Font Awesome from CDN

## Deployment Strategy

The application is configured for development deployment with:
- Debug mode enabled
- Host binding to 0.0.0.0 for container compatibility
- Port 5000 as default
- Environment variable support for session secrets

Production deployment would require:
- Disabling debug mode
- Proper secret key management
- WSGI server configuration
- Static file serving optimization

## Recent Changes

- July 06, 2025: Complete interface redesign and optimization
  - Changed application name to "AppLens"
  - Removed multi-product navigation in favor of base product selection
  - Implemented desktop-optimized modern design with full-width layout
  - Added sticky sidebar navigation for better UX
  - Enhanced environment cards with quick stats
  - Maintained modal view for detailed environment information
  - Fixed horizontal scrollbar issues for desktop optimization
  - Removed background gradients for minimal clean appearance
  - Updated database structure to include: type (primary/secondary), host, port, database, username, password
  - Added individual collapsible version sections (no auto-expand)
  - Redesigned modal layout with proper alignment and overflow handling
  - Added copy-to-clipboard functionality for all database fields
  - Aligned configuration search input and button using Bootstrap input-group
  - Removed sidebar navigation and replaced with clean top navigation bar using Bootstrap nav-pills
  - Fixed modal data display issue by implementing SharedDataService for proper data sharing
  - Added comprehensive Jira Analysis view with hierarchical ticket parsing and GitLab integration
  - Built Jira and GitLab API service for real-time ticket analysis and git link extraction
  - Implemented ticket type breakdown in analysis summary with proper visual styling
  - Created error handling and configuration checking for API credentials
  - Added demo mode for testing interface without API credentials
  - Enhanced git links display with improved container and scrolling for multiple links
  - Fixed input-button alignment using Bootstrap input-group components

## User Preferences

- Preferred communication style: Simple, everyday language
- Application name: AppLens
- Single product focus (not multi-product dashboard)
- Desktop-only interface (no mobile support needed)
- Clean minimal design with white background (no gradients)
- Full-width layout with minimal margins
- Individual collapsible sections (no auto-expand behavior)
- Database fields: type, host, port, database, username, password
# Product Environment Manager

## Overview

This is a Flask-based web application that manages and displays product environments in a hierarchical structure. The application provides a user-friendly interface to browse products, environments, and services, with search functionality to quickly find specific items within the hierarchy.

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

## Changelog

- July 06, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.
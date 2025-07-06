# Product Environment Manager

A Flask-based web application for managing and viewing product environments, databases, and microservices in a hierarchical structure. Built with AngularJS frontend and Bootstrap styling.

## Features

- **Hierarchical Product Management**: Navigate through Products → Base Products → Versions → Environments
- **Environment Details**: View site URLs, git builds (branches/tags), databases, and microservices
- **Search Functionality**: Search across all hierarchy levels
- **Configuration Search**: Built-in support for XML configuration search (ready for MSSQL integration)
- **Clean Light Theme**: Professional, modern interface with Bootstrap styling
- **Responsive Design**: Works on desktop and mobile devices

## Architecture

- **Backend**: Flask with REST API endpoints
- **Frontend**: AngularJS with Bootstrap 5
- **Data Storage**: YAML file-based configuration
- **Database Support**: Ready for MSSQL integration for configuration search
- **Deployment**: Docker containerized application

## Quick Start

### Using Docker (Recommended)

1. **Clone and build**:
   ```bash
   docker-compose up --build
   ```

2. **Access the application**:
   - Open http://localhost:5000 in your browser

### Manual Setup

1. **Install dependencies**:
   ```bash
   pip install flask flask-cors pyyaml gunicorn
   ```

2. **Run the application**:
   ```bash
   python main.py
   ```

3. **Access the application**:
   - Open http://localhost:5000 in your browser

## Configuration

### Data Structure (data.yaml)

The application uses a YAML file to define the product hierarchy:

```yaml
products:
  - name: "Product Name"
    description: "Product description"
    bases:
      - name: "Base Product"
        description: "Base description"
        versions:
          - name: "v1"
            description: "Version description"
            environments:
              - name: "dev"
                site_url: "https://dev.example.com"
                git_build_url: "https://github.com/repo/branch"
                git_type: "branch"  # or "tag"
                databases:
                  - name: "primary"
                    server: "db.example.com"
                    port: 1433
                    database: "app_db"
                    status: "online"
                microservices:
                  - name: "service-name"
                    server_url: "https://service.example.com"
                    port: 8080
                    git_build_url: "https://github.com/service/branch"
                    git_type: "branch"
                    status: "online"
```

### Environment Variables

- `SESSION_SECRET`: Flask session secret (required for production)
- `FLASK_ENV`: Set to `production` for production deployment

## Usage

### Navigation

1. **Select a Product**: Click on a product in the left sidebar
2. **Choose Version**: Use the dropdown to select a version for each base product
3. **View Environment**: Click "View Details" on any environment card
4. **Search**: Use the search bar to find specific items across the hierarchy

### Environment Details

The detailed view shows:
- Site URL and git build information
- Database configurations with status
- Microservice details with URLs and git builds
- Configuration search interface

### Configuration Search

The application includes a placeholder for XML configuration search functionality. To implement:

1. Connect to your MSSQL database
2. Implement the search logic in the Flask backend
3. The UI is already prepared for displaying search results

## Development

### Project Structure

```
├── app.py              # Flask application and routes
├── main.py             # Application entry point
├── data.yaml           # Product hierarchy data
├── templates/          # Jinja2 templates
│   ├── base.html      # Base template
│   └── index.html     # Main application template
├── static/            # Static assets
│   ├── css/
│   │   └── custom.css # Custom styling
│   └── js/
│       └── app.js     # AngularJS application
├── Dockerfile         # Docker configuration
├── docker-compose.yml # Docker Compose setup
└── README.md          # This file
```

### API Endpoints

- `GET /` - Main application page
- `GET /api/data` - Get all product data
- `GET /api/search?q=term` - Search across hierarchy

### Customization

1. **Styling**: Modify `static/css/custom.css`
2. **Functionality**: Update `static/js/app.js`
3. **Data Structure**: Edit `data.yaml`
4. **Backend Logic**: Modify `app.py`

## Database Integration (MSSQL)

To add MSSQL support for configuration search:

1. **Install dependencies**:
   ```bash
   pip install pyodbc
   ```

2. **Update docker-compose.yml**:
   - Uncomment the MSSQL service section

3. **Implement search logic**:
   - Add database connection in `app.py`
   - Implement XML configuration search
   - Connect to the existing UI placeholder

## Production Deployment

### Docker Deployment

1. **Set environment variables**:
   ```bash
   export SESSION_SECRET="your-secret-key"
   ```

2. **Deploy with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

### Manual Deployment

1. **Install dependencies**
2. **Set environment variables**
3. **Run with Gunicorn**:
   ```bash
   gunicorn --bind 0.0.0.0:5000 --workers 2 main:app
   ```

## Security Considerations

- Set a strong `SESSION_SECRET` in production
- Use HTTPS in production environments
- Secure database connections with proper credentials
- Validate user inputs for configuration search
- Implement proper access controls as needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
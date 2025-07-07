# AppLens

A comprehensive Flask-based internal developer tool for managing microservice environments, configuration tracking, and analysis.

## Features

- **Environment Management**: Hierarchical view of Products → Versions → Environments
- **Database Configuration**: MSSQL connectivity with XML configuration search
- **Microservice Monitoring**: Real-time health checks and status monitoring
- **Splunk Integration**: Quick access to logging and monitoring dashboards
- **Jenkins Integration**: Bookmark and organize 100+ Jenkins job URLs
- **Jira Analysis**: Parse ticket hierarchies and extract git links
- **SQL Query Editor**: Execute raw SQL queries with results export

## Tech Stack

- **Backend**: Flask with REST API architecture
- **Frontend**: AngularJS Single Page Application
- **Database**: MSSQL with pyodbc driver
- **Styling**: Bootstrap 5 with custom theming
- **Configuration**: YAML-based data storage

## Setup Instructions

### 1. Clone and Configure

```bash
git clone https://github.com/yourusername/applens.git
cd applens

# Copy and customize your data configuration
cp data.yaml.template data.yaml
# Edit data.yaml with your actual environment data
```

### 2. Local Development

```bash
# Install dependencies (from pyproject.toml)
pip install email-validator flask flask-cors flask-sqlalchemy gunicorn jira psycopg2-binary pyodbc python-gitlab pyyaml requests trafilatura

# Set environment variables
export SESSION_SECRET="your-secret-key-here"
export DATABASE_URL="your-database-url"  # Optional: for PostgreSQL features

# Run the application
python main.py
```

### 3. Docker Deployment

#### Production Deployment
```bash
# Copy and customize your data configuration
cp data.yaml.template data.yaml
# Edit data.yaml with your actual environment data

# Build and run with Docker Compose (production)
docker-compose up -d

# Or build and run directly with volume mount
docker build -t applens .
docker run -p 5000:5000 \
  -e SESSION_SECRET="your-secret-key-here" \
  -v $(pwd)/data.yaml:/app/data.yaml:ro \
  applens
```

#### Development with Live Code Updates & Debugging
```bash
# Copy and customize your data configuration
cp data.yaml.template data.yaml
# Edit data.yaml with your actual environment data

# Run in development mode with live code reload
docker-compose -f docker-compose.dev.yml up -d

# View logs to see debug output
docker-compose -f docker-compose.dev.yml logs -f applens-dev

# Attach to container for interactive debugging
docker-compose -f docker-compose.dev.yml exec applens-dev bash
```

**Development Features**:
- **Live Code Updates**: Changes to Python files on your host machine are immediately reflected in the container
- **Python Debugging**: You can use `pdb.set_trace()` or `breakpoint()` in your code
- **Interactive Console**: Use `stdin_open: true` and `tty: true` for interactive debugging
- **Auto-reload**: Flask automatically reloads when you modify files
- **Debug Mode**: Full Flask debugging enabled with detailed error pages

**Volume Mounting**:
- `data.yaml` is mounted read-only for configuration updates
- Entire project directory is mounted read-write for live code development
- Changes to any Python file trigger automatic Flask reloads

### 4. Configuration

Edit `data.yaml` with your environment information:

- **Products**: Your applications/services
- **Versions**: Different versions of your applications
- **Environments**: Dev, staging, production environments
- **Databases**: Connection strings and credentials
- **Microservices**: Service URLs and health check endpoints
- **Splunk**: Logging configuration (base URL, index, source type)

### 5. Security Considerations

- **data.yaml**: Contains sensitive information (passwords, URLs) - be careful when committing to version control
- **Docker Volume Mounting**: The `data.yaml` file is mounted as read-only for live updates
- **SESSION_SECRET**: Use a strong secret key in production
- **Database Credentials**: Store securely, consider using environment variables
- **API Keys**: Use environment variables for Jira/GitLab API keys if using those features
- **File Permissions**: Ensure `data.yaml` has appropriate file permissions (600 recommended)

### 6. Optional Features

#### Jira Integration
Set environment variables:
```bash
export JIRA_URL="https://yourcompany.atlassian.net"
export JIRA_EMAIL="your-email@company.com"
export JIRA_API_TOKEN="your-api-token"
```

#### GitLab Integration
Set environment variables:
```bash
export GITLAB_URL="https://gitlab.yourcompany.com"
export GITLAB_TOKEN="your-access-token"
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
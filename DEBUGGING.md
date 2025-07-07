# Debugging Guide for AppLens

This guide explains how to debug AppLens when running in Docker with live code updates.

## Development Setup

### 1. Start Development Environment
```bash
# Run in development mode with live code reload
docker-compose -f docker-compose.dev.yml up -d

# View logs in real-time
docker-compose -f docker-compose.dev.yml logs -f applens-dev
```

### 2. Using Python Debugger (pdb)

Add debugging statements to your Python code:

```python
# In any Python file (e.g., app.py, database_service.py)
import pdb

def my_function():
    # Your code here
    pdb.set_trace()  # Execution will pause here
    # Or use the newer breakpoint() function
    breakpoint()
    # Rest of your code
```

### 3. Interactive Debugging Session

When the debugger is triggered:

```bash
# Attach to the running container
docker-compose -f docker-compose.dev.yml exec applens-dev bash

# Or if you need to see the debugger output directly
docker-compose -f docker-compose.dev.yml exec applens-dev python -c "
import pdb
import app
pdb.run('app.test_function()')
"
```

### 4. Common Debugging Scenarios

#### Debug API Endpoints
```python
# In app.py
@app.route('/api/data')
def get_data():
    import pdb; pdb.set_trace()  # Debug API call
    data = load_data()
    return jsonify(data)
```

#### Debug Database Operations
```python
# In database_service.py
def test_database_connection(self, db_config):
    import pdb; pdb.set_trace()  # Debug database connection
    try:
        connection_string = self._build_connection_string(db_config)
        # ... rest of the method
```

#### Debug Frontend Issues
```python
# In app.py route that serves templates
@app.route('/')
def index():
    import pdb; pdb.set_trace()  # Debug template rendering
    data = load_data()
    return render_template('index.html', data=data)
```

### 5. Live Code Updates

Any changes you make to Python files on your host machine will:
- Be immediately reflected in the Docker container
- Trigger Flask's auto-reload mechanism
- Restart the application automatically

### 6. Debugging Tips

#### View Application Logs
```bash
# Follow logs in real-time
docker-compose -f docker-compose.dev.yml logs -f applens-dev

# View last 100 lines
docker-compose -f docker-compose.dev.yml logs --tail=100 applens-dev
```

#### Access Container Shell
```bash
# Access the container's bash shell
docker-compose -f docker-compose.dev.yml exec applens-dev bash

# Install additional debugging tools if needed
pip install ipdb  # Enhanced debugger
```

#### Debug Environment Variables
```python
# Check environment variables
import os
print(f"FLASK_DEBUG: {os.environ.get('FLASK_DEBUG')}")
print(f"FLASK_ENV: {os.environ.get('FLASK_ENV')}")
```

### 7. Production vs Development

#### Development Mode Features:
- Flask debug mode enabled
- Auto-reload on file changes
- Detailed error pages
- Interactive debugger support
- Live code updates

#### Production Mode:
- Optimized for performance
- No auto-reload
- Minimal error information
- Gunicorn WSGI server
- Stable deployment

### 8. Troubleshooting

#### Debugger Not Working?
1. Ensure you're using the development compose file: `docker-compose.dev.yml`
2. Check that `FLASK_DEBUG=1` is set in the environment
3. Verify the container is running: `docker ps`
4. Check logs for errors: `docker-compose -f docker-compose.dev.yml logs applens-dev`

#### Code Changes Not Reflected?
1. Ensure you're editing files on the host machine, not inside the container
2. Check that the volume mount is working: `docker-compose -f docker-compose.dev.yml exec applens-dev ls -la /app`
3. Verify Flask auto-reload is enabled in the logs

#### Can't Access Interactive Debugger?
1. Use `stdin_open: true` and `tty: true` in docker-compose.dev.yml (already configured)
2. Attach to the container when debugger is active
3. Consider using logging instead of interactive debugging for complex scenarios

### 9. Alternative: Using IDE Debugging

Many IDEs support remote debugging with Docker:

#### VS Code with Remote Containers
1. Install "Remote - Containers" extension
2. Open project in container
3. Set breakpoints in VS Code
4. Debug directly from the IDE

#### PyCharm Professional
1. Configure Docker interpreter
2. Set up remote debugging
3. Use PyCharm's debugging features

This setup provides a powerful development environment with live code updates and full debugging capabilities while maintaining the benefits of containerized deployment.
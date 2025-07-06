import os
import yaml
import logging
from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
from jira_gitlab_service import JiraGitLabService

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")

# Configure Jinja2 to work with AngularJS
app.jinja_env.variable_start_string = '[['
app.jinja_env.variable_end_string = ']]'
app.jinja_env.block_start_string = '[%'
app.jinja_env.block_end_string = '%]'

# Enable CORS for API endpoints
CORS(app)

# Initialize Jira GitLab service
jira_gitlab_service = JiraGitLabService()

def load_data():
    """Load data from YAML file"""
    try:
        with open('data.yaml', 'r') as file:
            data = yaml.safe_load(file)
            return data
    except FileNotFoundError:
        logging.error("data.yaml file not found")
        return {"products": [], "jenkins_jobs": []}
    except yaml.YAMLError as e:
        logging.error(f"Error parsing YAML: {e}")
        return {"products": [], "jenkins_jobs": []}

@app.route('/')
def index():
    """Main page displaying the product hierarchy"""
    data = load_data()
    return render_template('index.html', data=data)

@app.route('/templates/environments')
def environments_template():
    """Serve environments template"""
    return render_template('environments.html')

@app.route('/templates/jenkins')
def jenkins_template():
    """Serve jenkins template"""
    return render_template('jenkins.html')

@app.route('/templates/jira')
def jira_template():
    """Serve jira template"""
    return render_template('jira.html')

@app.route('/api/data')
def get_data():
    """API endpoint to get all data"""
    data = load_data()
    return jsonify(data)

@app.route('/api/search')
def search():
    """API endpoint for searching across the hierarchy"""
    query = request.args.get('q', '').lower()
    if not query:
        return jsonify({"results": []})
    
    data = load_data()
    results = []
    
    # Search through the hierarchy
    for product in data.get('products', []):
        product_name = product.get('name', '')
        
        # Search in product name
        if query in product_name.lower():
            results.append({
                'type': 'product',
                'name': product_name,
                'path': [product_name]
            })
        
        # Search in base products
        for base in product.get('bases', []):
            base_name = base.get('name', '')
            
            if query in base_name.lower():
                results.append({
                    'type': 'base',
                    'name': base_name,
                    'path': [product_name, base_name]
                })
            
            # Search in versions
            for version in base.get('versions', []):
                version_name = version.get('name', '')
                
                if query in version_name.lower():
                    results.append({
                        'type': 'version',
                        'name': version_name,
                        'path': [product_name, base_name, version_name]
                    })
                
                # Search in environments
                for env in version.get('environments', []):
                    env_name = env.get('name', '')
                    
                    if query in env_name.lower():
                        results.append({
                            'type': 'environment',
                            'name': env_name,
                            'path': [product_name, base_name, version_name, env_name]
                        })
                    
                    # Search in microservices
                    for service in env.get('microservices', []):
                        service_name = service.get('name', '')
                        if query in service_name.lower():
                            results.append({
                                'type': 'microservice',
                                'name': service_name,
                                'path': [product_name, base_name, version_name, env_name, service_name]
                            })
    
    return jsonify({"results": results[:20]})  # Limit results

@app.route('/api/jira/analyze', methods=['POST'])
def analyze_jira_ticket():
    """API endpoint for analyzing Jira tickets"""
    try:
        data = request.get_json()
        ticket_id = data.get('ticket_id')
        
        if not ticket_id:
            return jsonify({"error": "No ticket ID provided"}), 400
        
        # Check if API credentials are configured
        config_status = jira_gitlab_service.check_configuration()
        if not config_status["jira_configured"]:
            return jsonify({
                "error": "Jira API credentials not configured. Please set JIRA_URL, JIRA_USERNAME, and JIRA_API_TOKEN environment variables."
            }), 400
        
        if not config_status["gitlab_configured"]:
            return jsonify({
                "error": "GitLab API credentials not configured. Please set GITLAB_URL and GITLAB_TOKEN environment variables."
            }), 400
        
        # Analyze the ticket
        result = jira_gitlab_service.analyze_jira_ticket(ticket_id)
        
        if "error" in result:
            return jsonify(result), 500
        
        return jsonify(result)
        
    except Exception as e:
        logging.error(f"Error in analyze_jira_ticket: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/jira/config')
def jira_config_status():
    """API endpoint to check Jira/GitLab configuration status"""
    try:
        config_status = jira_gitlab_service.check_configuration()
        return jsonify(config_status)
    except Exception as e:
        logging.error(f"Error checking configuration: {e}")
        return jsonify({"error": "Failed to check configuration"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

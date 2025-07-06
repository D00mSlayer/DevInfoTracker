import os
import yaml
import logging
from flask import Flask, render_template, jsonify, request, Response
from flask_cors import CORS
from jira_gitlab_service import JiraGitLabService
from database_service import DatabaseService

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

# Initialize services
jira_gitlab_service = JiraGitLabService()
database_service = DatabaseService()

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

@app.route('/api/database/test', methods=['POST'])
def test_database_connection():
    """API endpoint to test database connectivity"""
    try:
        data = request.get_json()
        db_config = data.get('database_config')
        
        if not db_config:
            return jsonify({"error": "No database configuration provided"}), 400
        
        success, message = database_service.test_database_connection(db_config)
        
        return jsonify({
            "success": success,
            "message": message,
            "database": f"{db_config.get('host', 'Unknown')}\\{db_config.get('database', 'Unknown')}"
        })
        
    except Exception as e:
        logging.error(f"Error testing database connection: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/database/xml-configs', methods=['POST'])
def get_xml_configurations():
    """API endpoint to get XML configuration names"""
    try:
        data = request.get_json()
        db_config = data.get('database_config')
        
        if not db_config:
            return jsonify({"error": "No database configuration provided"}), 400
        
        success, xml_names, error_msg = database_service.get_xml_configurations(db_config)
        
        return jsonify({
            "success": success,
            "xml_names": xml_names,
            "error": error_msg
        })
        
    except Exception as e:
        logging.error(f"Error retrieving XML configurations: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/database/xml-content', methods=['POST'])
def get_xml_content():
    """API endpoint to get specific XML content"""
    try:
        data = request.get_json()
        db_config = data.get('database_config')
        xml_name = data.get('xml_name')
        
        if not xml_name:
            return jsonify({"error": "No XML name provided"}), 400
        
        if not db_config:
            return jsonify({"error": "No database configuration provided"}), 400
        
        success, xml_content, error_msg = database_service.get_xml_content(db_config, xml_name)
        
        return jsonify({
            "success": success,
            "xml_content": xml_content,
            "xml_name": xml_name,
            "error": error_msg
        })
        
    except Exception as e:
        logging.error(f"Error retrieving XML content: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/database/xml-download', methods=['POST'])
def download_xml_content():
    """API endpoint to download XML content as file"""
    try:
        data = request.get_json()
        db_config = data.get('database_config')
        xml_name = data.get('xml_name')
        
        if not xml_name:
            return jsonify({"error": "No XML name provided"}), 400
        
        if not db_config:
            return jsonify({"error": "No database configuration provided"}), 400
            
        success, xml_content, error_msg = database_service.get_xml_content(db_config, xml_name)
        
        if not success:
            return jsonify({"error": error_msg}), 500
        
        # Create file response
        response = Response(
            xml_content,
            mimetype='application/xml',
            headers={
                'Content-Disposition': f'attachment; filename="{xml_name}"',
                'Content-Type': 'application/xml; charset=utf-8'
            }
        )
        
        return response
        
    except Exception as e:
        logging.error(f"Error downloading XML content: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/database/xml-search', methods=['POST'])
def search_xml_configurations():
    """API endpoint to search XML configurations"""
    try:
        data = request.get_json()
        db_config = data.get('database_config')
        search_term = data.get('search_term', '').strip()
        
        if not search_term:
            return jsonify({"error": "No search term provided"}), 400
        
        if not db_config:
            return jsonify({"error": "No database configuration provided"}), 400
        
        success, results, error_msg = database_service.search_xml_configurations(db_config, search_term)
        
        return jsonify({
            "success": success,
            "results": results,
            "error": error_msg
        })
        
    except Exception as e:
        logging.error(f"Error searching XML configurations: {e}")
        return jsonify({"error": "Internal server error"}), 500


@app.route('/api/database/execute-sql', methods=['POST'])
def execute_sql_query():
    """API endpoint to execute SQL queries"""
    try:
        data = request.json or {}
        sql_query = data.get('sql_query', '').strip()
        database_config = data.get('database_config')
        
        if not sql_query:
            return jsonify({
                'success': False,
                'error': 'SQL query is required'
            })
        
        if not database_config:
            return jsonify({
                'success': False,
                'error': 'Database configuration is required'
            })
        
        db_service = DatabaseService()
        success, data_results, columns, row_count, error = db_service.execute_sql_query(database_config, sql_query)
        
        if success:
            return jsonify({
                'success': True,
                'data': data_results,
                'columns': columns,
                'row_count': row_count
            })
        else:
            return jsonify({
                'success': False,
                'error': error
            })
    
    except Exception as e:
        logging.error(f"Error in execute_sql_query: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        })


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

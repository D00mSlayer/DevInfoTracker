from app import app
import os

if __name__ == '__main__':
    # Enable debugging and auto-reload for development
    debug_mode = os.environ.get('FLASK_DEBUG', '0') == '1'
    app.run(
        host='0.0.0.0', 
        port=5000, 
        debug=debug_mode,
        use_reloader=debug_mode,
        use_debugger=debug_mode
    )

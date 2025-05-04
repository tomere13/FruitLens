import certifi
import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

# Import blueprints from the routes folder
from routes.register import register_bp
from routes.login import login_bp
from routes.process import process_bp
from routes.profile import profile_bp
from routes.changepassword import change_password_bp
from routes.openai import openai_bp
from routes.scraper import scraper_bp
from routes.contact import contact_bp
from routes.email import email_bp
# Import shared instances from extensions
from extensions import bcrypt, mongo, jwt

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("FlaskApp")

app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={r"/*": {"origins": "*", "allow_headers": ["Content-Type", "Authorization"]}})

# Load environment variables from .env file
load_dotenv()

app.config["MONGO_URI"] = os.getenv("MONGO_URI")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

# Initialize shared instances with the app
bcrypt.init_app(app)
mongo.init_app(app, tlsCAFile=certifi.where())
jwt.init_app(app)

# Register blueprints
app.register_blueprint(register_bp)
app.register_blueprint(login_bp)
app.register_blueprint(process_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(change_password_bp)
app.register_blueprint(openai_bp)
app.register_blueprint(scraper_bp)
app.register_blueprint(contact_bp)
app.register_blueprint(email_bp)

# Error handler for all routes
@app.errorhandler(Exception)
def handle_error(e):
    logger.error(f"Unhandled error: {str(e)}")
    return jsonify({"status": "error", "message": str(e)}), 500

# Default route
@app.route('/')
def index():
    return jsonify({"status": "success", "message": "FruitLens API is running"})

# Mobile compatibility check
@app.route('/check-mobile')
def check_mobile():
    user_agent = request.headers.get('User-Agent', '')
    is_mobile = 'Mobile' in user_agent or 'iPhone' in user_agent or 'Android' in user_agent
    return jsonify({
        "status": "success", 
        "is_mobile": is_mobile,
        "user_agent": user_agent
    })

# Health check route
@app.route('/health')
def health():
    return jsonify({"status": "up"})

if __name__ == '__main__':
    # Set environment variable for the scraper
    if os.environ.get('FLASK_ENV') == 'production':
        os.environ['SERVER_ENV'] = 'production'
        
    port = int(os.environ.get('PORT', 5002))
    app.run(host='0.0.0.0', port=port, debug=True)

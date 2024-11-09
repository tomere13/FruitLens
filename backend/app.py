import certifi
import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

# Import blueprints from the routes folder
from routes.register import register_bp
from routes.login import login_bp
from routes.process import process_bp
from routes.profile import profile_bp
from routes.changepassword import change_password_bp
from routes.openai import openai_bp
from routes.scraper import scraper_bp
# Import shared instances from extensions
from extensions import bcrypt, mongo, jwt

app = Flask(__name__)
CORS(app)  # This will allow cross-origin requests

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




if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)

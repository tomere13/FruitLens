# auth/login.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from extensions import bcrypt, mongo  # Import shared instances from extensions.py

# Define a blueprint for the login route
login_bp = Blueprint('login_bp', __name__)

@login_bp.route('/login', methods=['POST'])
def login():
    users = mongo.db.users
    username = request.json.get('username')
    password = request.json.get('password')

    user = users.find_one({'username': username})

    if user and bcrypt.check_password_hash(user['password'], password):
        access_token = create_access_token(identity=str(user['_id']))
        return jsonify({'token': access_token}), 200

    return jsonify({'message': 'Invalid credentials'}), 401

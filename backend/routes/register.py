# auth/register.py
from flask import Blueprint, request, jsonify
from extensions import bcrypt, mongo  # Import the initialized instances from extensions.py

# Define a blueprint for the register route
register_bp = Blueprint('register_bp', __name__)

@register_bp.route('/register', methods=['POST'])
def register():
    users = mongo.db.users
    username = request.json.get('username')
    password = request.json.get('password')
    email = request.json.get('email')


    if users.find_one({'username': username}):
        return jsonify({'message': 'User already exists'}), 409

    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    users.insert_one({'username': username, 'password': hashed_pw,'email':email})

    return jsonify({'message': 'User registered successfully'}), 201

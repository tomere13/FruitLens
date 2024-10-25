# routes/change_password.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import bcrypt, mongo  # Import shared instances from extensions.py
from bson import ObjectId

# Define a blueprint for the change password route
change_password_bp = Blueprint('change_password_bp', __name__)

@change_password_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    users = mongo.db.users
    user_id = get_jwt_identity()
    user = users.find_one({'_id': ObjectId(user_id)})

    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Get the current and new password from the request
    current_password = request.json.get('current_password')
    new_password = request.json.get('new_password')

    # Check if the current password matches the stored hashed password
    if not bcrypt.check_password_hash(user['password'], current_password):
        return jsonify({'message': 'Incorrect current password'}), 401

    # Validate the new password (e.g., length)
    #if len(new_password) < 6:
    #    return jsonify({'message': 'New password must be at least 6 characters long'}), 400

    # Hash the new password
    hashed_new_password = bcrypt.generate_password_hash(new_password).decode('utf-8')

    # Update the user's password in the database
    users.update_one({'_id': ObjectId(user_id)}, {'$set': {'password': hashed_new_password}})

    return jsonify({'message': 'Password updated successfully'}), 200
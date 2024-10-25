# routes/profile.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import bcrypt, mongo  # Import shared instances from extensions.py
from bson import ObjectId  # For handling MongoDB ObjectIds

# Define a blueprint for the profile routes
profile_bp = Blueprint('profile_bp', __name__)

@profile_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    users = mongo.db.users
    user_id = get_jwt_identity()
    user = users.find_one({'_id': ObjectId(user_id)})

    if user:
        profile_data = {
            'username': user.get('username', ''),
            'email': user.get('email', ''),
        }
        return jsonify(profile_data), 200

    return jsonify({'message': 'User not found'}), 404


# routes/profile.py

# routes/profile.py

@profile_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    users = mongo.db.users
    user_id = get_jwt_identity()
    user = users.find_one({'_id': ObjectId(user_id)})

    if not user:
        return jsonify({'message': 'User not found'}), 404

    data = request.get_json()
    update_fields = {}

    # Update username, email, bio if present
    if 'username' in data:
        update_fields['username'] = data['username']
    if 'email' in data:
        update_fields['email'] = data['email']
    if 'bio' in data:
        update_fields['bio'] = data['bio']

    # Check if the user wants to update the password
    current_password = data.get('current_password')
    new_password = data.get('new_password')

    if current_password and new_password:
        # Verify if the current password is correct
        if not bcrypt.check_password_hash(user['password'], current_password):
            return jsonify({'message': 'Incorrect current password'}), 401

        # Validate the new password (e.g., length)
        if len(new_password) < 6:
            return jsonify({'message': 'New password must be at least 6 characters long'}), 400

        # Hash the new password
        hashed_new_password = bcrypt.generate_password_hash(new_password).decode('utf-8')

        # Add hashed password to update fields
        update_fields['password'] = hashed_new_password

    # Perform the update if there are valid fields to update
    if update_fields:
        users.update_one({'_id': ObjectId(user_id)}, {'$set': update_fields})
        return jsonify({'message': 'Profile updated successfully'}), 200
    else:
        return jsonify({'message': 'No valid fields to update'}), 400
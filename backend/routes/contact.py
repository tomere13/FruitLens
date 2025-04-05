from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime
from extensions import mongo

# Define a blueprint for the contact messages route
contact_bp = Blueprint('contact_bp', __name__)

@contact_bp.route('/contact', methods=['POST'])
def submit_contact():
    try:
        # Get message data from request
        name = request.json.get('name')
        email = request.json.get('email')
        message = request.json.get('message')
        
        # Validate required fields
        if not name or not email or not message:
            return jsonify({'message': 'All fields are required'}), 400
            
        # Create message document
        contact_message = {
            'name': name,
            'email': email,
            'message': message,
            'created_at': datetime.utcnow(),
            'read': False
        }
        
        # Insert message into MongoDB
        result = mongo.db.contact_messages.insert_one(contact_message)
        
        if result.inserted_id:
            return jsonify({'message': 'Message submitted successfully'}), 201
        else:
            return jsonify({'message': 'Failed to submit message'}), 500
            
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

@contact_bp.route('/contact/messages', methods=['GET'])
@jwt_required()
def get_messages():
    try:
        # Get all messages, sorted by creation date (newest first)
        messages = list(mongo.db.contact_messages.find().sort('created_at', -1))
        
        # Convert ObjectId to string for JSON serialization
        for message in messages:
            message['_id'] = str(message['_id'])
            message['created_at'] = message['created_at'].isoformat()
            
        return jsonify(messages), 200
        
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500 
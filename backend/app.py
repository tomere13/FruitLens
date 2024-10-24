import certifi
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from ultralytics import YOLO
import cv2
import numpy as np

app = Flask(__name__)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
model = YOLO('yolov8n.pt')
CORS(app)  # This will allow cross-origin requests

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app.config["MONGO_URI"] = os.getenv("MONGO_URI")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

mongo = PyMongo(app, tlsCAFile=certifi.where())

@app.route('/register', methods=['POST'])
def register():
    users = mongo.db.users
    username = request.json.get('username')
    password = request.json.get('password')

    if users.find_one({'username': username}):
        return jsonify({'message': 'User already exists'}), 409

    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    users.insert_one({'username': username, 'password': hashed_pw})

    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/login', methods=['POST'])
def login():
    users = mongo.db.users
    username = request.json.get('username')
    password = request.json.get('password')

    user = users.find_one({'username': username})

    if user and bcrypt.check_password_hash(user['password'], password):
        access_token = create_access_token(identity=str(user['_id']))
        return jsonify({'token': access_token}), 200

    return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({'message': f'Hello user {current_user}'}), 200


@app.route('/process-image', methods=['POST'])
def process_image():
    # Add logging to inspect the request
    print("Request content type:", request.content_type)

    if 'image' not in request.files:
        print("No image found in request.files")
        return jsonify({"error": "No image provided"}), 400

    file = request.files['image']
    print(f"Image file received: {file.filename} of type {file.content_type}")  # Log file details

    # Convert image to a NumPy array for YOLO processing
    npimg = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    # Run YOLOv8 object detection on the image
    results = model(img)

    # Get the names and coordinates of the detected objects
    detected_objects = []
    for result in results[0].boxes:
        box = result.xyxy[0].tolist()  # Get bounding box coordinates
        label = model.names[int(result.cls)]  # Label of the detected object
        confidence = result.conf.item()  # Confidence score
        detected_objects.append({
            "label": label,
            "box": box,
            "confidence": confidence
        })

    return jsonify(detected_objects)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)


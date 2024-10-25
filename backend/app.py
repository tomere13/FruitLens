import certifi
import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify  # Add request here
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import numpy as np

# Import blueprints from the routes folder
from routes.register import register_bp
from routes.login import login_bp

# Import shared instances from extensions
from extensions import bcrypt, mongo, jwt

app = Flask(__name__)
model = YOLO('yolov8n.pt')
CORS(app)  # This will allow cross-origin requests

# Load environment variables from .env file
load_dotenv()

app.config["MONGO_URI"] = os.getenv("MONGO_URI")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

# Initialize shared instances with the app
bcrypt.init_app(app)
mongo.init_app(app, tlsCAFile=certifi.where())
jwt.init_app(app)

# Register blueprints
app.register_blueprint(register_bp)
app.register_blueprint(login_bp)

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

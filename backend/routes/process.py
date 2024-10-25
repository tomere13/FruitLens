from ultralytics import YOLO
import cv2
import numpy as np
from flask import Blueprint, request, jsonify
process_bp = Blueprint('process_bp', __name__)

model = YOLO('yolov8n.pt')

@process_bp.route('/process-image', methods=['POST'])
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

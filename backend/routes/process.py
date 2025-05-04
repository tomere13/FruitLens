from ultralytics import YOLO
import cv2
import numpy as np
from flask import Blueprint, request, jsonify
process_bp = Blueprint('process_bp', __name__)

model = YOLO('yolo11s.pt')

@process_bp.route('/process-image', methods=['POST'])
def process_image():
    try:
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

        if img is None:
            print("Failed to decode image")
            return jsonify({"error": "Failed to decode image"}), 400

        # Run YOLOv8 object detection on the image
        results = model(img)

        # Find the object with highest confidence
        highest_confidence_object = None
        highest_confidence = 0

        for result in results:
            boxes = result.boxes
            for box in boxes:
                # Get confidence score
                confidence = float(box.conf[0])
                
                # Check if this object has higher confidence than the current highest
                if confidence > highest_confidence:
                    # Get bounding box coordinates and convert them to native Python floats
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    x1 = float(x1)
                    y1 = float(y1)
                    x2 = float(x2)
                    y2 = float(y2)

                    # Get label
                    label_index = int(box.cls[0])
                    label = model.names[label_index]
                    
                    # Capitalize the first letter of the label
                    label = label.capitalize()
                    
                    # Update highest confidence object
                    highest_confidence = confidence
                    highest_confidence_object = {
                        "label": label,
                        "box": [x1, y1, x2, y2],
                        "confidence": confidence
                    }

        # Return the highest confidence object or an empty array if nothing was detected
        if highest_confidence_object:
            return jsonify([highest_confidence_object])
        else:
            return jsonify([])

    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

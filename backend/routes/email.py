from flask import Blueprint, request, jsonify
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get email credentials from environment variables
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
RECIPIENT_EMAIL = os.getenv("RECIPIENT_EMAIL", "etomer9@gmail.com")  # Default to the email from your code

# Define the blueprint for email routes
email_bp = Blueprint('email_bp', __name__)

@email_bp.route('/send-email', methods=['POST'])
def send_email():
    try:
        # Get data from request
        data = request.json
        name = data.get('name')
        sender_email = data.get('email')
        message = data.get('message')
        
        # Validate input
        if not all([name, sender_email, message]):
            return jsonify({"error": "Missing required fields"}), 400
            
        # Create email message
        email_message = MIMEMultipart()
        email_message['From'] = EMAIL_USER
        email_message['To'] = RECIPIENT_EMAIL
        email_message['Subject'] = f"Contact Form Submission from {name}"
        
        # Create email body
        body = f"""
        You received a message from the contact form:
        
        Name: {name}
        Email: {sender_email}
        Message:
        {message}
        """
        
        # Attach body to email
        email_message.attach(MIMEText(body, 'plain'))
        
        # Connect to SMTP server and send email
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(EMAIL_USER, EMAIL_PASSWORD)
            server.send_message(email_message)
            
        return jsonify({"message": "Email sent successfully"}), 200
        
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return jsonify({"error": f"Failed to send email: {str(e)}"}), 500 
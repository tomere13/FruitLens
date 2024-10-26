import os
from flask import Blueprint, request, jsonify
from langchain_community.chat_models import ChatOpenAI
from langchain.schema import HumanMessage
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

openai_bp = Blueprint('openai_bp', __name__)

# Ensure the API key is loaded, either from env or hardcoded for testing purposes
openai_api_key = os.getenv("OPENAI_API_KEY")

if not openai_api_key:
    raise ValueError("OpenAI API Key not found. Set the OPENAI_API_KEY environment variable.")

# Initialize the ChatOpenAI model from LangChain
chat_model = ChatOpenAI(openai_api_key=openai_api_key, model_name="gpt-3.5-turbo")

@openai_bp.route('/generate', methods=['POST'])
def generate_text():
    data = request.get_json()
    prompt = data.get("prompt")

    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    try:
        # Generate response using ChatOpenAI
        response = chat_model([HumanMessage(content=prompt)])
        
        # Extract generated content
        generated_text = response.content.strip()
        
        return jsonify({"generated_text": generated_text}), 200
    except Exception as e:
        return jsonify({"error": "An unexpected error occurred: " + str(e)}), 500
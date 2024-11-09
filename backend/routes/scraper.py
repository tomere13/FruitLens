from flask import Blueprint, request, jsonify
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import os

# Define the blueprint
scraper_bp = Blueprint('scraper_bp', __name__)

# Path to ChromeDriver from .env
CHROMEDRIVER_PATH = os.getenv("CHROMEDRIVER_PATH")

# Configure Chrome options
chrome_options = Options()
chrome_options.add_argument("--headless")  # Run in headless mode
chrome_options.add_argument("--disable-gpu")

# Scrape a single URL (existing functionality)
@scraper_bp.route('/scrape', methods=['POST'])
def scrape():
    url = request.json.get('url')
    if not url:
        return jsonify({'error': 'URL is required'}), 400

    service = Service(CHROMEDRIVER_PATH)
    driver = webdriver.Chrome(service=service, options=chrome_options)

    try:
        driver.get(url)
        title = driver.title
        return jsonify({'title': title}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        driver.quit()

# Find closest stores for a batch of items
@scraper_bp.route('/find-stores', methods=['POST'])
def find_stores():
    items = request.json.get('items')
    if not items or not isinstance(items, list):
        return jsonify({'error': 'Items must be a list'}), 400

    service = Service(CHROMEDRIVER_PATH)
    driver = webdriver.Chrome(service=service, options=chrome_options)

    try:
        results = []
        for item in items:
            driver.get(f"https://www.google.com/search?q={item}+store+near+me")
            # Example logic: Find the first result title (adjust the XPath or logic based on Google’s structure)
            closest_store = driver.find_element("xpath", "//h3").text
            results.append({'item': item, 'closest_store': closest_store})

        return jsonify({'results': results}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        driver.quit()
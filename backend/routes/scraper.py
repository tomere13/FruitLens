from flask import Blueprint, request, jsonify
from flask_cors import CORS
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import os
from .chp_scraper import CHPScraper

# Define the blueprint
scraper_bp = Blueprint('scraper_bp', __name__)
CORS(scraper_bp)  # Enable CORS for all routes in this blueprint

# Path to ChromeDriver from .env
CHROMEDRIVER_PATH = os.getenv("CHROMEDRIVER_PATH")

# Configure Chrome options
chrome_options = Options()
chrome_options.add_argument("--headless")  # Run in headless mode
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")

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
            # Example logic: Find the first result title (adjust the XPath or logic based on Google's structure)
            closest_store = driver.find_element("xpath", "//h3").text
            results.append({'item': item, 'closest_store': closest_store})

        return jsonify({'results': results}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        driver.quit()

@scraper_bp.route('/api/scrape', methods=['POST'])
def scrape_prices():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'status': 'error',
                'message': 'No JSON data received'
            }), 400
            
        if 'location' not in data or 'items' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Missing required fields: location and items'
            }), 400
            
        location = data['location']
        items = data['items']
        
        if not isinstance(items, list):
            return jsonify({
                'status': 'error',
                'message': 'Items must be a list'
            }), 400
        
        # Initialize scraper once for all items
        scraper = CHPScraper()
        all_results = []
        
        try:
            # Process each item
            for item in items:
                # Remove trailing 's' if exists and capitalize
                processed_item = item.rstrip('s').capitalize()
                result = scraper.search_product(location, processed_item)
                all_results.append(result)
            
            # Calculate cart summary
            cart_summary = scraper._calculate_cart_summary(all_results)
                
            return jsonify({
                'status': 'success',
                'message': 'All items processed',
                'results': all_results,
                'cart_summary': cart_summary
            })
            
        finally:
            scraper.cleanup()  # Ensure we clean up the scraper
        
    except Exception as e:
        print(f"Error in scrape_prices: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
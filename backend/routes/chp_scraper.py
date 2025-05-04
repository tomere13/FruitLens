from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.keys import Keys
import platform
import time
import re

# Dictionary mapping English names to Hebrew
ITEMS_HEBREW = {
    "Apple": "תפוח",
    "Banana": "בננה",
    "Carrot": "גזר",
    "Tomato": "עגבנייה",
    "Potato": "תפוח אדמה",
    "Lettuce": "חסה",
    "Orange": "תפוז",
    "Grape": "ענב",
    "Spinach": "תרד",
    "Onion": "בצל",
    "Cucumber": "מלפפון",
    "Pepper": "פלפל",
    "Avocado": "אבוקדו",
    "Parsley": "פטרוזיליה",
    "Celery": "סלרי",
    "Cabbage": "כרוב",
    "Cauliflower": "כרובית",
    "Broccoli": "ברוקולי",
    "Mushroom": "פטריות",
    "Strawberry": "תות שדה",
    "Pineapple": "אננס",
    "Peach": "אפרסק",
    "Plum": "שזיף",
    "Pear": "אגס",
    "Mango": "מנגו",
    "Kiwi": "קיווי",
    "Cherry": "דובדבן",
    "Pomegranate": "רימון",
    "Lemon": "לימון",
    "Watermelon": "אבטיח",
    "Melon": "מלון",
    "Garlic": "שום",
    "Olive": "זית"
}

class CHPScraper:
    def __init__(self):
        # Set up Chrome options
        chrome_options = webdriver.ChromeOptions()
        # Remove headless mode for debugging
        # chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('--start-maximized')  # Start with max window size
        
        # Set path to Chrome binary based on OS
        if platform.system() == 'Darwin':  # macOS
            chrome_options.binary_location = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        elif platform.system() == 'Windows':
            chrome_options.binary_location = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        elif platform.system() == 'Linux':
            chrome_options.binary_location = '/usr/bin/google-chrome'
            
        try:
            print("Initializing Chrome browser...")
            self.driver = webdriver.Chrome(options=chrome_options)
            self.wait = WebDriverWait(self.driver, 10)
            print("Chrome browser initialized successfully")
            self._init_browser()
        except Exception as e:
            print(f"Error initializing Chrome: {str(e)}")
            raise

    def _init_browser(self):
        """Initialize the browser session"""
        try:
            print("Navigating to chp.co.il...")
            self.driver.get("https://chp.co.il")
            time.sleep(2)  # Wait for initial page load
            print("Navigation complete")
        except Exception as e:
            print(f"Error initializing browser: {str(e)}")
            self.cleanup()
            raise

    def cleanup(self):
        """Clean up browser resources"""
        try:
            if hasattr(self, 'driver'):
                self.driver.quit()
        except Exception as e:
            print(f"Error during cleanup: {str(e)}")

    def _extract_price_data(self):
        """Extract price data from the search results table."""
        try:
            # Wait for results table to load
            time.sleep(2)
            
            print("\n=== Starting Data Extraction ===")
            
            # Find the results table
            table = self.wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "results-table"))
            )
            print("Found results table")
            
            # Find all rows (skip header)
            rows = table.find_elements(By.TAG_NAME, "tr")[1:]  # Skip header row
            print(f"Found {len(rows)} result rows")
            
            results = []
            for idx, row in enumerate(rows, 1):
                try:
                    # Extract cells
                    cells = row.find_elements(By.TAG_NAME, "td")
                    if len(cells) >= 6:  # Ensure we have all needed cells
                        store_chain = cells[0].text
                        store_name = cells[1].text
                        address = cells[2].text
                        distance = cells[3].text
                        price_text = cells[5].text.strip()
                        
                        # Convert price to float for sorting
                        try:
                            price = float(price_text.replace('₪', '').strip())
                        except ValueError:
                            price = float('inf')  # Handle invalid prices
                            
                        # Convert distance to float (remove 'ק"מ' and convert)
                        try:
                            distance_num = float(distance.replace('ק"מ', '').strip())
                        except ValueError:
                            distance_num = float('inf')  # Handle invalid distances
                        
                        store_data = {
                            "store_chain": store_chain,
                            "store_name": store_name,
                            "address": address,
                            "distance": distance,
                            "distance_num": distance_num,
                            "price": price,
                            "price_display": f"₪{price:.2f}"
                        }
                        
                        print(f"\nStore #{idx}:")
                        print(f"  Chain: {store_chain}")
                        print(f"  Branch: {store_name}")
                        print(f"  Address: {address}")
                        print(f"  Distance: {distance}")
                        print(f"  Price: {store_data['price_display']}")
                        
                        results.append(store_data)
                except Exception as e:
                    print(f"Error processing row {idx}: {str(e)}")
                    continue
            
            # Sort results
            results_by_price = sorted(results, key=lambda x: x['price'])[:3]
            results_by_distance = sorted(results, key=lambda x: x['distance_num'])[:3]
            
            print("\n=== Best Prices ===")
            for idx, store in enumerate(results_by_price, 1):
                print(f"\n#{idx} Best Price:")
                print(f"  Store: {store['store_chain']} - {store['store_name']}")
                print(f"  Price: {store['price_display']}")
                print(f"  Distance: {store['distance']}")
            
            print("\n=== Nearest Stores ===")
            for idx, store in enumerate(results_by_distance, 1):
                print(f"\n#{idx} Nearest:")
                print(f"  Store: {store['store_chain']} - {store['store_name']}")
                print(f"  Distance: {store['distance']}")
                print(f"  Price: {store['price_display']}")
            
            return {
                "by_price": results_by_price,
                "by_distance": results_by_distance
            }
            
        except Exception as e:
            print(f"Error extracting price data: {str(e)}")
            print("Current page source:")
            try:
                print(self.driver.page_source)
            except:
                print("Could not get page source")
            return {
                "by_price": [],
                "by_distance": []
            }

    def search_product(self, location: str, product_name: str) -> dict:
        """
        Search for a product on chp.co.il
        
        Args:
            location (str): The location/address to search in
            product_name (str): The product name in English
            
        Returns:
            dict: Search results including prices and stores
        """
        try:
            print("\n========================================")
            print(f"Starting search for {product_name} in {location}")
            print("========================================")
            
            # Get Hebrew translation of the product
            hebrew_product_name = ITEMS_HEBREW.get(product_name)
            if not hebrew_product_name:
                print(f"ERROR: No Hebrew translation found for {product_name}")
                return {
                    "status": "error",
                    "message": f"No Hebrew translation found for {product_name}",
                    "product": product_name
                }
                
            print(f"Hebrew translation: {hebrew_product_name}")
            
            # Handle location input
            try:
                print("\n--- Location Input ---")
                # Wait for the address input field and enter location
                address_input = self.wait.until(
                    EC.presence_of_element_located((By.ID, "shopping_address"))
                )
                address_input.clear()
                print(f"Entering location: {location}")
                address_input.send_keys(location)
                print("Waiting for autocomplete...")
                time.sleep(2)
                print("Submitting location search...")
                address_input.send_keys(Keys.RETURN)
                time.sleep(2)
            except Exception as e:
                print(f"ERROR with location input: {str(e)}")
                return {
                    "status": "error",
                    "message": f"Error with location input: {str(e)}",
                    "product": product_name
                }
            
            # Handle product search
            try:
                print("\n--- Product Search ---")
                # Wait for the product input field and enter the Hebrew product name
                product_input = self.wait.until(
                    EC.presence_of_element_located((By.ID, "product_name_or_barcode"))
                )
                product_input.clear()
                print(f"Entering product name: {hebrew_product_name}")
                product_input.send_keys(hebrew_product_name)
                print("Waiting for suggestions...")
                time.sleep(2)
                print("Submitting product search...")
                product_input.send_keys(Keys.RETURN)
                time.sleep(3)
            except Exception as e:
                print(f"ERROR with product input: {str(e)}")
                return {
                    "status": "error",
                    "message": f"Error with product search: {str(e)}",
                    "product": product_name
                }
            
            # Extract price data
            print("\n--- Data Extraction ---")
            results = self._extract_price_data()
            
            response_data = {
                "status": "success",
                "message": "Search completed",
                "location": location,
                "product": product_name,
                "hebrew_product": hebrew_product_name,
                "results": results
            }
            
            print("\n=== Final Response Data ===")
            print(f"Status: {response_data['status']}")
            print(f"Message: {response_data['message']}")
            print(f"Location: {response_data['location']}")
            print(f"Product: {response_data['product']} ({response_data['hebrew_product']})")
            print(f"Number of results by price: {len(results['by_price'])}")
            print(f"Number of results by distance: {len(results['by_distance'])}")
            print("========================================\n")
            
            return response_data
            
        except Exception as e:
            error_data = {
                "status": "error",
                "message": str(e),
                "product": product_name,
                "error_type": "general"
            }
            print("\n=== Error Response Data ===")
            print(f"Status: {error_data['status']}")
            print(f"Message: {error_data['message']}")
            print(f"Product: {error_data['product']}")
            print(f"Error Type: {error_data['error_type']}")
            print("========================================\n")
            return error_data

# Example usage:
# scraper = CHPScraper()
# results = scraper.search_product("תל אביב", "Apple") 
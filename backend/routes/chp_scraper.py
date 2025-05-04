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
import traceback
import os
import sys
import logging
import base64
import datetime

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("scraper.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("CHPScraper")

# Dictionary mapping English names to Hebrew
ITEMS_HEBREW = {
    "Apple": "תפוח עץ",
    "Banana": "בננה",
    "Carrot": "גזר",
    "Tomato": "עגבנייה",
    "Potato": "תפוח אדמה",
    "Lettuce": "חסה",
    "Orange": "תפוז",
    "Grape": "ענב",
    "Spinach": "תרד",
    "Onion": "בצל",
    "Cucumber": "מלפפונים",
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
        logger.info("Initializing CHPScraper")
        
        # Set up Chrome options
        chrome_options = webdriver.ChromeOptions()
        
        # Enable headless mode to hide the browser
        chrome_options.add_argument('--headless')
        
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        
        # IMPORTANT: Use desktop mode instead of mobile mode to see the distance column
        # The distance column has class "dont_display_when_narrow" which hides it on mobile
        # Removing mobile emulation to show all columns including distance
        
        # Set a desktop user agent instead
        chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
        
        # Enable browser logging
        chrome_options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
        
        # Set path to Chrome binary based on OS
        if platform.system() == 'Darwin':  # macOS
            chrome_options.binary_location = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        elif platform.system() == 'Windows':
            chrome_options.binary_location = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        elif platform.system() == 'Linux':
            chrome_options.binary_location = '/usr/bin/google-chrome'
            
        try:
            logger.info("Creating Chrome driver")
            
            # Handle different environments
            if os.environ.get('SERVER_ENV') == 'production':
                # Server environment - use headless more reliably
                from selenium.webdriver.chrome.options import Options
                options = Options()
                
                # Enable headless mode for production
                options.add_argument('--headless')
                
                options.add_argument('--disable-gpu')
                options.add_argument('--no-sandbox')
                options.add_argument('--disable-dev-shm-usage')
                options.add_argument("--remote-debugging-port=9222")
                options.add_argument("--window-size=1920,1080")
                options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                
                self.driver = webdriver.Chrome(options=options)
            else:
                # Development environment
                self.driver = webdriver.Chrome(options=chrome_options)
                
            self.wait = WebDriverWait(self.driver, 15)  # Increased timeout
            self._init_browser()
            logger.info("Driver initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing Chrome: {str(e)}")
            logger.error(traceback.format_exc())
            raise

    def _init_browser(self):
        """Initialize the browser session"""
        try:
            logger.info("Navigating to website")
            self.driver.get("https://chp.co.il")
            
            # Browser is now headless, so no need to visually maximize
            # but we'll keep the window size large for consistent rendering
            self.driver.set_window_size(1920, 1080)
            
            # Wait for page load
            time.sleep(1)  # Extended wait time
            logger.info("Website loaded")
            
            # Debug information about the page
            logger.info(f"Page title: {self.driver.title}")
            logger.info(f"Current URL: {self.driver.current_url}")
            
            # Check for any JavaScript errors on page load
            self._get_browser_logs()
            
        except Exception as e:
            logger.error(f"Error initializing browser: {str(e)}")
            logger.error(traceback.format_exc())
            self.cleanup()
            raise

    def cleanup(self):
        """Clean up browser resources"""
        try:
            if hasattr(self, 'driver'):
                logger.info("Cleaning up driver")
                self.driver.quit()
        except Exception as e:
            logger.error(f"Error during cleanup: {str(e)}")

    def _get_browser_logs(self):
        """Get browser console logs for debugging"""
        try:
            logs = self.driver.get_log('browser')
            if logs:
                logger.info("==== Browser Console Logs ====")
                for log in logs:
                    logger.info(f"[{log['level']}] {log['message']}")
                logger.info("==============================")
            else:
                logger.info("No browser console logs available")
            return logs
        except Exception as e:
            logger.error(f"Error getting browser logs: {str(e)}")
            return []

    def _extract_price_data(self):
        """Extract price data from the search results table."""
        try:
            # Wait for results table to load - reduced from 2 to 1 second
            time.sleep(0.5)
            
            logger.info("\n=== Starting Data Extraction ===")
            
            # Check browser logs
            self._get_browser_logs()
            
            # Find the results table
            table = self.wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "results-table"))
            )
            logger.info("Found results table")
            
            # Find the table headers to confirm column order
            headers = table.find_elements(By.TAG_NAME, "th")
            header_texts = [h.text.strip() for h in headers]
            logger.info(f"Table headers: {header_texts}")
            
            # Identify the distance column index
            distance_index = None
            for i, header in enumerate(headers):
                if 'מרחק' in header.text:
                    distance_index = i
                    logger.info(f"Found distance column at index {distance_index}")
                    break
            
            if distance_index is None:
                logger.warning("Distance column not found in headers. Using default index 3.")
                distance_index = 3
            
            # Print the table HTML for debugging
            table_html = table.get_attribute('outerHTML')
            logger.info(f"Table HTML: {table_html[:500]}...")  # Log first 500 chars to avoid huge logs
            
            # Dump full HTML to file for debugging
            with open("table_dump.html", "w", encoding="utf-8") as f:
                f.write(table_html)
            
            # Find all rows (skip header)
            rows = table.find_elements(By.TAG_NAME, "tr")[1:]  # Skip header row
            logger.info(f"Found {len(rows)} result rows")
            
            results = []
            for idx, row in enumerate(rows, 1):
                try:
                    # Extract cells
                    cells = row.find_elements(By.TAG_NAME, "td")
                    if len(cells) >= 6:  # Ensure we have all needed cells
                        store_chain = cells[0].text.strip()
                        store_name = cells[1].text.strip()
                        address = cells[2].text.strip()
                        
                        # Get distance from the identified distance column
                        distance_cell = cells[distance_index]
                        distance_text = distance_cell.text.strip()
                        
                        # Check if the distance column is actually visible
                        is_visible = distance_cell.is_displayed()
                        logger.info(f"Distance cell visible: {is_visible}")
                        
                        # Get all CSS classes from the distance cell for debugging
                        distance_classes = distance_cell.get_attribute("class")
                        logger.info(f"Distance cell classes: {distance_classes}")
                        
                        price_text = cells[5].text.strip()
                        
                        # Ensure we have an address
                        if not address:
                            address = "כתובת לא זמינה"
                        
                        # Extract the distance value
                        if distance_text:
                            # Keep the original distance text for display
                            distance = distance_text
                            
                            # Extract numeric value for sorting
                            try:
                                # Match the numeric part of the distance (e.g., "0.5" from "0.5 ק"מ")
                                distance_match = re.search(r'(\d+(?:\.\d+)?)', distance_text)
                                if distance_match:
                                    distance_num = float(distance_match.group(1))
                                else:
                                    distance_num = float('inf')
                            except ValueError:
                                distance_num = float('inf')
                        else:
                            distance = "מרחק לא זמין"
                            distance_num = float('inf')
                        
                        # Convert price to float for sorting
                        try:
                            price = float(price_text.replace('₪', '').strip())
                        except ValueError:
                            price = float('inf')  # Handle invalid prices
                        
                        # Log all the details for this store
                        logger.info(f"\nStore #{idx} Details:")
                        logger.info(f"  Store Chain: '{store_chain}'")
                        logger.info(f"  Store Name: '{store_name}'")
                        logger.info(f"  Address: '{address}'")
                        logger.info(f"  Distance Text: '{distance_text}'")
                        logger.info(f"  Distance Value: {distance_num}")
                        logger.info(f"  Price Text: '{price_text}'")
                        logger.info(f"  Price Value: {price}")
                        
                        store_data = {
                            "store_chain": store_chain,
                            "store_name": store_name,
                            "address": address,
                            "distance": distance,
                            "distance_num": distance_num,
                            "price": price,
                            "price_display": f"₪{price:.2f}"
                        }
                        
                        results.append(store_data)
                except Exception as e:
                    logger.error(f"Error processing row {idx}: {str(e)}")
                    logger.error(traceback.format_exc())
                    continue
            
            # Sort results
            results_by_price = sorted(results, key=lambda x: x['price'])[:5]  # Increased from 3 to 5 results
            results_by_distance = sorted(results, key=lambda x: x['distance_num'])[:5]  # Increased from 3 to 5 results
            
            # Log results
            logger.info("\n=== Best Prices ===")
            for idx, store in enumerate(results_by_price, 1):
                logger.info(f"\n#{idx} Best Price:")
                logger.info(f"  Store: {store['store_chain']} - {store['store_name']}")
                logger.info(f"  Price: {store['price_display']}")
                logger.info(f"  Distance: {store['distance']}")
            
            logger.info("\n=== Nearest Stores ===")
            for idx, store in enumerate(results_by_distance, 1):
                logger.info(f"\n#{idx} Nearest:")
                logger.info(f"  Store: {store['store_chain']} - {store['store_name']}")
                logger.info(f"  Distance: {store['distance']}")
                logger.info(f"  Price: {store['price_display']}")
            
            return {
                "by_price": results_by_price,
                "by_distance": results_by_distance
            }
            
        except Exception as e:
            logger.error(f"Error extracting price data: {str(e)}")
            logger.error("Current page source:")
            try:
                logger.error(self.driver.page_source)
            except:
                logger.error("Could not get page source")
            return {
                "by_price": [],
                "by_distance": []
            }

    def _calculate_cart_summary(self, all_results):
        """
        Calculate a summary of the cart showing which store offers the best overall prices.
        
        Args:
            all_results: A list of ItemSearchResult objects containing product search results
            
        Returns:
            dict: A summary of the best stores for the entire cart
        """
        try:
            logger.info("\n=== Calculating Cart Summary ===")
            
            # Skip any failed searches
            valid_results = [r for r in all_results if r.get('status') == 'success']
            
            if not valid_results:
                logger.warning("No valid results to calculate cart summary")
                return {
                    "summary_available": False,
                    "message": "No valid search results available"
                }
            
            # Extract all unique stores found across all product searches
            all_stores = {}
            
            # For each product result
            for product_result in valid_results:
                product_name = product_result.get('product', 'Unknown Product')
                results = product_result.get('results', {})
                
                # Skip if no valid results for this product
                if not results or not results.get('by_price'):
                    continue
                
                # Get all stores from this product search
                for store_data in results.get('by_price', []):
                    store_key = f"{store_data['store_chain']} - {store_data['store_name']}"
                    
                    # Initialize store if not seen before
                    if store_key not in all_stores:
                        all_stores[store_key] = {
                            'store_chain': store_data['store_chain'],
                            'store_name': store_data['store_name'],
                            'address': store_data['address'],
                            'distance': store_data.get('distance', 'Unknown'),
                            'distance_num': store_data.get('distance_num', float('inf')),
                            'products': {},
                            'total_price': 0,
                            'products_found': 0,
                            'products_missing': 0
                        }
                    
                    # Add this product to the store's product list
                    all_stores[store_key]['products'][product_name] = {
                        'price': store_data['price'],
                        'price_display': store_data['price_display']
                    }
                    all_stores[store_key]['total_price'] += store_data['price']
                    all_stores[store_key]['products_found'] += 1
            
            # Add count of missing products
            total_products = len(valid_results)
            for store_key in all_stores:
                all_stores[store_key]['products_missing'] = total_products - all_stores[store_key]['products_found']
                
                # Calculate coverage percentage
                all_stores[store_key]['coverage'] = (all_stores[store_key]['products_found'] / total_products) * 100
            
            # Convert to list for sorting
            store_list = list(all_stores.values())
            
            # No stores found with products
            if not store_list:
                return {
                    "summary_available": False,
                    "message": "No stores found with products"
                }
            
            # Sort by best overall price AND coverage (prioritize stores with more products)
            best_price_stores = sorted(
                store_list,
                key=lambda x: (x['products_missing'], x['total_price'])
            )
            
            # Sort by best distance AND coverage
            best_distance_stores = sorted(
                store_list, 
                key=lambda x: (x['products_missing'], x['distance_num'])
            )
            
            # Calculate potential savings compared to most expensive option
            if len(best_price_stores) > 1:
                most_expensive = max(best_price_stores, key=lambda x: x['total_price'])
                least_expensive = min(best_price_stores, key=lambda x: x['total_price'])
                potential_savings = most_expensive['total_price'] - least_expensive['total_price']
            else:
                potential_savings = 0
            
            # Create the summary
            summary = {
                "summary_available": True,
                "total_products": total_products,
                "best_price_store": best_price_stores[0] if best_price_stores else None,
                "best_distance_store": best_distance_stores[0] if best_distance_stores else None,
                "potential_savings": potential_savings,
                "potential_savings_display": f"₪{potential_savings:.2f}"
            }
            
            # Log the summary
            logger.info("\n=== Cart Summary ===")
            logger.info(f"Total products: {total_products}")
            if best_price_stores:
                logger.info(f"Best price store: {best_price_stores[0]['store_chain']} - {best_price_stores[0]['store_name']}")
                logger.info(f"Products found: {best_price_stores[0]['products_found']}/{total_products}")
                logger.info(f"Total price: ₪{best_price_stores[0]['total_price']:.2f}")
            if best_distance_stores:
                logger.info(f"Best distance store: {best_distance_stores[0]['store_chain']} - {best_distance_stores[0]['store_name']}")
                logger.info(f"Distance: {best_distance_stores[0]['distance']}")
            logger.info(f"Potential savings: ₪{potential_savings:.2f}")
            
            return summary
            
        except Exception as e:
            logger.error(f"Error calculating cart summary: {str(e)}")
            logger.error(traceback.format_exc())
            return {
                "summary_available": False,
                "message": f"Error calculating summary: {str(e)}"
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
            logger.info("\n========================================")
            logger.info(f"Starting search for {product_name} in {location}")
            logger.info("========================================")
            
            # Take initial screenshot
            # self._take_screenshot("initial_page")
            
            # Get Hebrew translation of the product
            hebrew_product_name = ITEMS_HEBREW.get(product_name)
            if not hebrew_product_name:
                logger.error(f"ERROR: No Hebrew translation found for {product_name}")
                # self._take_screenshot("translation_error")
                return {
                    "status": "error",
                    "message": f"No Hebrew translation found for {product_name}",
                    "product": product_name
                }
                
            logger.info(f"Hebrew translation: {hebrew_product_name}")
            
            # Handle location input
            try:
                logger.info("\n--- Location Input ---")
                # Wait for the address input field and enter location
                address_input = self.wait.until(
                    EC.presence_of_element_located((By.ID, "shopping_address"))
                )
                # self._take_screenshot("before_location_input")
                
                address_input.clear()
                logger.info(f"Entering location: {location}")
                address_input.send_keys(location)
                
                logger.info("Waiting for autocomplete...")
                time.sleep(0.5)  # Reduced wait time from 2 to 1 second
                # self._take_screenshot("after_location_input")
                
                logger.info("Submitting location search...")
                address_input.send_keys(Keys.RETURN)
                time.sleep(0.5)  # Reduced wait time from 2 to 1 second
                # self._take_screenshot("after_location_submit")
            except Exception as e:
                logger.error(f"ERROR with location input: {str(e)}")
                # self._take_screenshot("location_input_error")
                return {
                    "status": "error",
                    "message": f"Error with location input: {str(e)}",
                    "product": product_name
                }
            
            # Handle product search
            try:
                logger.info("\n--- Product Search ---")
                # Wait for the product input field and enter the Hebrew product name
                product_input = self.wait.until(
                    EC.presence_of_element_located((By.ID, "product_name_or_barcode"))
                )
                # self._take_screenshot("before_product_input")
                
                product_input.clear()
                logger.info(f"Entering product name: {hebrew_product_name}")
                product_input.send_keys(hebrew_product_name)
                
                logger.info("Waiting for suggestions...")
                time.sleep(0.5)  # Reduced wait time from 2 to 1 second
                # self._take_screenshot("after_product_input")
                
                logger.info("Submitting product search...")
                product_input.send_keys(Keys.RETURN)
                time.sleep(0.5)  # Reduced wait time from 3 to 2 seconds
                # self._take_screenshot("after_product_submit")
            except Exception as e:
                logger.error(f"ERROR with product input: {str(e)}")
                # self._take_screenshot("product_input_error")
                return {
                    "status": "error",
                    "message": f"Error with product search: {str(e)}",
                    "product": product_name
                }
            
            # Extract price data
            logger.info("\n--- Data Extraction ---")
            # self._take_screenshot("before_extraction")
            results = self._extract_price_data()
            # self._take_screenshot("after_extraction")
            
            response_data = {
                "status": "success",
                "message": "Search completed",
                "location": location,
                "product": product_name,
                "hebrew_product": hebrew_product_name,
                "results": results
            }
            
            # For a batch search, we would compute the cart summary here
            # but for single product search, we'll skip it since we need data from multiple products
            
            logger.info("\n=== Final Response Data ===")
            logger.info(f"Status: {response_data['status']}")
            logger.info(f"Message: {response_data['message']}")
            logger.info(f"Location: {response_data['location']}")
            logger.info(f"Product: {response_data['product']} ({response_data['hebrew_product']})")
            logger.info(f"Number of results by price: {len(results['by_price'])}")
            logger.info(f"Number of results by distance: {len(results['by_distance'])}")
            logger.info("========================================\n")
            
            return response_data
            
        except Exception as e:
            error_data = {
                "status": "error",
                "message": str(e),
                "product": product_name,
                "error_type": "general"
            }
            logger.error("\n=== Error Response Data ===")
            logger.error(f"Status: {error_data['status']}")
            logger.error(f"Message: {error_data['message']}")
            logger.error(f"Product: {error_data['product']}")
            logger.error(f"Error Type: {error_data['error_type']}")
            logger.error("========================================\n")
            # self._take_screenshot("general_error")
            return error_data

# Example usage:
# scraper = CHPScraper()
# results = scraper.search_product("תל אביב", "Apple") 
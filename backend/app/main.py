from fastapi import FastAPI, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import google.generativeai as genai
import pandas as pd
import json
import math
import requests

# 1⃣ Load environment variables from .env
load_dotenv()
print("🔑 Loaded Gemini API Key:", os.getenv("GEMINI_API_KEY"))

# 2⃣ Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# 3⃣ Create FastAPI app
app = FastAPI()

# 4⃣ Allow frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this later for production!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the CSV data
def load_market_data():
    try:
        # Add error handling and logging for file existence
        csv_path = 'Chicago_Farmers_Markets__With_Products_.csv'
        if not os.path.exists(csv_path):
            print(f"Error: CSV file not found at {csv_path}")
            return []
            
        df = pd.read_csv(csv_path)
        markets = []
        for _, row in df.iterrows():
            try:
                # Add data validation
                if pd.isna(row['latitude']) or pd.isna(row['longitude']):
                    print(f"Skipping market {row['location']} due to missing coordinates")
                    continue
                    
                # Create a more accurate Google Maps link using the intersection address
                intersection = row['intersection']
                # Add "Chicago, IL" to the address for better geocoding
                full_address = f"{intersection}, Chicago, IL"
                # URL encode the address for the Google Maps link
                encoded_address = requests.utils.quote(full_address)
                
                market = {
                    "id": str(row['id']),
                    "name": row['location'],
                    "address": intersection,
                    "products": row['products'],
                    "schedule": f"{row['day']}: {row['start_time']}–{row['end_time']}",
                    "googleLink": f"https://maps.google.com/?q={encoded_address}",
                    "latitude": float(row['latitude']),
                    "longitude": float(row['longitude'])
                }
                markets.append(market)
            except Exception as row_error:
                print(f"Error processing market row: {row_error}")
                continue
                
        print(f"Successfully loaded {len(markets)} markets")
        return markets
    except Exception as e:
        print(f"Error loading market data: {e}")
        return []

# Calculate distance between two coordinates using Haversine formula
def calculate_distance(lat1, lon1, lat2, lon2):
    try:
        R = 6371  # Radius of the earth in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat/2) * math.sin(dlat/2) + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2) * math.sin(dlon/2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        distance = R * c  # Distance in km
        return distance
    except Exception as e:
        print(f"Error calculating distance: {e}")
        return float('inf')  # Return infinity for invalid calculations

# Geocode a location to get coordinates
def geocode_location(location):
    try:
        # Add rate limiting delay to avoid API throttling
        import time
        time.sleep(1)
        
        # Use OpenStreetMap Nominatim API for geocoding (free and no API key required)
        url = f"https://nominatim.openstreetmap.org/search?format=json&q={requests.utils.quote(location)}&countrycodes=us"
        headers = {
            "User-Agent": "VerduraAI/1.0"  # Required by Nominatim
        }
        response = requests.get(url, headers=headers, timeout=10)  # Add timeout
        response.raise_for_status()  # Raise exception for bad status codes
        data = response.json()
        
        if data and len(data) > 0:
            return {
                "latitude": float(data[0]["lat"]),
                "longitude": float(data[0]["lon"]),
                "display_name": data[0]["display_name"]
            }
        print(f"No results found for location: {location}")
        return None
    except Exception as e:
        print(f"Error geocoding location: {e}")
        return None

# Geocode a ZIP code to get coordinates
def geocode_zipcode(zipcode):
    try:
        # Add rate limiting delay to avoid API throttling
        import time
        time.sleep(1)
        
        # Use OpenStreetMap Nominatim API for geocoding ZIP codes
        url = f"https://nominatim.openstreetmap.org/search?format=json&postalcode={zipcode}&country=US"
        headers = {
            "User-Agent": "VerduraAI/1.0"  # Required by Nominatim
        }
        response = requests.get(url, headers=headers, timeout=10)  # Add timeout
        response.raise_for_status()  # Raise exception for bad status codes
        data = response.json()
        
        if data and len(data) > 0:
            return {
                "latitude": float(data[0]["lat"]),
                "longitude": float(data[0]["lon"]),
                "display_name": data[0]["display_name"]
            }
        print(f"No results found for ZIP code: {zipcode}")
        return None
    except Exception as e:
        print(f"Error geocoding ZIP code: {e}")
        return None

# ✅ Feature 1: Return real market data
@app.get("/produce-nearby")
def get_produce(location: str = Query(...)):
    # Input validation
    if not location or len(location.strip()) == 0:
        return {"error": "Location cannot be empty"}
        
    # Load market data first to fail fast if data is unavailable
    markets = load_market_data()
    if not markets:
        return {"error": "No market data available"}
    
    print(f"Processing location search: {location}")
    print(f"Loaded {len(markets)} markets from CSV")
    
    # If location is a ZIP code (5 digits), geocode the ZIP code
    if location.isdigit() and len(location) == 5:
        geocoded = geocode_zipcode(location)
        
        if geocoded:
            print(f"Successfully geocoded ZIP code to: {geocoded['display_name']}")
            # Find markets within 50km of the ZIP code location (increased from 10km)
            nearby_markets = []
            for market in markets:
                distance = calculate_distance(
                    geocoded["latitude"], 
                    geocoded["longitude"], 
                    market["latitude"], 
                    market["longitude"]
                )
                
                print(f"Market: {market['name']}, Distance: {distance}km")
                
                if distance == float('inf'):
                    continue
                
                # Add distance to market data
                market_with_distance = market.copy()
                market_with_distance["distance"] = round(distance, 2)
                
                # Only include markets within 50km (increased from 10km)
                if distance <= 50:
                    nearby_markets.append(market_with_distance)
            
            # Sort markets by distance
            nearby_markets.sort(key=lambda x: x["distance"])
            
            print(f"Found {len(nearby_markets)} markets within 50km")
            
            return {
                "markets": nearby_markets,
                "location": {
                    "name": geocoded["display_name"],
                    "latitude": geocoded["latitude"],
                    "longitude": geocoded["longitude"]
                }
            }
        else:
            print(f"Failed to geocode ZIP code: {location}")
            return {"error": "Could not find location"}
    else:
        # For area-based search, geocode the location
        geocoded = geocode_location(location)
        
        if geocoded:
            print(f"Successfully geocoded location to: {geocoded['display_name']}")
            # Find markets within 50km of the location (increased from 10km)
            nearby_markets = []
            for market in markets:
                distance = calculate_distance(
                    geocoded["latitude"], 
                    geocoded["longitude"], 
                    market["latitude"], 
                    market["longitude"]
                )
                
                print(f"Market: {market['name']}, Distance: {distance}km")
                
                if distance == float('inf'):
                    continue
                
                # Add distance to market data
                market_with_distance = market.copy()
                market_with_distance["distance"] = round(distance, 2)
                
                # Only include markets within 50km (increased from 10km)
                if distance <= 50:
                    nearby_markets.append(market_with_distance)
            
            # Sort markets by distance
            nearby_markets.sort(key=lambda x: x["distance"])
            
            print(f"Found {len(nearby_markets)} markets within 50km")
            
            return {
                "markets": nearby_markets,
                "location": {
                    "name": geocoded["display_name"],
                    "latitude": geocoded["latitude"],
                    "longitude": geocoded["longitude"]
                }
            }
        else:
            print(f"Failed to geocode location: {location}")
            return {"error": "Could not find location"}

# ✅ Feature 2: Gemini-powered Wellness Assistant
class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
def chat_with_gemini(request: ChatRequest):
    try:
        model = genai.GenerativeModel("models/gemini-1.5-pro")
        response = model.generate_content(
            f"You are a helpful wellness and nutrition assistant. Use food-as-medicine knowledge to answer this question:\n\nUser: {request.message}"
        )
        return {"reply": response.text}
    except Exception as e:
        print("❌ Gemini Error:", e)
        return {"reply": "Something went wrong with Gemini AI."}

# ✅ Feature 3: Smart Seasonal Bundles
class BundleRequest(BaseModel):
    goal: str
    produce: list[str]

@app.post("/bundle")
def generate_bundle(request: BundleRequest):
    try:
        model = genai.GenerativeModel("models/gemini-1.5-pro")

        prompt = f"""
        You are a smart seasonal meal planner.

        Based on the user's wellness goal: "{request.goal}"
        And the list of fresh seasonal produce: {', '.join(request.produce)}

        Suggest 2-3 smart food bundles that align with this wellness goal.
        For each bundle, give:
        - A creative name
        - A short explanation of why it's good for the goal
        - A list of ingredients from the produce list
        - An optional recipe idea or use

        Format the response as markdown.
        """

        response = model.generate_content(prompt)

        return {"bundles": response.text}

    except Exception as e:
        print("❌ Gemini Bundle Error:", e)
        return {"error": "Failed to generate seasonal bundle."}

# ✅ Feature 4: Weekly Meal Planner
class PlannerRequest(BaseModel):
    goal: str
    produce: list[str]

@app.post("/planner")
def generate_weekly_plan(request: PlannerRequest):
    try:
        model = genai.GenerativeModel("models/gemini-1.5-pro")
        prompt = (
            f"Generate a 7-day meal plan using the following seasonal produce: {', '.join(request.produce)}. "
            f"The goal is: {request.goal}. Each day should include a brief meal idea and a sentence about how it helps the goal. "
            f"Output in Markdown with days labeled clearly."
        )
        response = model.generate_content(prompt)
        return {"plan": response.text}
    except Exception as e:
        print("❌ Planner Error:", e)
        return {"plan": "Something went wrong generating the weekly plan."}

# ✅ Feature 6 & 7: Nutrition Estimator (Text + Image)
class NutritionEstimateRequest(BaseModel):
    ingredients: list[str]

@app.post("/nutrition-estimate")
def estimate_nutrition(request: NutritionEstimateRequest):
    try:
        model = genai.GenerativeModel("models/gemini-1.5-pro")
        prompt = (
            f"Estimate total calories, protein, carbs, and fat for the following ingredients: {', '.join(request.ingredients)}."
            f"Respond in JSON format with keys: calories, protein, carbs, fat."
        )
        response = model.generate_content(prompt)
        return {"estimate": response.text}
    except Exception as e:
        print("❌ Nutrition Estimate Error:", e)
        return {"estimate": "Something went wrong estimating macros."}

from PIL import Image
import io

@app.post("/nutrition-image")
def analyze_nutrition_image(file: UploadFile = File(...)):
    try:
        image_bytes = file.file.read()
        image = Image.open(io.BytesIO(image_bytes))

        model = genai.GenerativeModel("gemini-1.5-flash")  # ✅ the new vision-compatible model
        response = model.generate_content([
            "Estimate total calories, protein, carbs, and fat from this meal image. Return in JSON format.",
            image
        ])
        return {"visionEstimate": response.text}
    except Exception as e:
        print("❌ Gemini Vision Error:", e)
        return {"visionEstimate": f"Something went wrong: {str(e)}"}                                     


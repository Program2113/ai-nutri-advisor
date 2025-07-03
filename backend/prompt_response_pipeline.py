import sys
import os
import base64
import json
import time
from dotenv import load_dotenv
from openai import OpenAI
import openai

if sys.version_info < (3, 7):
    raise RuntimeError("This project requires Python 3.7 or higher.")


# It's best practice to use environment variables for your API key.
# The OpenAI library automatically looks for this environment variable.
# If you don't set it, you can pass the key directly:
# client = OpenAI(api_key="YOUR_API_KEY")

load_dotenv()
api_key = os.getenv("OPENAI_APIKEY")
client = OpenAI(api_key=api_key)

# --- UTILITY FUNCTIONS ---

def encode_image_to_base64(image_path):
    """Encodes an image file to a base64 string."""
    try:
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    except FileNotFoundError:
        print(f"Error: The file '{image_path}' was not found.")
        return None
    except Exception as e:
        print(f"An error occurred while encoding the image: {e}")
        return None

def make_openai_request(prompt, model="gpt-4o", image_base64=None):
    """A generic function to make requests to OpenAI's chat completion."""
    try:
        messages = [
            {
                "role": "user",
                "content": []
            }
        ]
        # Add text prompt
        messages[0]["content"].append({"type": "text", "text": prompt})
        
        # Add image if provided
        if image_base64:
            messages[0]["content"].append({
                "type": "image_url",
                "image_url": {"url": f"data:image/jpeg;base64,{image_base64}"}
            })

        response = client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=2000,
            # Ensure JSON output where applicable
            response_format={"type": "json_object"} if "json" in prompt.lower() else None
        )
        response_text = response.choices[0].message.content
        return response_text
    except openai.OpenAIError as e:
        print(f"An API error occurred: {e}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None

# --- PIPELINE STEP 1: EXTRACT INGREDIENTS ---

def extract_ingredients_from_image(image_path):
    prompt = """
    You are an expert data extraction assistant. Analyze the provided image of a food product's ingredients section.
    Extract every single ingredient listed.
    Provide the output as a single, flat JSON array of strings. If the list is unreadable, return an empty JSON array: [].
    Your output must be a valid JSON object.
    """
    base64_image = encode_image_to_base64(image_path)
    if not base64_image:
        return []
    
    print("Step 1: Extracting ingredients from image...")
    response_str = make_openai_request(prompt, image_base64=base64_image)
    if not response_str:
        return []
    
    try:
        # The model might return a JSON object with a key, e.g., {"ingredients": [...]}. Let's find the list.
        data = json.loads(response_str)
        if isinstance(data, list):
            return data
        if isinstance(data, dict):
            for _, value in data.items():
                if isinstance(value, list):
                    return value
        return []
    except json.JSONDecodeError:
        print("Error: Failed to decode ingredients JSON.")
        return []

# --- PIPELINE STEP 2: ANALYZE EACH INGREDIENT ---

def analyze_single_ingredient(ingredient_name):
    prompt = f"""
    You are a food scientist and nutritionist providing a concise, data-driven analysis of a single food ingredient.
    Ingredient: "{ingredient_name}"
    Based on your knowledge, provide an analysis in a valid JSON format.
    Instructions:
    1. Summarize the ingredient's purpose and health effects in 'summary'.
    2. Classify it as "Positive", "Neutral", "Mixed/Controversial", "Negative", or "Generally Recognized As Safe (GRAS)" in 'classification'.
    3. Briefly explain the classification in 'details'.
    Example for "Rosemary Extract": {{ "summary": "...", "classification": "Positive", "details": "..." }}
    Provide only the JSON object in your response.
    """
    print(f"  - Analyzing: {ingredient_name}")
    response_str = make_openai_request(prompt)
    if not response_str:
        return None
    try:
        return json.loads(response_str)
    except json.JSONDecodeError:
        print(f"Error: Failed to decode analysis for '{ingredient_name}'.")
        return None

# --- PIPELINE STEP 3: GENERATE FINAL SUMMARY AND SCORE ---

def generate_final_summary(ingredient_analyses):
    analyses_json = json.dumps(ingredient_analyses, indent=2)
    prompt = f"""
    You are an expert food product analyst. Given a JSON array of ingredient analyses, create a holistic "eatability" report.
    The ingredients are listed in order of prevalence.
    Instructions:
    1. Review all analyses in the JSON below.
    2. Pay close attention to the order and classification of each ingredient.
    3. Generate an "eatability_score" from 0 (do not eat) to 100 (exceptionally healthy).
    4. Provide a "score_reasoning" to justify the score.
    5. List the main "positives" and "potential_issues".
    6. Write a final "overall_summary".
    Your final output must be a single, valid JSON object with keys: "eatability_score", "score_reasoning", "positives", "potential_issues", "overall_summary".

    Ingredient Data:
    {analyses_json}
    """
    print("\nStep 3: Generating final summary and score...")
    response_str = make_openai_request(prompt)
    if not response_str:
        return None
    try:
        return json.loads(response_str)
    except json.JSONDecodeError:
        print("Error: Failed to decode the final summary JSON.")
        return None

# --- MAIN EXECUTION ---
if __name__ == "__main__":
    # 1. Define the path to your image
    image_file_path = "/Users/bharadwaj/Downloads/sample-food-label.png"

    # Step 1
    ingredients = extract_ingredients_from_image(image_file_path)

    if not ingredients:
        print("Could not extract any ingredients. Exiting.")
    else:
        print(f"\nSuccessfully extracted {len(ingredients)} ingredients.")
        
        # Step 2
        print("\nStep 2: Analyzing each ingredient...")
        all_analyses = []
        for ingredient in ingredients:
            analysis = analyze_single_ingredient(ingredient)
            if analysis:
                all_analyses.append(analysis)
            time.sleep(1) # Be nice to the API, add a small delay

        # Step 3
        if not all_analyses:
            print("No ingredient analyses were successful. Cannot generate summary.")
        else:
            final_report = generate_final_summary(all_analyses)
            
            if final_report:
                print("\n\n--- FOOD PRODUCT ANALYSIS COMPLETE ---")
                print(json.dumps(final_report, indent=4))
                print("------------------------------------")
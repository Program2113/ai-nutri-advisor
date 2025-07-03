import sys
import os
import base64
import json
from dotenv import load_dotenv
from openai import OpenAI

if sys.version_info < (3, 7):
    raise RuntimeError("This project requires Python 3.7 or higher.")


# It's best practice to use environment variables for your API key.
# The OpenAI library automatically looks for this environment variable.
# If you don't set it, you can pass the key directly:
# client = OpenAI(api_key="YOUR_API_KEY")

load_dotenv()
api_key = os.getenv("OPENAI_APIKEY")
client = OpenAI(api_key=api_key)


def encode_image_to_base64(image_path):
    """Encodes an image file to a base64 string."""
    try:
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    except FileNotFoundError:
        print(f"Error: The file '{image_path}' was not found.")
        return None
    except OSError as e:
        print(f"An OS error occurred while encoding the image: {e}")
        return None
    except base64.binascii.Error as e:
        print(f"Base64 encoding error: {e}")
        return None

def get_ingredients_from_image(image_path, prompt):
    """
    Sends an image and a prompt to the OpenAI API to extract ingredients.
    Returns a list of ingredients.
    """
    base64_image = encode_image_to_base64(image_path)
    if not base64_image:
        return [] # Return an empty list if image encoding fails

    try:
        response = client.chat.completions.create(
            model="gpt-4o", # Use the latest vision model
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=1000 # Adjust as needed for very long ingredient lists
        )

        # The response from the model is a JSON string, so we need to parse it.
        response_text = response.choices[0].message.content
        
        # Clean the response to ensure it's valid JSON
        # GPT can sometimes wrap its JSON in ```json ... ```
        if response_text.strip().startswith("```json"):
            response_text = response_text.strip()[7:-3].strip()

        # Parse the JSON string into a Python list
        ingredients = json.loads(response_text)
        return ingredients

    except json.JSONDecodeError:
        print("Error: Failed to decode the JSON response from the API.")
        print("Raw response:", response_text)
        return []
    except (AttributeError, KeyError, TypeError) as e:
        print(f"An error occurred while processing the API response: {e}")
        return []
    except Exception as e:
        # Optionally, re-raise unexpected exceptions or log them differently
        print(f"An unexpected error occurred: {e}")
        return []


# --- Main Execution ---
if __name__ == "__main__":
    # 1. Define the path to your image
    # Replace this with the actual path to your food label image
    # For example: 'C:/Users/YourUser/Pictures/cookie_ingredients.jpg'
    image_file_path = "/Users/bharadwaj/Downloads/sample-food-label.png"

    # 2. Use the recommended advanced prompt
    extraction_prompt = """
    You are an expert data extraction assistant specializing in food labels.
    Your task is to analyze the provided image of a food product's ingredients section.

    Carefully read the text and identify the complete list of ingredients.

    Instructions:
    1. Extract every single ingredient listed.
    2. Pay close attention to sub-ingredients listed in parentheses.
    3. Do not include nutritional facts or allergy warnings (like "Contains: Wheat, Soy").
    4. Provide the output as a single, flat JSON array of strings. Each string in the array should be one ingredient.
    5. If you cannot find an ingredient list or the text is unreadable, return an empty JSON array: [].
    """

    # 3. Call the function and get the ingredients
    print(f"Analyzing image: {image_file_path}...")
    extracted_ingredients = get_ingredients_from_image(image_file_path, extraction_prompt)

    # 4. Print the results
    if extracted_ingredients:
        print("\n--- Extracted Ingredients ---")
        for i, ingredient in enumerate(extracted_ingredients, 1):
            print(f"{i}. {ingredient}")
        print("\n--------------------------")
    else:
        print("\nCould not extract ingredients. Please check the image file and path.")
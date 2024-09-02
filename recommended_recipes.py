import collections
from collections import Counter
import requests
import sys
import json

# Update these with your actual API endpoints
api_url_all_recipes = 'http://192.168.18.108:2000/api/get_allrecipe'
api_url_last_viewed = 'http://192.168.18.108:2000/api/getLastViewedRecipes'

# User ID to fetch last viewed recipes
user_id = sys.argv[1]

def fetch_from_api(api_url, data={}):
    try:
        response = requests.post(api_url, json=data)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Failed to fetch from API: Status Code {response.status_code}")
            return []
    except Exception as e:
        print(f"An error occurred: {e}")
        return []

def recommend_recipes(last_viewed_types, all_recipes, num_recommendations=5):
    # Count the occurrences of each type in last viewed recipes
    type_counts = Counter(last_viewed_types)

    # Sort types by frequency (most common first)
    common_types = [type_count[0] for type_count in type_counts.most_common()]

    recommended = []
    for recipe_type in common_types:
        # Find recipes of this type
        for recipe in all_recipes:
            if recipe['rtype'] == recipe_type and recipe not in recommended:
                recommended.append(recipe)
                if len(recommended) == num_recommendations:
                    break
    return recommended

# Fetch the last viewed recipes for the given user ID, now expecting types instead of names
last_viewed_recipes_response = fetch_from_api(api_url_last_viewed, {"userId": user_id})
last_viewed_types = last_viewed_recipes_response.get('lastViewedRecipes', [])

# Fetch all recipes (ensure all_recipes is correctly formatted as a list of dictionaries)
all_recipes = fetch_from_api(api_url_all_recipes)

# Use the updated function with the list of types
recommendations = recommend_recipes(last_viewed_types, all_recipes)

# Extracting just the recipe names
recipe_names = [recipe['rname'] for recipe in recommendations]
print(json.dumps(recipe_names, indent=4))
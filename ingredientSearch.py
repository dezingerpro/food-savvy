import requests
import sys
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def fetch_recipes(api_url):
    post_data = {}
    response = requests.post(api_url, json=post_data)
    if response.status_code == 200:
        return response.json()  # Assuming the API returns a JSON list of recipes
    else:
        print(f"Failed to fetch recipes: Status Code {response.status_code}")
        return []
        
api_url = 'http://192.168.18.108:2000/api/get_allrecipe'
recipes_data = fetch_recipes(api_url)

recipes = []
for recipe_data in recipes_data:
    ingredients = [ingredient['ingredientName'] for ingredient in recipe_data['ringredients']]
    recipes.append({'name': recipe_data['rname'], 'ingredients': ingredients})

recipe_texts = [' '.join(recipe['ingredients']) for recipe in recipes]

tfidf_vectorizer = TfidfVectorizer(ngram_range=(1, 2))
tfidf_matrix = tfidf_vectorizer.fit_transform(recipe_texts)

def recommend_recipes(user_ingredients, num_recommendations=10):
    user_ingredients_text = ' '.join(user_ingredients).lower()
    user_tfidf_vector = tfidf_vectorizer.transform([user_ingredients_text])
    
    cosine_similarities = cosine_similarity(user_tfidf_vector, tfidf_matrix).flatten()
    recommendations_indices = np.argsort(cosine_similarities)[::-1][:num_recommendations]
    
    recommendations = [{'name': recipes[idx]['name'], 'similarity': cosine_similarities[idx]} for idx in recommendations_indices]
    
    return {'recommended_recipes': recommendations}

if len(sys.argv) > 1:
    user_ingredients = sys.argv[1].strip('[]').split(',')
    user_ingredients = [ingredient.strip('"') for ingredient in user_ingredients]
else:
    user_ingredients = []

recommendations_json = recommend_recipes(user_ingredients)
print(json.dumps(recommendations_json, indent=4))

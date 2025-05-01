from openai import OpenAI
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import os

# načítání proměnné z .env souboru
# Lokálně aktivní, na Renderu se ignoruje
load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

fine_tuned_model = "ft:gpt-3.5-turbo-0125:personal::BDaxgIqk"

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST']) # posíláme data - user_input, proto POST
def chat():
    user_input = request.json.get("message")
        # Dotaz na OpenAI API s fine-tunovaným modelem
    try:
        response = client.chat.completions.create(
            model=fine_tuned_model,  # Použití tvého fine-tunovaného modelu
            messages=[
                {"role": "system", "content": "Jsi chatbot asistent na stránce Kooira, která prodává výrobky pro psy. Primárně se snažíš zákazníkům poradit s výběrem, odpovídáš mile a přátelsky, často používáš i emoji, aby byla komunikace příjemnější. Pokud neznáš odpověď na konkrétní otázku o výrobcích na stránce, doporuč, aby nám zákazník napsal zprávu na Facebooku."},
                {"role": "user", "content": user_input}
            ],
            temperature=0,  # 0 = přesné odpovědi, 1 = kreativní
            max_tokens=100  # Omezíme délku odpovědi
        )

        ai_response = response.choices[0].message.content

    except Exception as e:
        print(f"Chyba při získávání odpovědi: {e}")  # Logování chyby do konzole
        ai_response = "Omlouvám se, nastala chyba při získávání odpovědi."

    return jsonify({"response": ai_response})

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=10000, use_reloader=False)

from openai import OpenAI
from flask import Flask, render_template, request, jsonify, session
from flask_session import Session
from dotenv import load_dotenv
import os
import chromadb
from chromadb.utils import embedding_functions

# načítání proměnné z .env souboru
# Lokálně aktivní, na Renderu se ignoruje
load_dotenv()

api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

fine_tuned_model = "ft:gpt-3.5-turbo-0125:personal::BDaxgIqk"

# Vektorová databáze
chroma_client = chromadb.PersistentClient(path="chroma_db")
openai_ef = embedding_functions.OpenAIEmbeddingFunction(api_key=api_key, model_name="text-embedding-3-small")
collection = chroma_client.get_or_create_collection("kooira_docs", embedding_function=openai_ef)

app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chat', methods=['POST']) # posíláme data - user_input, proto POST
def chat():
    user_input = request.json.get("message")

    if "history" not in session:
        session["history"] = []
        # Dotaz na OpenAI API s fine-tunovaným modelem
    try:
        # Vyhledej nejrelevantnější obsah z webu
        embedded_query = openai_ef(user_input)[0].tolist()
        results = collection.query(query_embeddings=[embedded_query], n_results=1)

        context = ""
        if results and results['documents'] and results['metadatas']:
            doc = results['documents'][0][0]
            url = results['metadatas'][0][0]["url"]
            context = f"Toto je text ze stránek Kooira.cz: {doc}\n(Zdroj: {url})"
        else:
            context = "Zákazník se ptá na produkt, ale v datech z webu jsem nic nenašel."

        messages = [
            {"role": "system", "content": f"Jsi chatbot asistent na stránce Kooira, která prodává výrobky pro psy. Primárně se snažíš zákazníkům poradit s výběrem, odpovídáš mile a přátelsky, často používáš i emoji, aby byla komunikace příjemnější. Použij vhodně následující text: {context} Při odpovídání používej pouze informace a odkazy, které jsou uvedené v zadaném kontextu. Nevymýšlej si žádné další URL ani produkty. Pokud odpověď neznáš, napiš, že si nejsi jistý a doporuč kontakt přes Facebook."}
        ]

        messages.extend(session["history"][-6:])  # poslední 3 výměny
        messages.append({"role": "user", "content": user_input})

        response = client.chat.completions.create(
            model=fine_tuned_model,
            messages=messages,
            temperature=0,
            max_tokens=100
        )

        ai_response = response.choices[0].message.content

        session["history"].append({"role": "user", "content": user_input})
        session["history"].append({"role": "assistant", "content": ai_response})

    except Exception as e:
        print(f"Chyba při získávání odpovědi: {e}")  # Logování chyby do konzole
        ai_response = "Omlouvám se, nastala chyba při získávání odpovědi."

    return jsonify({"response": ai_response})

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=10000, use_reloader=False)

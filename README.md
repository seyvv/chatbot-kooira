# 🐾 Kooira Chatbot 

Chatbot pomáhá zákazníkům webu [Kooira.cz](https://kooira.cz) s výběrem produktů pro psy. Využívá OpenAI API (fine-tuned model GPT-3.5-turbo), RAG (retrieval-augmented generation) přes ChromaDB a ukládá historii konverzace pomocí Flask session.

---

## ✅ Funkce
- Vyhledává informace ze stránky kooira.cz pomocí embeddingů (RAG)
- Využívá fine-tuned GPT-3.5 pro přátelské odpovědi
- Pamatuje si kontext konverzace pomocí session (dokud je otevřená stránka)

---

## 📦 Požadavky
- Python 3.10+
- `requirements.txt` obsahuje:

```
flask
flask-session
openai
python-dotenv
requests
beautifulsoup4
chromadb
```

Nainstaluješ vše pomocí:
```bash
pip install -r requirements.txt
```

---

## ⚙️ Nastavení

1. **Vytvoř `.env` soubor:**

```
OPENAI_API_KEY=tvuj-api-klic-sem
SECRET_KEY=nahodny-dlouhy-retezec-sem
```

🔑 `SECRET_KEY` se používá k podepisování session cookie. Vygeneruj si ho třeba takto:

```python
import secrets
print(secrets.token_hex(32))
```

2. **Vytvoř vektorovou databázi před spuštěním:**
Spusť `scrape_and_index.py` (nebo jiný skript, který načítá obsah z webu).

---

## ▶️ Spuštění

```bash
python main.py
```
Otevři `http://localhost:10000` ve svém prohlížeči.

---

## 📁 Struktura projektu
```
Chatbot/
├── chroma_db/           # Vektorová databáze (vygenerovaná)
├── flask_session/       # Úložiště pro session (vygenerované Flaskem)
├── static/
│   ├── script.js         # Klientský JavaScript pro chatové UI
│   └── style.css         # Základní styly vzhledu
├── templates/
│   └── index.html        # HTML šablona pro rozhraní
├── .env                  # Proměnné prostředí (API klíče)
├── .gitignore
├── faq_dataset.jsonl     # Dataset pro fine-tuning
├── main.ipynb            # Experimentální Jupyter notebook (použit pro fine-tuning)
├── main.py               # Flask backend aplikace
├── rag_indexer.py        # Skript pro scrapování a indexaci webu Kooira.cz
├── README.md
└── requirements.txt
```

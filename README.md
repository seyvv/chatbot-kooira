# 🐾 Kooira Chatbot 

Tento projekt je chatbot, který pomáhá zákazníkům webu [Kooira.cz](https://kooira.cz) s výběrem produktů pro psy. Využívá OpenAI API (fine-tuned model GPT-3.5-turbo), RAG (retrieval-augmented generation) přes ChromaDB a ukládá historii konverzace pomocí Flask session.

---

## ✅ Funkce
- 🔍 Vyhledává informace ze stránky kooira.cz pomocí embeddingů (RAG)
- 🤖 Využívá fine-tuned GPT-3.5 pro přátelské odpovědi
- 💬 Pamatuje si kontext konverzace pomocí session (dokud je otevřená stránka)
- 🔒 Nevymýšlí si odkazy – používá jen reálné z RAG databáze

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

## 🌐 Nasazení na Render.com

1. Nahraj celý projekt na GitHub (včetně složky `chroma_db/`)
2. V Render.com:
   - přidej environment variable `OPENAI_API_KEY`
   - přidej environment variable `SECRET_KEY`
   - nastav build command: `pip install -r requirements.txt`
   - nastav start command: `python main.py`
3. Po nasazení se session bude chovat stejně jako lokálně – uchová se jen během otevřeného okna.

---

## 🧪 Ověření funkce session
- Otevři stránku, pošli několik zpráv
- Zavři celé okno prohlížeče
- Otevři znovu a ověř, že konverzace začíná od znova

---

## 📁 Struktura projektu
```
├── main.py              # Flask backend
├── scrape_and_index.py # Web scraper + Chroma indexace
├── chroma_db/           # Vektorová databáze (vygenerovaná)
├── templates/
│   └── index.html       # Chat frontend
├── static/
│   ├── script.js
│   └── style.css
├── .env                 # API klíče (nenahrávej veřejně!)
├── requirements.txt
└── README.md
```

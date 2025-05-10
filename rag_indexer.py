import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import os
import chromadb
from chromadb.utils import embedding_functions
from openai import OpenAI
from dotenv import load_dotenv
import time

# Načti .env proměnné
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")

# Nastav klienty
client = OpenAI(api_key=openai_api_key)
chroma_client = chromadb.PersistentClient(path="chroma_db")
openai_ef = embedding_functions.OpenAIEmbeddingFunction(api_key=openai_api_key, model_name="text-embedding-3-small")
collection = chroma_client.get_or_create_collection("kooira_docs", embedding_function=openai_ef)

# Základní URL webu
BASE_URL = "https://kooira.cz"

# Získání interních odkazů
def get_internal_links(url):
    resp = requests.get(url)
    soup = BeautifulSoup(resp.text, 'html.parser')
    links = set()
    for a in soup.find_all('a', href=True):
        full_url = urljoin(url, a['href'])
        if full_url.startswith(BASE_URL):
            cleaned_url = full_url.split("#")[0]
            # Filtrování obrázků a binárních souborů
            if not cleaned_url.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.svg')):
                links.add(cleaned_url)
    return list(links)


# Extrakce čistého textu z URL
def extract_text_from_url(url):
    try:
        resp = requests.get(url)
        soup = BeautifulSoup(resp.text, 'html.parser')

        # Odstranit nežádoucí elementy
        for tag in soup(["script", "style", "svg", "img", "nav", "footer", "header", "aside"]):
            tag.decompose()

        # Vybrat hlavní obsah, pokud existuje
        main_content = soup.find('main') or soup.find('article') or soup.body or soup

        # Získat čistý text
        text = main_content.get_text(separator=' ')
        return ' '.join(text.split())

    except Exception as e:
        print(f"❌ Chyba při extrakci z {url}: {e}")
        return ""

# Hlavní běh
if __name__ == "__main__":
    print("Stahuji odkazy ze stránky...")
    links = get_internal_links(BASE_URL)
    print(f"Nalezeno {len(links)} odkazů")

    for i, link in enumerate(links):
        print(f"\n[{i+1}/{len(links)}] Zpracovávám: {link}")
        text = extract_text_from_url(link)
        if len(text) > 100:
            chunks = [text[i:i+500] for i in range(0, len(text), 500)]
            for idx, chunk in enumerate(chunks):
                metadata = {"url": link, "chunk": idx}
                collection.add(documents=[chunk], metadatas=[metadata], ids=[f"{link}#{idx}"])
                time.sleep(0.2)
    print("\nIndexace dokončena.")

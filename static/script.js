const sendChatBtn = document.querySelector('.chat-input span');
const chatInput = document.querySelector('.chat-input textarea');
const chatBox = document.querySelector('.chatbox');
const chatbotToggler = document.querySelector('.chatbot-toggler');

let userMessage;
const inputInitHeight = chatInput.scrollHeight;

// Funkce pro převod URL na klikací odkazy s textem "Kooira"
function convertLinksToClickableText(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">Kooira</a>`; // target="_blank" otevře stránku v nové záložce, a rel jsou bezpečnostní opatření
    });
}

// Vytváří <li> element chatu s vloženou zprávou a názvem třídy
const createChatMessage = (message, className) => {
    const chatMessage = document.createElement('li');
    // připojí zprávu uživatele k chatboxu
    chatBox.appendChild(chatMessage);
    chatMessage.classList.add(className);

    // pokud je className outgoing, pak jen zpráva, jinak span (emotikona) a zpráva
    let chatContent = className === 'outgoing'
        ? `<p></p>`
        : `<span class="material-symbols-outlined">pets</span><p></p>`;

    chatMessage.innerHTML = chatContent; // přidání struktury zprávy
    chatMessage.querySelector('p').textContent = message; // zpráva jako text, nesmí zpracovávat např. html tagy
    return chatMessage;
}

// Funkce pro odeslání zprávy na backend
const generateResponse = async (thinkingMessage) => {

    const responseMessage = thinkingMessage.querySelector('p');

    try {
        const response = await fetch('/chat', { // Odeslání POST požadavku na Flask
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage })
        });

        const data = await response.json();

        // Nahradíme text ve zprávě "Přemýšlím..." odpovědí od AI
        responseMessage.innerHTML = convertLinksToClickableText(data.response); // Odpověď bota s použitím funkce na převedení odkazu
    } catch (error) {
        responseMessage.classList.add('error');
        responseMessage.textContent = 'Nastala chyba při komunikaci s chatbotem. Zkuste to prosím znovu';
    } finally {
        chatBox.scrollTo(0, chatBox.scrollHeight); // automatické scrollování dolů na poslední zprávu
    }
};

// Poslání zprávy
const handleChat = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    chatInput.value = ""; // vyprázdnění textarey
    chatInput.style.height = `${inputInitHeight}px`; // nastavení původní výšky textarey

    createChatMessage(userMessage, 'outgoing');
    chatBox.scrollTo(0, chatBox.scrollHeight); // automatické scrollování dolů na poslední zprávu

    setTimeout(() => {
        // Ukáže zprávu "Přemýšlím..." zatímco se čeká na odpověď AI
        const thinkingMessage = createChatMessage('Přemýšlím...', 'incoming');
        chatBox.scrollTo(0, chatBox.scrollHeight); // automatické scrollování dolů na poslední zprávu
        generateResponse(thinkingMessage);
    }, 600);
};

// Přizpůsobení velikosti textarey v závislosti na velikosti obsahu
chatInput.addEventListener('input', () => {
    chatInput.style.height = `${inputInitHeight}px`; // nastavení původní výšky textarey
    chatInput.style.height = `${chatInput.scrollHeight}px`; // nastavení nové výšky podle obsahu
});

// Při stisknutí klávesy Enter bez Shiftu se pošle zpráva
chatInput.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' && !e.shiftKey) { // e.key vrací název klávesy, kterou uživatel stiskl, jako String
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener('click', handleChat);
chatbotToggler.addEventListener('click', () => document.body.classList.toggle('show-chatbot')); // anonymní funkce která bud přidává nebo odebírá třídu show-chatbot a tím otevří/zavírá chatbox okno
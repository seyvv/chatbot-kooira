const sendChatBtn = document.querySelector('.chat-input span');
const chatInput = document.querySelector('.chat-input textarea');
const chatBox = document.querySelector('.chatbox');
const chatbotToggler = document.querySelector('.chatbot-toggler');

let userMessage;
const inputInitHeight = chatInput.scrollHeight;

// Funkce pro převod URL na klikací odkazy s textem "Kooira"
const convertLinksToClickableText = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => {
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">Kooira</a>`; // target="_blank" otevře stránku v nové záložce, a rel jsou bezpečnostní opatření
    });
}

// Funkce pro obnovení chatboxu ze sessionStorage po načtení
const restoreChatFromStorage = () => {
    const savedContent = sessionStorage.getItem('chatbox_content');
    if (savedContent) {
        chatBox.innerHTML = savedContent;
        chatBox.scrollTo(0, chatBox.scrollHeight);
    }
}

// Funkce pro uložení chatu do sessionStorage
const saveChatToStorage = () => {
    sessionStorage.setItem('chatbox_content', chatBox.innerHTML);
}

// Funkce pro uchování stavu chatbota (otevřený/zavřený)
const saveChatState = (isOpen) => {
    sessionStorage.setItem('chatbot_open', isOpen ? '1' : '0');
}

// Funkce pro načtení stavu chatbota
const restoreChatState = () => {
    const open = sessionStorage.getItem('chatbot_open');
    if (open === '1') {
        document.body.classList.add('show-chatbot');
    }
}

// Spuštění obnovy při načtení stránky
restoreChatState();
restoreChatFromStorage();

const createChatMessage = (message, className) => {
    const chatMessage = document.createElement('li');
    chatBox.appendChild(chatMessage);
    chatMessage.classList.add(className);

    let chatContent = className === 'outgoing'
        ? `<p></p>`
        : `<span class="material-symbols-outlined">pets</span><p></p>`;

    chatMessage.innerHTML = chatContent; 
    chatMessage.querySelector('p').textContent = message; 
    saveChatToStorage(); 
    return chatMessage;
}

// Funkce pro odeslání zprávy na backend
const generateResponse = async (thinkingMessage) => {

    const responseMessage = thinkingMessage.querySelector('p');

    try {
        const response = await fetch('/chat', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage })
        });

        const data = await response.json();

        responseMessage.innerHTML = convertLinksToClickableText(data.response); 
        saveChatToStorage(); 
    } catch (error) {
        responseMessage.classList.add('error');
        responseMessage.textContent = 'Nastala chyba při komunikaci s chatbotem. Zkuste to prosím znovu';
    } finally {
        chatBox.scrollTo(0, chatBox.scrollHeight); 
    }
};

// Poslání zprávy
const handleChat = () => {
    userMessage = chatInput.value.trim();
    if (!userMessage) return;

    chatInput.value = ""; 
    chatInput.style.height = `${inputInitHeight}px`; 

    createChatMessage(userMessage, 'outgoing');
    chatBox.scrollTo(0, chatBox.scrollHeight); 

    setTimeout(() => {
        const thinkingMessage = createChatMessage('Přemýšlím...', 'incoming');
        chatBox.scrollTo(0, chatBox.scrollHeight);
        generateResponse(thinkingMessage);
    }, 600);
};

// Přizpůsobení velikosti textarey v závislosti na velikosti obsahu
chatInput.addEventListener('input', () => {
    chatInput.style.height = `${inputInitHeight}px`; 
    chatInput.style.height = `${chatInput.scrollHeight}px`; 
});

// Při stisknutí klávesy Enter bez Shiftu se pošle zpráva
chatInput.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' && !e.shiftKey) { 
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener('click', handleChat);

// Toggle button s uložením stavu
chatbotToggler.addEventListener('click', () => {
    const isOpen = document.body.classList.toggle('show-chatbot');
    saveChatState(isOpen);
}); 
// anonymní funkce která bud přidává nebo odebírá třídu show-chatbot a tím otevří/zavírá chatbox okno
// Arquivo: src/pages/home.js

// Importamos apenas o componente de renderização do Card
const { createLinkCard } = require('../components/LinkCard'); 

// REMOVEMOS A IMPORTAÇÃO DO MOCK API AQUI!
// const { apiGetCollections, apiGetLinks, apiCreateLink, ... } = require('../../server/api/api'); 


// ===================================================
// UTILS DE API (Fetch Real) 🌐
// ===================================================

const BASE_URL = '/api';

/**
 * Utilitário para fazer requisições Fetch para o servidor Express.
 * @param {string} url - O endpoint da API (ex: /links/col-inbox).
 * @param {string} method - O método HTTP (GET, POST, PUT, DELETE).
 * @param {Object} data - O corpo da requisição para POST/PUT.
 * @returns {Promise<Response>} A resposta nativa do Fetch.
 */
async function fetchApi(url, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    // A chamada real para http://localhost:3000/api/endpoint
    const response = await fetch(`${BASE_URL}${url}`, options);
    return response;
}


// ===================================================
// VARIÁVEIS DO DOM
// ===================================================

const sidebarElement = document.getElementById('sidebar');
const linkGridElement = document.getElementById('link-grid');
const addLinkButton = document.getElementById('add-link-btn');
const linkFormElement = document.getElementById('link-form');
const previewModal = document.getElementById('preview-modal');
const previewContent = document.getElementById('preview-content');
const closePreviewBtn = document.getElementById('close-preview-btn'); 
const searchInput = document.getElementById('search-input'); 

let currentCollectionId = 'col-inbox'; // Começa na Inbox

// Exportamos a função fetchApi para que LinkCard possa usá-la
module.exports.fetchApi = fetchApi; 


// ===================================================
// FUNÇÕES DE PREVIEW (LIVE IFRAME)
// ===================================================

/**
 * 👁️ Abre o modal de pré-visualização (Live Preview Iframe).
 * @param {string} url - A URL do site a ser visualizado.
 */
function openPreview(url) {
    // 1. Limpa o conteúdo anterior
    previewContent.innerHTML = '';
    
    // 2. Cria o elemento iframe
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.backgroundColor = '#fff';
    
    previewContent.appendChild(iframe);
    previewModal.style.display = 'flex'; // Exibe o modal
}

// Configura o botão de fechar
if (closePreviewBtn) {
    closePreviewBtn.addEventListener('click', () => {
        previewModal.style.display = 'none';
        previewContent.innerHTML = ''; // Limpa o iframe ao fechar
    });
}


// ===================================================
// FUNÇÕES DE RENDERIZAÇÃO E DADOS (ATUALIZADAS)
// ===================================================

/**
 * 🎨 Renderiza a lista de coleções na barra lateral.
 */
async function renderSidebar() {
    // CHAMA A API REAL
    const collectionsResponse = await fetchApi('/collections'); 
    const collections = collectionsResponse.ok ? await collectionsResponse.json() : [];

    const list = document.createElement('ul');
    list.className = 'collection-list';

    // Opção "Todos os Links"
    list.innerHTML += `<li data-id="all" class="${currentCollectionId === 'all' ? 'active' : ''}">📁 Todos os Links</li>`;

    // Coleções dinâmicas
    collections.forEach(col => {
        list.innerHTML += `<li data-id="${col.id}" class="${col.id === currentCollectionId ? 'active' : ''}">📁 ${col.name}</li>`;
    });

    sidebarElement.innerHTML = '';
    sidebarElement.appendChild(list);

    // Configura o listener para trocar de coleção
    list.querySelectorAll('li').forEach(item => {
        item.addEventListener('click', (e) => {
            const newId = e.target.closest('li').dataset.id;
            
            // Remove a classe 'active' de todos e adiciona ao selecionado
            list.querySelectorAll('li').forEach(li => li.classList.remove('active'));
            e.target.closest('li').classList.add('active');
            
            currentCollectionId = newId;
            loadLinks(currentCollectionId);
        });
    });
}

/**
 * 🔄 Carrega e renderiza os links da coleção atual.
 */
async function loadLinks(collectionId) {
    linkGridElement.innerHTML = '<h2>Carregando links...</h2>';
    
    // CHAMA A API REAL
    const linksResponse = await fetchApi(`/links/${collectionId}`); 
    
    if (!linksResponse.ok) {
        linkGridElement.innerHTML = `<h2>Erro ao carregar links. Status: ${linksResponse.status}</h2>`;
        return;
    }
    
    const links = await linksResponse.json();
    
    if (links.length === 0) {
        linkGridElement.innerHTML = '<h2>Nenhum link encontrado nesta coleção.</h2>';
        return;
    }
    
    linkGridElement.innerHTML = '';
    
    // A função loadLinks é passada para LinkCard.js para que ele possa recarregar a lista
    // após ações (como deletar ou marcar como lido).
    links.forEach(link => {
        const cardElement = createLinkCard(link, loadLinks, openPreview);
        linkGridElement.appendChild(cardElement);
    });
}


// ===================================================
// HANDLERS DO FORMULÁRIO (ATUALIZADOS)
// ===================================================

/**
 * 📥 Trata o envio do formulário de criação de link.
 */
async function handleLinkFormSubmit(e) {
    e.preventDefault();

    const submitButton = linkFormElement.querySelector('button[type="submit"]');
    submitButton.textContent = 'Salvando... 🤖';
    linkFormElement.style.pointerEvents = 'none'; // Desabilita o formulário durante o processo

    const url = document.getElementById('link-url').value;
    // Título e Descrição não são mais coletados, pois o Scraper/Backend faz isso.
    const tags = document.getElementById('link-tags').value;
    const collectionId = document.getElementById('link-collection').value;

    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    const newLinkData = {
        url: url,
        tags: tagsArray,
        collection_id: collectionId 
    };

    try {
        // CHAMA A API REAL
        const response = await fetchApi('/links', 'POST', newLinkData); 
        if (!response.ok) throw new Error('Falha na criação do link: Status ' + response.status);
        
        // Recarrega os links da coleção atual para mostrar o novo item
        loadLinks(currentCollectionId);
    } catch (error) {
        alert(`Erro ao criar link: ${error.message}`);
    }
    
    // FINALIZAÇÃO: Reseta, reabilita e esconde o formulário
    linkFormElement.reset();
    linkFormElement.style.pointerEvents = 'auto';
    submitButton.textContent = 'Salvar Link';
    linkFormElement.style.display = 'none';
}


// ===================================================
// HANDLER DE BUSCA (Search - ATUALIZADO)
// ===================================================

/**
 * 🔎 Trata o evento de busca (digitando no input).
 */
async function handleSearch(e) {
    const query = e.target.value.trim();
    
    if (query.length < 3 && query.length !== 0) {
        linkGridElement.innerHTML = '<p>Digite pelo menos 3 caracteres para buscar.</p>';
        return;
    }
    
    // Se a busca estiver vazia, carrega a coleção atual
    if (query === '') {
        loadLinks(currentCollectionId);
        return;
    }

    linkGridElement.innerHTML = '<p>Buscando...</p>';
    
    // CHAMA A API REAL
    const searchResponse = await fetchApi(`/search?q=${query}`);
    
    if (!searchResponse.ok) {
        linkGridElement.innerHTML = `<h2>Erro na busca. Status: ${searchResponse.status}</h2>`;
        return;
    }

    const results = await searchResponse.json();

    if (results.length === 0) {
        linkGridElement.innerHTML = `<h2>Nenhum resultado encontrado para "${query}".</h2>`;
        return;
    }

    linkGridElement.innerHTML = '';
    results.forEach(link => {
        const cardElement = createLinkCard(link, loadLinks, openPreview);
        linkGridElement.appendChild(cardElement);
    });
}


// ===================================================
// INICIALIZAÇÃO
// ===================================================

/**
 * 🚀 Função principal para iniciar o aplicativo.
 */
function initApp() {
    // 1. Carrega e renderiza todas as coleções na barra lateral
    renderSidebar();
    
    // 2. Carrega os links da coleção inicial
    loadLinks(currentCollectionId);

    // 3. Configura o formulário de adição
    linkFormElement.addEventListener('submit', handleLinkFormSubmit);
    addLinkButton.addEventListener('click', async () => { 
        // Assegura que o formulário está no modo 'Criação'
        linkFormElement.querySelector('button[type="submit"]').textContent = 'Salvar Link';
        if (linkFormElement._currentUpdateListener) {
            linkFormElement.removeEventListener('submit', linkFormElement._currentUpdateListener); 
        }
        linkFormElement.addEventListener('submit', handleLinkFormSubmit);

        // Preenche as opções de coleção (Busca coleções de forma assíncrona com FETCH REAL)
        const select = document.getElementById('link-collection');
        const collectionsResponse = await fetchApi('/collections');
        const collections = collectionsResponse.ok ? await collectionsResponse.json() : [];

        select.innerHTML = collections.map(col => 
            `<option value=\"${col.id}\" ${col.id === currentCollectionId ? 'selected' : ''}>${col.name}</option>`
        ).join('');
        
        linkFormElement.reset(); // Limpa os campos para nova criação
        linkFormElement.style.display = 'block';
    });
    
    // 4. Configura o evento de busca
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch); 
    }
}

// Inicia tudo quando o script é carregado
initApp();
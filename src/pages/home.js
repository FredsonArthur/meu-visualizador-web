// Arquivo: src/pages/home.js

// 🎯 CORREÇÃO CRÍTICA 1: Usar 'import' e incluir a extensão '.js'
import { createLinkCard } from '../components/LinkCard.js'; 


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
// VARIÁVEIS DO DOM E ESTADO
// ===================================================

const sidebarElement = document.getElementById('sidebar');
const linkGridElement = document.getElementById('link-grid');
const linkFormElement = document.getElementById('link-form');
const addLinkButton = document.getElementById('add-link-btn');
const searchInput = document.getElementById('search-input');
const previewModal = document.getElementById('preview-modal');
const closePreviewBtn = document.getElementById('close-preview-btn');
const previewContent = document.getElementById('preview-content');

let currentCollectionId = 'all'; 
let currentUpdateListener = null; // Para gerenciar o listener de edição/criação


// ===================================================
// FUNÇÕES DE EXIBIÇÃO
// ===================================================

function openPreview(url) {
    previewContent.innerHTML = `<iframe src="${url}" style="width: 100%; height: 100%; border: none;"></iframe>`;
    previewModal.style.display = 'flex';
}

function closePreview() {
    previewModal.style.display = 'none';
    previewContent.innerHTML = '';
}


// ===================================================
// HANDLERS (CRIAÇÃO, EDIÇÃO, BUSCA, SIDEBAR)
// ===================================================


/**
 * 💾 Lida com a submissão do formulário de CRIAÇÃO de link.
 */
async function handleLinkFormSubmit(e) {
    e.preventDefault();
    
    const url = document.getElementById('link-url').value;
    const tagsInput = document.getElementById('link-tags').value;
    const collectionId = document.getElementById('link-collection').value;
    
    const tagsArray = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    const submitButton = linkFormElement.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    submitButton.textContent = 'Salvando...';
    submitButton.disabled = true;

    try {
        const response = await fetchApi('/links', 'POST', {
            url,
            tags: tagsArray,
            collectionId,
        });

        if (!response.ok) throw new Error('Falha ao criar link: ' + response.status);

        // Sucesso
        linkFormElement.style.display = 'none'; 
        linkFormElement.reset(); 
        loadLinks(currentCollectionId); 
        
        alert('Link salvo com sucesso!');

    } catch (error) {
        console.error("Erro ao submeter link:", error);
        alert(`Erro ao salvar link: ${error.message}`);
    } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}


/**
 * ✏️ Lida com o clique no botão de Edição de um Card (Usado em LinkCard.js).
 */
function handleEditLink(e, link) {
    e.stopPropagation(); 
    
    // 1. Prepara e exibe o formulário
    linkFormElement.style.display = 'block';
    
    // 2. Preenche os campos
    document.getElementById('link-url').value = link.url;
    document.getElementById('link-url').disabled = true; // URL desabilitada na edição
    document.getElementById('link-tags').value = link.tags.join(', ');
    
    // Chama a lógica de preenchimento de coleções (como o clique no botão Add)
    // Isso garante que o <select> esteja atualizado antes de definirmos o valor
    addLinkButton.click(); 
    
    // 3. Garante que a coleção correta está selecionada APÓS o click do addLinkButton
    document.getElementById('link-collection').value = link.collection_id;
    
    // 4. Muda o texto do botão
    const submitButton = linkFormElement.querySelector('button[type="submit"]');
    submitButton.textContent = 'Salvar Edição';


    // 5. Remove o listener de CRIAÇÃO e configura o listener de UPDATE
    linkFormElement.removeEventListener('submit', handleLinkFormSubmit);

    if (currentUpdateListener) {
        linkFormElement.removeEventListener('submit', currentUpdateListener);
    }
    
    // Cria o novo listener de Update
    const updateListener = async (event) => {
        event.preventDefault();
        
        const tagsInput = document.getElementById('link-tags').value;
        const collectionId = document.getElementById('link-collection').value;
        const tagsArray = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        submitButton.textContent = 'Atualizando...';
        submitButton.disabled = true;

        try {
            const response = await fetchApi(`/links/${link.id}`, 'PUT', {
                collectionId,
                tags: tagsArray
            });

            if (!response.ok) throw new Error('Falha ao atualizar link: ' + response.status);

            // Sucesso: Fecha e recarrega
            linkFormElement.style.display = 'none';
            linkFormElement.reset();
            currentUpdateListener = null; 
            loadLinks(currentCollectionId);
            alert('Link atualizado com sucesso!');

        } catch (error) {
            console.error("Erro ao atualizar link:", error);
            alert(`Erro ao atualizar link: ${error.message}`);
        } finally {
            submitButton.textContent = 'Salvar Edição'; 
            submitButton.disabled = false;
        }
    };
    
    // 6. Salva e aplica o novo listener
    currentUpdateListener = updateListener;
    linkFormElement.addEventListener('submit', currentUpdateListener);
}


/**
 * 🔄 Recarrega a lista de links.
 */
async function loadLinks(collectionId = currentCollectionId) {
    currentCollectionId = collectionId; 
    linkGridElement.innerHTML = 'Carregando links...';

    try {
        const url = collectionId === 'search' 
            ? `/search?q=${searchInput.value}` 
            : `/links/${collectionId}`;
            
        const response = await fetchApi(url);
        
        if (!response.ok) throw new Error('Falha ao carregar links: ' + response.status);
        
        const links = await response.json();
        
        linkGridElement.innerHTML = '';
        if (links.length === 0) {
            linkGridElement.innerHTML = `<p class="no-links-message">Nenhum link encontrado.</p>`;
        } else {
            links.forEach(link => {
                // Passa o handler de edição como callback
                const card = createLinkCard(link, handleEditLink); 
                linkGridElement.appendChild(card);
            });
        }
        
    } catch (error) {
        console.error("Erro ao carregar links:", error);
        linkGridElement.innerHTML = `<p class="error-message">Erro ao carregar links. ${error.message}</p>`;
    }
}


/**
 * 🎨 Renderiza a barra lateral e configura os listeners de clique.
 */
async function renderSidebar() {
    try {
        const response = await fetchApi('/collections');
        if (!response.ok) throw new Error('Falha ao carregar coleções: ' + response.status);
        
        const collections = await response.json();

        const allLinksOption = { 
            id: 'all', 
            name: 'Todos os Links', 
            icon: 'fa-globe', 
            color: '#333' 
        };
        const allCollections = [allLinksOption, ...collections];
        
        sidebarElement.innerHTML = `
            <ul class="collection-list">
                ${allCollections.map(col => `
                    <li 
                        class="collection-item ${col.id === currentCollectionId ? 'active' : ''}" 
                        data-id="${col.id}"
                        style="--collection-color: ${col.color || '#999'};"
                    >
                        <i class="fa ${col.icon || 'fa-folder-o'}"></i>
                        ${col.name}
                    </li>
                `).join('')}
            </ul>
        `;
        
        sidebarElement.querySelectorAll('.collection-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const newId = e.currentTarget.getAttribute('data-id');
                sidebarElement.querySelectorAll('.collection-item').forEach(li => li.classList.remove('active'));
                e.currentTarget.classList.add('active');
                if (searchInput) {
                    searchInput.value = '';
                }
                loadLinks(newId);
            });
        });
    } catch (error) {
        console.error("Erro ao renderizar sidebar:", error);
        sidebarElement.innerHTML = `<p class="error-message">Erro ao carregar coleções. ${error.message}</p>`;
    }
}


/**
 * 🔎 Lida com a busca de links.
 */
async function handleSearch() {
    const query = searchInput.value.trim();
    
    if (query.length > 2) {
        loadLinks('search'); 
    } else if (query.length === 0) {
        loadLinks(currentCollectionId); 
    }
}


/**
 * 🚀 Função principal de inicialização da aplicação.
 */
function initApp() {
    // 1. Configura o listener para fechar o modal de preview
    closePreviewBtn.addEventListener('click', closePreview);
    
    // 2. Renderiza a barra lateral (Isso aciona o loadLinks inicial)
    renderSidebar();
    
    // 3. Configura o formulário de adição (Listener de CRIAÇÃO padrão)
    linkFormElement.addEventListener('submit', handleLinkFormSubmit);
    
    // 4. Lógica do botão "Adicionar Novo Link" (Onde o formulário deve aparecer)
    addLinkButton.addEventListener('click', async () => { 
        // 4.1. Configura o modo 'Criação'
        linkFormElement.querySelector('button[type="submit"]').textContent = 'Salvar Link';
        
        // 4.2. Garante que o listener é de CRIAÇÃO (desliga edição)
        if (currentUpdateListener) {
            linkFormElement.removeEventListener('submit', currentUpdateListener); 
            currentUpdateListener = null;
        }
        // Garante o listener de CRIAÇÃO está ativo
        linkFormElement.removeEventListener('submit', handleLinkFormSubmit); 
        linkFormElement.addEventListener('submit', handleLinkFormSubmit);


        // 4.3. Preenche o <select> de coleções
        const select = document.getElementById('link-collection');
        const collectionsResponse = await fetchApi('/collections');
        const collections = collectionsResponse.ok ? await collectionsResponse.json() : [];

        select.innerHTML = collections.map(col => 
            `<option value=\"${col.id}\" ${col.id === currentCollectionId ? 'selected' : ''}>${col.name}</option>`
        ).join('');
        
        // 4.4. Limpa e EXIBE o formulário
        document.getElementById('link-url').disabled = false; 
        linkFormElement.reset(); 
        linkFormElement.style.display = 'block'; // 👈 Ação que faz o botão funcionar!
    });
    
    // 5. Configura o evento de busca
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch); 
    }
}

// 6. Inicia tudo quando o script é carregado
initApp();


// 🎯 CORREÇÃO CRÍTICA 2: Trocar 'module.exports' por 'export' no final do arquivo
// Exporta as funções e variáveis necessárias para LinkCard.js
export { 
    fetchApi, 
    loadLinks, 
    openPreview, 
    currentCollectionId, 
    linkGridElement, 
    linkFormElement, 
    handleEditLink 
};
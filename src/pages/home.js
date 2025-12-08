// Simula a importação das funções de gerenciamento de dados
// Em um ambiente de Front-end/Browser, você faria isso via requisições HTTP (Fetch API) 
// para um servidor Node.js real. Aqui, simulamos o acesso direto:
const { 
    getAllCollections, 
    getLinksByCollection, 
    createLink,
    deleteLink, 
    updateLink,
    searchLinks // NOVO
} = require('../../server/api/linkManager'); 

// ===================================================
// VARIÁVEIS DO DOM
// ===================================================

const sidebarElement = document.getElementById('sidebar');
const linkGridElement = document.getElementById('link-grid');
const addLinkButton = document.getElementById('add-link-btn');
const linkFormElement = document.getElementById('link-form');

// VARIÁVEIS PARA O PREVIEW (já presentes no seu código)
const previewModal = document.getElementById('preview-modal');
const previewContent = document.getElementById('preview-content');
const closePreviewBtn = document.getElementById('close-preview-btn'); 

const searchInput = document.getElementById('search-input'); // NOVO: CAMPO DE BUSCA

let currentCollectionId = 'col-inbox'; // Começa na Inbox

// ===================================================
// FUNÇÕES DE PREVIEW (LIVE IFRAME)
// ===================================================

/**
 * 👁️ Abre o modal de pré-visualização (Live Preview Iframe).
 * @param {string} url - A URL do site a ser visualizado.
 */
function openPreview(url) {
    previewContent.innerHTML = '';
    
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.title = `Pré-visualização de ${url}`;
    
    previewContent.appendChild(iframe);

    previewModal.style.display = 'flex'; 
}

// Configura o fechamento do modal
if (closePreviewBtn) {
    closePreviewBtn.addEventListener('click', () => {
        previewModal.style.display = 'none';
        previewContent.innerHTML = '';
    });
}


// ===================================================
// FUNÇÕES DE RENDERIZAÇÃO
// ===================================================

/**
 * 🎨 Cria e retorna o HTML para um Card de Link.
 * @param {Object} link - Objeto LinkItem.
 */
function createLinkCard(link) {
    const card = document.createElement('div');
    card.className = 'link-card';
    card.setAttribute('data-link-id', link.id);

    // Estrutura básica do card, incluindo a imagem de preview
    const previewHtml = link.preview_image_url ? 
        `<img src="${link.preview_image_url}" alt="Pré-visualização do site">` : 
        `<p class="static-preview-text">Visualização indisponível. Clique para ver o site.</p>`;
    
    card.innerHTML = `
        <div class="card-preview">
            ${previewHtml}
        </div>
        <div class="card-content">
            <h3>${link.title || link.url}</h3>
            <p class="description">${link.description || 'Nenhuma descrição.'}</p>
            <p class="tags">${link.tags.map(tag => `<span>#${tag}</span>`).join(' ')}</p>
            <a href="${link.url}" target="_blank" class="url-link" onclick="event.stopPropagation();">Abrir Link</a>
            
            <div class="card-actions">
                <button class="btn-edit" data-id="${link.id}">✏️ Editar</button>
                <button class="btn-delete" data-id="${link.id}">🗑️ Excluir</button>
            </div>
        </div>
    `;

    // ADICIONA EVENTO DE CLIQUE PARA ABRIR O PREVIEW
    card.addEventListener('click', () => {
        openPreview(link.url); 
    });

    // 1. EVENTO DE EXCLUSÃO
    const deleteBtn = card.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Impede que o clique no botão abra o preview
        if (confirm(`Tem certeza que deseja excluir o link: ${link.title || link.url}?`)) {
            handleDeleteLink(link.id);
        }
    });

    // 2. EVENTO DE EDIÇÃO
    const editBtn = card.querySelector('.btn-edit');
    editBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Impede que o clique no botão abra o preview
        // Busca o link na coleção atual ou na busca para garantir os dados mais recentes
        const linksInView = searchInput.value ? searchLinks(searchInput.value) : getLinksByCollection(currentCollectionId);
        const linkData = linksInView.find(l => l.id === link.id);
        if (linkData) {
            handleEditLink(linkData);
        }
    });

    return card;
}

/**
 * Renderiza os links no grid. (NOVA FUNÇÃO AUXILIAR)
 * @param {Array} links - Lista de links a serem exibidos.
 * @param {string} message - Mensagem a ser exibida se a lista estiver vazia.
 */
function renderLinksGrid(links, message = 'Nenhum link encontrado.') {
    linkGridElement.innerHTML = '';

    if (links.length === 0) {
        linkGridElement.innerHTML = `<p class="empty-message">${message}</p>`;
        return;
    }

    links.forEach(link => {
        const card = createLinkCard(link);
        linkGridElement.appendChild(card);
    });
}

/**
 * 📂 Renderiza a lista de Coleções na Barra Lateral.
 */
function renderSidebar(collections) {
    sidebarElement.innerHTML = ''; 

    const ul = document.createElement('ul');
    ul.className = 'collection-list';

    collections.forEach(col => {
        const li = document.createElement('li');
        li.textContent = col.name;
        li.setAttribute('data-collection-id', col.id);
        li.className = (col.id === currentCollectionId) ? 'active' : '';
        
        li.addEventListener('click', () => {
            currentCollectionId = col.id;
            
            // 1. Limpa a busca ao mudar de coleção
            searchInput.value = '';

            // 2. Atualiza o estado visual
            document.querySelectorAll('.collection-list li').forEach(item => {
                item.classList.remove('active');
            });
            li.classList.add('active');
            
            loadLinks(col.id);
        });

        ul.appendChild(li);
    });

    sidebarElement.appendChild(ul);
}

/**
 * 🔗 Carrega e renderiza os links para a Coleção atual.
 */
function loadLinks(collectionId) {
    linkGridElement.innerHTML = '<h2>Carregando...</h2>';
    
    const links = getLinksByCollection(collectionId); 

    renderLinksGrid(links, 'Nenhum link encontrado nesta coleção.');
}

/**
 * 🔎 Lida com a busca de links em tempo real. (NOVA FUNÇÃO)
 */
function handleSearch() {
    const query = searchInput.value;
    
    // 1. Desmarca a coleção ativa visualmente
    document.querySelectorAll('.collection-list li').forEach(item => {
        item.classList.remove('active');
    });

    if (query.length > 0) {
        // 2. Busca todos os links que correspondem à query
        const results = searchLinks(query);
        // 3. Renderiza os resultados
        renderLinksGrid(results, `Nenhum resultado encontrado para "${query}".`);
        
    } else {
        // 4. Se a busca estiver limpa, volta para a coleção ativa
        const links = getLinksByCollection(currentCollectionId);
        renderLinksGrid(links, 'Nenhum link encontrado nesta coleção.');
        
        // 5. Re-ativa a coleção visualmente
        const activeCollectionElement = document.querySelector(`[data-collection-id="${currentCollectionId}"]`);
        if (activeCollectionElement) {
            activeCollectionElement.classList.add('active');
        }
    }
}


// ===================================================
// AÇÕES DO USUÁRIO
// ===================================================

/**
 * 💾 Lida com o envio do formulário para salvar um novo link. 
 */
async function handleLinkFormSubmit(event) { 
    event.preventDefault(); 

    const url = document.getElementById('link-url').value;
    const title = document.getElementById('link-title').value;
    const description = document.getElementById('link-description').value;
    const tagsInput = document.getElementById('link-tags').value;
    const collectionId = document.getElementById('link-collection').value;

    if (!url) {
        alert('A URL é obrigatória!');
        return;
    }
    
    linkFormElement.style.pointerEvents = 'none'; 
    linkFormElement.querySelector('button[type="submit"]').textContent = 'Salvando e Capturando Preview...';

    const tagsArray = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

    const newLinkData = {
        url,
        title,
        description,
        tags: tagsArray,
        collection_id: collectionId 
    };

    await createLink(newLinkData);

    // Após criação, verifica se está em modo busca ou coleção
    if (searchInput.value.length > 0) {
        handleSearch();
    } else {
        loadLinks(currentCollectionId);
    }
    
    linkFormElement.reset();
    linkFormElement.style.pointerEvents = 'auto';
    linkFormElement.querySelector('button[type="submit"]').textContent = 'Salvar Link';
    linkFormElement.style.display = 'none';
}

/**
 * 🗑️ Lida com a exclusão de um link. 
 */
function handleDeleteLink(linkId) {
    if (deleteLink(linkId)) {
        alert("Link excluído com sucesso!");
        
        if (searchInput.value.length > 0) {
            handleSearch(); // Atualiza a busca
        } else {
            loadLinks(currentCollectionId); // Recarrega a coleção
        }

    } else {
        alert("Falha ao excluir o link.");
    }
}

/**
 * ✏️ Lida com a edição de um link. Abre o formulário pré-preenchido. 
 */
function handleEditLink(link) {
    // 1. Exibir e configurar o formulário para edição
    const collections = getAllCollections();
    const select = document.getElementById('link-collection');
    
    // Preenche as opções de coleção
    select.innerHTML = collections.map(col => 
        `<option value="${col.id}" ${col.id === link.collection_id ? 'selected' : ''}>${col.name}</option>`
    ).join('');

    // Preenche os campos do formulário
    document.getElementById('link-url').value = link.url;
    document.getElementById('link-title').value = link.title;
    document.getElementById('link-description').value = link.description;
    document.getElementById('link-tags').value = link.tags.join(', ');
    
    // Altera o botão de "Salvar" para "Atualizar"
    const submitBtn = linkFormElement.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Atualizar Link';

    // 2. Cria um listener temporário para a atualização
    
    // Remove o listener de criação existente
    linkFormElement.removeEventListener('submit', handleLinkFormSubmit);
    
    // Define a nova função de submit para atualização
    const handleUpdate = (event) => {
        event.preventDefault();
        
        const updatedData = {
            url: document.getElementById('link-url').value,
            title: document.getElementById('link-title').value,
            description: document.getElementById('link-description').value,
            tags: document.getElementById('link-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
            collection_id: document.getElementById('link-collection').value
        };

        if (updateLink(link.id, updatedData)) {
            alert("Link atualizado com sucesso!");
        } else {
            alert("Falha ao atualizar o link.");
        }
        
        // 3. Limpa e reverte o formulário para o modo de criação
        linkFormElement.reset();
        linkFormElement.style.display = 'none';
        submitBtn.textContent = 'Salvar Link';
        
        // Remove este listener temporário
        linkFormElement.removeEventListener('submit', handleUpdate);
        // Adiciona de volta o listener original de criação
        linkFormElement.addEventListener('submit', handleLinkFormSubmit);

        // Atualiza a tela após a edição
        if (searchInput.value.length > 0) {
            handleSearch();
        } else {
            loadLinks(currentCollectionId); 
        }
    };
    
    // Armazena a referência para poder remover depois
    linkFormElement._currentUpdateListener = handleUpdate; 
    
    // Adiciona o novo listener
    linkFormElement.addEventListener('submit', handleUpdate);
    
    // Exibe o formulário
    linkFormElement.style.display = 'block';
}


// ===================================================
// INICIALIZAÇÃO
// ===================================================

/**
 * 🚀 Função principal para iniciar o aplicativo.
 */
function initApp() {
    // 1. Carrega e renderiza todas as coleções na barra lateral
    const collections = getAllCollections();
    renderSidebar(collections);
    
    // 2. Carrega os links da coleção inicial (Inbox)
    loadLinks(currentCollectionId);

    // 3. Configura o formulário de adição (simples)
    linkFormElement.addEventListener('submit', handleLinkFormSubmit);
    addLinkButton.addEventListener('click', () => {
        // Assegura que o formulário está no modo 'Criação'
        linkFormElement.querySelector('button[type="submit"]').textContent = 'Salvar Link';
        if (linkFormElement._currentUpdateListener) {
            linkFormElement.removeEventListener('submit', linkFormElement._currentUpdateListener); 
        }
        linkFormElement.addEventListener('submit', handleLinkFormSubmit);

        // Exibe o formulário e preenche as opções de coleção
        linkFormElement.style.display = 'block';
        const select = document.getElementById('link-collection');
        const collections = getAllCollections(); 
        select.innerHTML = collections.map(col => 
            `<option value="${col.id}" ${col.id === currentCollectionId ? 'selected' : ''}>${col.name}</option>`
        ).join('');
        linkFormElement.reset(); // Limpa os campos para nova criação
    });
    
    // 4. Configura o evento de busca (NOVO)
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch); 
    }
}

// Inicia tudo quando o script é carregado
initApp();
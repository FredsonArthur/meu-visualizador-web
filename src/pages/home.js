// NOVO: Importa apenas o createLinkCard
const { createLinkCard } = require('../components/LinkCard');

// Importa APENAS as rotas da API que home.js precisa diretamente:
// - GetCollections e GetLinks para carregar a página/sidebar
// - CreateLink e UpdateLink para o formulário de adição/edição
// - SearchLinks para a busca
const { 
    apiGetCollections, 
    apiGetLinks, 
    apiCreateLink,
    apiUpdateLink, 
    apiSearchLinks,
    // Rotas de exclusão/toggle foram movidas para LinkCard.js
} = require('../../server/api/api'); 

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
    
    // 3. Adiciona ao conteúdo e exibe o modal
    previewContent.appendChild(iframe);
    previewModal.style.display = 'flex';
}

// Configura o botão de fechar
closePreviewBtn.addEventListener('click', () => {
    previewModal.style.display = 'none';
});


// ===================================================
// FUNÇÕES DE RENDERIZAÇÃO
// ===================================================


/**
 * 🔄 Carrega links da coleção atual e renderiza o grid.
 * @param {string} [collectionId=currentCollectionId] - ID da coleção a carregar.
 */
async function loadLinks(collectionId = currentCollectionId) {
    currentCollectionId = collectionId;
    // FEEDBACK DE CARREGAMENTO: MOSTRA SPINNER NO GRID
    linkGridElement.innerHTML = '<p class="loading-message">Carregando links... 🔄</p>'; 

    try {
        const response = await apiGetLinks(collectionId);
        if (!response.ok) throw new Error('Falha ao carregar links');
        
        const links = await response.json(); 

        linkGridElement.innerHTML = ''; 
        
        if (links.length === 0) {
            linkGridElement.innerHTML = `<p class="empty-message">Nenhum link nesta coleção.</p>`;
        } else {
            const fragment = document.createDocumentFragment();
            links.forEach(link => {
                // USA A FUNÇÃO DO NOVO COMPONENTE, PASSANDO OS CALLBACKS
                fragment.appendChild(
                    createLinkCard(
                        link, 
                        // Callback para recarregar a lista
                        () => loadLinks(currentCollectionId), 
                        // Callback para abrir o preview
                        openPreview,                       
                        // Callback para iniciar a edição (função local)
                        handleEditLink                     
                    )
                );
            });
            linkGridElement.appendChild(fragment);
        }

    } catch (error) {
        linkGridElement.innerHTML = `<p class="error-message">❌ Erro ao buscar links: ${error.message}</p>`;
    }


    // Atualiza o estado visual da sidebar
    document.querySelectorAll('.collection-list li').forEach(li => {
        li.classList.remove('active');
        if (li.getAttribute('data-id') === collectionId) {
            li.classList.add('active');
        }
    });
}

/**
 * ⚙️ Renderiza a barra lateral com todas as coleções.
 */
async function renderSidebar() {
    // FEEDBACK DE CARREGAMENTO: MOSTRA MENSAGEM NA SIDEBAR
    sidebarElement.innerHTML = '<p class="loading-message">Carregando coleções... 🔄</p>';
    let collections = [];

    try {
        const response = await apiGetCollections();
        if (!response.ok) throw new Error('Falha ao carregar coleções');
        
        collections = await response.json(); 
    } catch (error) {
        sidebarElement.innerHTML = '<p class="error-message">❌ Erro ao carregar coleções.</p>';
        return;
    }

    const list = document.createElement('ul');
    list.className = 'collection-list';

    // 1. Adiciona a opção "Todos os Links"
    list.innerHTML += `<li data-id="all" class="active">📚 Todos os Links</li>`;

    // 2. Adiciona as coleções dinâmicas
    collections.forEach(col => {
        list.innerHTML += `<li data-id="${col.id}">📁 ${col.name}</li>`;
    });

    sidebarElement.innerHTML = '';
    sidebarElement.appendChild(list);

    // 3. Adiciona event listeners para filtragem
    list.querySelectorAll('li').forEach(li => {
        li.addEventListener('click', (e) => {
            const collectionId = e.target.getAttribute('data-id');
            loadLinks(collectionId);
        });
    });
}

// ===================================================
// HANDLERS DE AÇÃO
// ===================================================

// ** Handlers de Card (Delete, Toggle Read) foram movidos para LinkCard.js **


/**
 * ✍️ Lida com a edição de um link (Callback chamado por LinkCard.js).
 * @param {string} linkId - ID do link a ser editado.
 */
async function handleEditLink(linkId) {
    // 1. Busca os dados do link.
    const allLinksResponse = await apiGetLinks('all'); 
    if (!allLinksResponse.ok) return;

    const allLinks = await allLinksResponse.json();
    const linkToEdit = allLinks.find(l => l.id === linkId);

    if (!linkToEdit) return;

    // 2. Preenche o formulário com os dados do link
    document.getElementById('link-url').value = linkToEdit.url;
    document.getElementById('link-title').value = linkToEdit.title;
    document.getElementById('link-description').value = linkToEdit.description;
    document.getElementById('link-tags').value = linkToEdit.tags.join(', ');
    
    // Seleciona a coleção correta no dropdown (Busca coleções de forma assíncrona)
    const collectionsResponse = await apiGetCollections();
    const collections = collectionsResponse.ok ? await collectionsResponse.json() : [];
    
    const select = document.getElementById('link-collection');
    select.innerHTML = collections.map(col => 
        `<option value="${col.id}" ${col.id === linkToEdit.collection_id ? 'selected' : ''}>${col.name}</option>`
    ).join('');

    // 3. Modifica o botão e exibe o formulário
    const submitButton = linkFormElement.querySelector('button[type="submit"]');
    submitButton.textContent = 'Atualizar Link';
    linkFormElement.style.display = 'block';

    // 4. Configura o handler de atualização
    linkFormElement.removeEventListener('submit', handleLinkFormSubmit); 
    
    if (linkFormElement._currentUpdateListener) {
        linkFormElement.removeEventListener('submit', linkFormElement._currentUpdateListener); 
    }

    const handleUpdate = async (e) => {
        e.preventDefault();

        // FEEDBACK DE CARREGAMENTO PARA ATUALIZAÇÃO
        submitButton.textContent = 'Atualizando... ✏️';
        linkFormElement.style.pointerEvents = 'none';

        const url = document.getElementById('link-url').value;
        const title = document.getElementById('link-title').value;
        const description = document.getElementById('link-description').value;
        const tags = document.getElementById('link-tags').value;
        const collectionId = document.getElementById('link-collection').value;

        const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

        const updatedData = {
            url: url,
            title: title,
            description: description,
            tags: tagsArray,
            collection_id: collectionId 
        };

        try {
            const response = await apiUpdateLink(linkId, updatedData);
            if (!response.ok) throw new Error('Falha na atualização');

            loadLinks(currentCollectionId);
        } catch (error) {
            alert(`Erro ao atualizar: ${error.message}`);
        }
        
        // 5. Reseta o formulário e o esconde
        linkFormElement.reset();
        linkFormElement.style.pointerEvents = 'auto';
        submitButton.textContent = 'Salvar Link';
        linkFormElement.style.display = 'none';

        // Opcional: Re-anexa o handler de criação
        linkFormElement.addEventListener('submit', handleLinkFormSubmit);
        linkFormElement.removeEventListener('submit', handleUpdate);
        linkFormElement._currentUpdateListener = null;
    };

    linkFormElement.addEventListener('submit', handleUpdate);
    linkFormElement._currentUpdateListener = handleUpdate; 
}


/**
 * 💾 Lida com o envio do formulário de criação de link.
 */
async function handleLinkFormSubmit(e) {
    e.preventDefault();

    // FEEDBACK DE CARREGAMENTO PARA CRIAÇÃO
    const submitButton = linkFormElement.querySelector('button[type="submit"]');
    submitButton.textContent = 'Salvando... 🤖';
    linkFormElement.style.pointerEvents = 'none';

    const url = document.getElementById('link-url').value;
    const title = document.getElementById('link-title').value;
    const description = document.getElementById('link-description').value;
    const tags = document.getElementById('link-tags').value;
    const collectionId = document.getElementById('link-collection').value;

    const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    const newLinkData = {
        url: url,
        title: title,
        description: description,
        tags: tagsArray,
        collection_id: collectionId 
    };

    try {
        const response = await apiCreateLink(newLinkData);
        if (!response.ok) throw new Error('Falha na criação do link');
        
        // 2. Atualiza a tela
        loadLinks(currentCollectionId);
    } catch (error) {
        alert(`Erro ao criar link: ${error.message}`);
    }
    
    // 3. Reseta o formulário, o reabilita e o esconde
    linkFormElement.reset();
    linkFormElement.style.pointerEvents = 'auto';
    submitButton.textContent = 'Salvar Link';
    linkFormElement.style.display = 'none';
}


/**
 * 🔎 Lida com a busca de links.
 */
async function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    
    if (query.length > 0) {
        // FEEDBACK DE CARREGAMENTO PARA BUSCA
        linkGridElement.innerHTML = '<p class="loading-message">Buscando... 🔎</p>';

        try {
            const response = await apiSearchLinks(query);
            if (!response.ok) throw new Error('Falha na busca');
            
            const results = await response.json();

            linkGridElement.innerHTML = '';
            
            if (results.length === 0) {
                linkGridElement.innerHTML = `<p class="empty-message">Nenhum resultado encontrado para "${query}".</p>`;
            } else {
                results.forEach(link => {
                    // USA O COMPONENTE LinkCard.js para renderizar resultados da busca
                    linkGridElement.appendChild(
                        createLinkCard(
                            link,
                            () => loadLinks(currentCollectionId),
                            openPreview,
                            handleEditLink
                        )
                    );
                });
            }
        } catch (error) {
            linkGridElement.innerHTML = `<p class="error-message">❌ Erro na busca: ${error.message}</p>`;
        }
        
        // Remove a seleção de coleção da sidebar durante a busca
        document.querySelectorAll('.collection-list li').forEach(li => {
            li.classList.remove('active');
        });
    } else {
        // Se a busca estiver vazia, carrega a coleção atual
        loadLinks(currentCollectionId);
    }
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

        // Preenche as opções de coleção (Busca coleções de forma assíncrona)
        const select = document.getElementById('link-collection');
        const collectionsResponse = await apiGetCollections();
        const collections = collectionsResponse.ok ? await collectionsResponse.json() : [];

        select.innerHTML = collections.map(col => 
            `<option value="${col.id}" ${col.id === currentCollectionId ? 'selected' : ''}>${col.name}</option>`
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
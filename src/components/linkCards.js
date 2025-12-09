// Arquivo: src/components/LinkCard.js

// Importa a função fetchApi exportada de home.js. 
// Isso funciona porque home.js exportou: module.exports.fetchApi = fetchApi;
const { fetchApi } = require('../pages/home'); 

// ----------------------------------------------------
// HANDLERS DE AÇÃO (Migrados para Fetch Real)
// ----------------------------------------------------

/**
 * 🔄 Lida com a alternância do status de leitura.
 * @param {Event} e - Evento de clique.
 * @param {Function} loadLinks - Função para recarregar o grid principal.
 */
async function handleToggleReadStatus(e, loadLinks) {
    e.stopPropagation(); 
    const button = e.currentTarget;
    const linkId = button.getAttribute('data-id');

    // 1. Feedback visual
    const originalIcon = button.textContent;
    button.textContent = '⌛';
    button.disabled = true;

    try {
        // CHAMADA DE API REAL: PUT /api/links/:linkId/read
        const response = await fetchApi(`/links/${linkId}/read`, 'PUT');
        
        if (!response.ok) throw new Error('Falha ao alternar status: ' + response.status);
        
        // 2. Sucesso: Recarrega a lista para refletir a mudança
        // Isso é mais seguro se houver classes CSS dependendo do status.
        loadLinks();

    } catch (error) {
        alert(`Erro ao alterar status: ${error.message}`);
        // 3. Erro: Reverte o feedback
        button.textContent = originalIcon;
    } finally {
        button.disabled = false;
    }
}

/**
 * 🗑️ Lida com a exclusão de um link.
 * @param {Event} e - Evento de clique.
 * @param {Function} loadLinks - Função para recarregar o grid principal.
 */
async function handleDeleteLink(e, loadLinks) {
    e.stopPropagation();
    const button = e.currentTarget;
    const linkId = button.getAttribute('data-id');

    if (!confirm('Tem certeza de que deseja excluir este link permanentemente?')) return;

    // 1. Feedback visual
    const originalIcon = button.textContent;
    button.textContent = '...';
    button.disabled = true;

    try {
        // CHAMADA DE API REAL: DELETE /api/links/:linkId
        const response = await fetchApi(`/links/${linkId}`, 'DELETE');

        if (response.status === 204) { // 204 No Content
            // 2. Sucesso: Remove o card do DOM e recarrega a lista
            button.closest('.link-card').remove();
            loadLinks(); 
        } else {
            throw new Error('Falha na exclusão: ' + response.status);
        }
    } catch (error) {
        alert(`Erro ao excluir link: ${error.message}`);
        // 3. Erro: Reverte o feedback
        button.textContent = originalIcon;
    } finally {
        button.disabled = false;
    }
}

/**
 * ✏️ Placeholder para a função de edição (chama um callback do home.js).
 */
function handleEditLink(e, editLinkCallback) {
    e.stopPropagation();
    const linkId = e.currentTarget.getAttribute('data-id');
    // O callback deve ser implementado no home.js para preencher o formulário
    editLinkCallback(linkId); 
}


// ----------------------------------------------------
// COMPONENTE PRINCIPAL
// ----------------------------------------------------

/**
 * 🎨 Cria e retorna o elemento DOM (Card) para um Link.
 * @param {Object} link - Objeto LinkItem.
 * @param {function} loadLinks - Função para recarregar a lista de links após uma ação.
 * @param {function} openPreview - Função para abrir o modal de pré-visualização.
 * @param {function} editLinkCallback - Callback para iniciar a edição do link (vazio por padrão se não for passado).
 * @returns {HTMLElement} O elemento <div> do card.
 */
function createLinkCard(link, loadLinks, openPreview, editLinkCallback = () => {}) {
    const card = document.createElement('div');
    card.className = `link-card ${link.is_read ? 'read' : 'unread'}`; 
    card.setAttribute('data-link-id', link.id);

    // Estrutura do Card com base no snippet anterior
    card.innerHTML = `
        <div class="card-preview">
            <img src="${link.preview_image_url || 'https://via.placeholder.com/400x300?text=Preview+Indisponível'}" 
                 alt="Preview do site"
                 onerror="this.onerror=null;this.src='https://via.placeholder.com/400x300?text=Preview+Indisponível';">
        </div>
        <div class="card-content">
            <h3 class="card-title" title="${link.title || link.url}">${link.title || 'Sem Título Capturado'}</h3>
            <p class="card-description">${link.description || 'Nenhuma descrição.'}</p>
            <p class="tags">${link.tags.map(tag => `<span class="tag">#${tag}</span>`).join(' ')}</p>
            <a href="${link.url}" target="_blank" class="url-link" onclick="event.stopPropagation();">Abrir Link</a>
            
            <div class="card-actions">
                <button class="btn-toggle-read btn-action-icon" data-id="${link.id}" title="${link.is_read ? 'Marcar como Não Lido' : 'Marcar como Lido'}">
                    ${link.is_read ? '📖' : '⚪'}
                </button>
                <button class="btn-edit btn-action-icon" data-id="${link.id}" title="Editar">✏️</button>
                <button class="btn-delete btn-action-icon" data-id="${link.id}" title="Excluir">🗑️</button>
            </div>
        </div>
    `;

    // Adiciona evento para abrir o preview ao clicar no card
    card.addEventListener('click', () => {
        openPreview(link.url);
    });
    
    // Adiciona eventos de ação
    card.querySelector('.btn-toggle-read').addEventListener('click', (e) => handleToggleReadStatus(e, loadLinks));
    card.querySelector('.btn-edit').addEventListener('click', (e) => handleEditLink(e, editLinkCallback));
    card.querySelector('.btn-delete').addEventListener('click', (e) => handleDeleteLink(e, loadLinks));

    return card;
}

module.exports = {
    createLinkCard,
};
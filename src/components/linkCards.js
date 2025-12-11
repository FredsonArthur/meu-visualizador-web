// Arquivo: src/components/LinkCard.js

// 🎯 CORREÇÃO CRÍTICA: Trocar 'require' por 'import' e adicionar '.js' no caminho
// Importa as funções e variáveis necessárias de home.js (que agora as exporta)
import { 
    fetchApi, 
    loadLinks, 
    openPreview, 
    currentCollectionId,
    handleEditLink // <-- Importamos a função de callback para abrir o formulário de edição
} from '../pages/home.js'; 


// ----------------------------------------------------
// HANDLERS DE AÇÃO (Migrados para Fetch Real)
// ----------------------------------------------------

/**
 * 🔄 Lida com a alternância do status de leitura.
 */
async function handleToggleReadStatus(e) {
    e.stopPropagation(); 
    const button = e.currentTarget;
    const linkId = button.getAttribute('data-id');

    // 1. Feedback visual
    const originalIcon = button.textContent;
    button.textContent = '⌛';
    button.disabled = true;

    try {
        // CHAMADA DE API REAL: PUT /api/links/toggle-read/:linkId
        const response = await fetchApi(`/links/toggle-read/${linkId}`, 'PUT');
        
        if (!response.ok) throw new Error('Falha ao alternar status: ' + response.status);
        
        // 2. Sucesso: Recarrega a lista
        // Usa a currentCollectionId importada para recarregar o grid correto
        loadLinks(currentCollectionId); 

    } catch (error) {
        console.error("Erro ao alterar status:", error);
        alert(`Erro ao alterar status: ${error.message}`);
        // 3. Erro: Reverte o feedback
        button.textContent = originalIcon;
    } finally {
        button.disabled = false;
    }
}


/**
 * 🗑️ Lida com a exclusão de um link.
 */
async function handleDeleteLink(e) {
    e.stopPropagation();
    const button = e.currentTarget;
    const linkId = button.getAttribute('data-id');

    if (!confirm("Tem certeza de que deseja excluir este link?")) {
        return;
    }
    
    // 1. Feedback visual
    const originalIcon = button.textContent;
    button.textContent = '🗑️...';
    button.disabled = true;

    try {
        // CHAMADA DE API REAL: DELETE /api/links/:linkId
        const response = await fetchApi(`/links/${linkId}`, 'DELETE');
        
        if (response.status !== 204) throw new Error('Falha ao excluir link: ' + response.status);

        // 2. Sucesso: Recarrega a lista
        loadLinks(currentCollectionId);
        
        alert('Link excluído com sucesso!');

    } catch (error) {
        console.error("Erro ao excluir link:", error);
        alert(`Erro ao excluir link: ${error.message}`);
    } finally {
        button.textContent = originalIcon;
        button.disabled = false;
    }
}


// ----------------------------------------------------
// CRIAÇÃO DO COMPONENTE
// ----------------------------------------------------

/**
 * 🎨 Cria o elemento DOM para um Link Card.
 * @param {Object} link - Os dados do link.
 * @param {Function} editLinkCallback - A função de callback de edição (que vem de home.js).
 * @returns {HTMLElement} O elemento <div> do Card.
 */
// 🎯 CORREÇÃO CRÍTICA: Trocar 'module.exports' por 'export function'
export function createLinkCard(link, editLinkCallback) {
    const card = document.createElement('div');
    card.className = `link-card ${link.is_read ? 'read' : 'unread'}`;
    
    // Cria a cor da borda baseada no ID da coleção
    const collectionColor = `var(--collection-color-${link.collection_id})`;
    card.style.borderLeftColor = collectionColor;

    card.innerHTML = `
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

    // Adiciona evento para abrir o preview ao clicar no card (fora dos botões)
    card.addEventListener('click', () => {
        openPreview(link.url);
    });
    
    // Adiciona eventos de ação
    card.querySelector('.btn-toggle-read').addEventListener('click', handleToggleReadStatus);
    
    // O botão de Edição chama a função de callback passada por home.js
    // A função importada handleEditLink (que está em home.js) é passada aqui como editLinkCallback
    card.querySelector('.btn-edit').addEventListener('click', (e) => editLinkCallback(e, link)); 
    
    card.querySelector('.btn-delete').addEventListener('click', handleDeleteLink);

    return card;
}
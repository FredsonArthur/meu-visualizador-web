// Importa todas as rotas da API (Mock Fetch API)
const { 
    apiDeleteLink, 
    apiUpdateLink,
    apiToggleReadStatus 
} = require('../../api/api'); // Suba um nível do 'components' para 'src' e vá para 'api'


/**
 * 🔄 Lida com a alternância do status de leitura.
 * @param {Event} e - Evento de clique.
 * @param {Function} loadLinks - Função para recarregar o grid principal.
 */
async function handleToggleReadStatus(e, loadLinks) {
    e.stopPropagation(); 
    const button = e.currentTarget;
    const linkId = button.getAttribute('data-id');

    // 1. Feedback visual rápido no botão
    const originalIcon = button.textContent;
    button.textContent = '⌛'; // Estado de carregamento
    button.disabled = true;

    try {
        const response = await apiToggleReadStatus(linkId);
        if (!response.ok) throw new Error('Falha ao alternar status');
        
        // 2. Sucesso: Recarrega a lista para mostrar o novo estado/classe
        loadLinks();

    } catch (error) {
        alert(`Erro ao alterar status: ${error.message}`);
        // 3. Erro: Reverte o feedback
        button.textContent = originalIcon;
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
    const linkId = e.currentTarget.getAttribute('data-id');

    if (confirm("Tem certeza que deseja excluir este link?")) {
        // FEEDBACK DE CARREGAMENTO: Escurece o card
        const card = e.currentTarget.closest('.link-card');
        card.style.opacity = 0.5;
        card.style.pointerEvents = 'none';

        try {
            const response = await apiDeleteLink(linkId);
            if (!response.ok) throw new Error('Falha na exclusão');

            // Recarrega a lista
            loadLinks();

        } catch (error) {
            alert(`Erro ao excluir link: ${error.message}`);
            // Reverte em caso de erro
            card.style.opacity = 1; 
            card.style.pointerEvents = 'auto';
        }
    }
}

/**
 * ✏️ Lida com a edição de um link.
 * @param {Event} e - Evento de clique.
 * @param {Function} editLinkCallback - Callback para abrir o formulário de edição em home.js.
 */
async function handleEditLink(e, editLinkCallback) {
    e.stopPropagation(); 
    const linkId = e.currentTarget.getAttribute('data-id');
    
    // Chama o callback fornecido por home.js para iniciar a edição
    // A lógica de preenchimento do formulário fica em home.js
    editLinkCallback(linkId);
}


/**
 * 🎨 Cria e retorna o elemento HTML para um Card de Link. (FUNÇÃO PRINCIPAL)
 * @param {Object} link - Objeto LinkItem.
 * @param {Function} loadLinks - Função de callback para recarregar o grid.
 * @param {Function} openPreview - Função de callback para abrir o modal de preview.
 * @param {Function} editLinkCallback - Função de callback para abrir o form de edição.
 */
function createLinkCard(link, loadLinks, openPreview, editLinkCallback) {
    const card = document.createElement('div');
    card.className = `link-card ${link.is_read ? 'link-read' : ''}`; 
    card.setAttribute('data-link-id', link.id);

    // Determina o HTML do preview
    const previewHtml = link.preview_image_url ? 
        `<img src="${link.preview_image_url}" alt="Pré-visualização do site">` : 
        `<div class="static-preview-text">Visualização Indisponível</div>`;

    // Estrutura básica do card
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
                <button class="btn-toggle-read btn-action-icon" data-id="${link.id}" title="${link.is_read ? 'Marcar como Não Lido' : 'Marcar como Lido'}">
                    ${link.is_read ? '📖' : '⚪'}
                </button>
                <button class="btn-edit btn-action-icon" data-id="${link.id}" title="Editar">✏️</button>
                <button class="btn-delete btn-action-icon" data-id="${link.id}" title="Excluir">🗑️</button>
            </div>
        </div>
    `;

    // Adiciona evento para abrir o preview ao clicar no card (usando callback)
    card.addEventListener('click', () => {
        openPreview(link.url);
    });
    
    // Adiciona eventos de ação usando os handlers locais, passando loadLinks e o callback de edição
    card.querySelector('.btn-toggle-read').addEventListener('click', (e) => handleToggleReadStatus(e, loadLinks));
    card.querySelector('.btn-edit').addEventListener('click', (e) => handleEditLink(e, editLinkCallback));
    card.querySelector('.btn-delete').addEventListener('click', (e) => handleDeleteLink(e, loadLinks));

    return card;
}

// Exportamos apenas a função de criação do card
module.exports = {
    createLinkCard
};
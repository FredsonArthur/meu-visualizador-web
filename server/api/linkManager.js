const fs = require('fs');
const path = require('path');
const { captureScreenshot, getMetadata } = require('./scraper');


// CORREÇÃO CRÍTICA DO CAMINHO:
// '__dirname' (que é /server/api) + '..' (sobe para /server) + 'db' + 'dataStore.json'
const DATA_PATH = path.join(__dirname, '..', 'db', 'dataStore.json'); 

// ===================================================
// UTILITÁRIOS DE DADOS
// ===================================================

/**
 * Função utilitária para ler o arquivo de dados
 */
function readData() {
    try {
        const data = fs.readFileSync(DATA_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Log claro para debugar o problema de leitura/escrita
        console.error("Erro ao ler dataStore.json (Verifique o caminho ou a sintaxe JSON):", error.message);
        // Retorna uma estrutura vazia se houver erro de leitura
        return { collections: [], links: [] };
    }
}

/**
 * Função utilitária para salvar o arquivo de dados
 */
function writeData(data) {
    try {
        fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error("Erro ao escrever em dataStore.json:", error.message);
    }
}

// ===================================================
// Ações da API
// ===================================================

/**
 * Busca todas as coleções.
 */
function getAllCollections() {
    const data = readData();
    return data.collections;
}

/**
 * Busca os links pertencentes a uma coleção específica.
 */
function getLinksByCollection(collectionId) {
    const data = readData();
    if (collectionId === 'all') {
        return data.links;
    }
    return data.links.filter(link => link.collection_id === collectionId);
}

/**
 * 💾 Cria um novo link e o salva na coleção.
 * @param {Object} linkData - Os dados do novo link (url, collection_id, tags).
 * @returns {Object} O novo objeto LinkItem.
 */
async function createLink(linkData) { 
    const data = readData();
    const newLinkId = `lk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    
    // 1. CHAMA O SCRAPER PARA CAPTURAR SCREENSHOT
    const previewUrl = await captureScreenshot(linkData.url, newLinkId);
    
    // 2. CHAMA O SCRAPER PARA OBTER TÍTULO/DESCRIÇÃO
    const metadata = await getMetadata(linkData.url); 

    const newLink = {
        id: newLinkId, 
        date_saved: new Date().toISOString(),
        url: linkData.url, 
        collection_id: linkData.collectionId,
        tags: linkData.tags || [],
        is_read: false,
        
        // Usa metadados do scraper. Se o scraper falhar, usa a URL.
        title: metadata.title || linkData.url, 
        description: metadata.description || 'Nenhuma descrição fornecida pelo scraper.', 
        
        preview_image_url: previewUrl
    };
    
    data.links.unshift(newLink); 
    writeData(data); 
    return newLink;
}

/**
 * 🗑️ Exclui um link pelo ID.
 */
function deleteLink(linkId) {
    const data = readData();
    const initialLength = data.links.length;
    
    data.links = data.links.filter(link => link.id !== linkId);
    
    if (data.links.length < initialLength) {
        writeData(data);
        return true;
    }
    return false;
}

/**
 * ✏️ Atualiza as propriedades de um link existente.
 * @param {string} linkId - O ID do link a ser atualizado.
 * @param {Object} newData - Os novos dados (title, description, tags, collection_id).
 */
function updateLink(linkId, newData) {
    const data = readData();
    const index = data.links.findIndex(link => link.id === linkId);

    if (index !== -1) {
        // Aplica os novos dados sobre o link existente (preservando url, data_saved, etc.)
        data.links[index] = {
            ...data.links[index],
            ...newData,
            // Garante que tags seja um array, mesmo que não venha na requisição
            tags: newData.tags || data.links[index].tags 
        };
        writeData(data);
        return true;
    }
    return false;
}

/**
 * 🔄 Alterna o status 'is_read' de um link.
 */
function toggleLinkReadStatus(linkId) {
    const data = readData();
    const index = data.links.findIndex(link => link.id === linkId);

    if (index !== -1) {
        data.links[index].is_read = !data.links[index].is_read;
        writeData(data);
        return true;
    }
    return false;
}


/**
 * 🔎 Busca links por título, descrição ou tags.
 */
function searchLinks(query) { 
    const data = readData();
    if (!query || query.trim() === '') {
        return data.links; 
    }
    const lowerCaseQuery = query.toLowerCase().trim();

    return data.links.filter(link => {
        // 1. Busca por Título, URL e Descrição
        const contentMatch = [
            link.title,
            link.description,
            link.url
        ].some(field => field && field.toLowerCase().includes(lowerCaseQuery));

        // 2. Busca por Tags
        const tagMatch = link.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery));

        return contentMatch || tagMatch;
    });
}


// Exporta as funções
module.exports = {
    getAllCollections,
    getLinksByCollection,
    createLink,
    deleteLink,
    updateLink,
    toggleLinkReadStatus,
    searchLinks
};
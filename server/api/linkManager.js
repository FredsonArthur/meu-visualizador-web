const fs = require('fs');
const path = require('path');
const { captureScreenshot } = require('./scraper'); // IMPORTAÇÃO DA NOVA FUNÇÃO

// Define o caminho para o arquivo de dados
const DATA_PATH = path.join(__dirname, '..', 'db', 'dataStore.json');

// Função utilitária para ler o arquivo de dados
function readData() {
    try {
        const data = fs.readFileSync(DATA_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Erro ao ler dataStore.json:", error.message);
        // Retorna uma estrutura vazia se houver erro de leitura
        return { collections: [], links: [] };
    }
}

// Função utilitária para salvar o arquivo de dados
function writeData(data) {
    try {
        fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error("Erro ao escrever em dataStore.json:", error.message);
    }
}

// ===================================================
// Ações da API (simulando rotas)
// ===================================================

/**
 * Busca todas as coleções.
 * @returns {Array} Lista de objetos Collection.
 */
function getAllCollections() {
    const data = readData();
    // Retorna apenas as coleções
    return data.collections;
}

/**
 * Busca os links pertencentes a uma coleção específica.
 * @param {string} collectionId - ID da coleção a filtrar.
 * @returns {Array} Lista de objetos LinkItem.
 */
function getLinksByCollection(collectionId) {
    const data = readData();
    if (collectionId === 'all') {
        // Se for 'all', retorna todos os links
        return data.links;
    }
    // Filtra os links cujo collection_id corresponde ao ID fornecido
    return data.links.filter(link => link.collection_id === collectionId);
}

/**
 * Cria um novo link e o salva na coleção.
 * @param {Object} linkData - Os dados do novo link.
 * @returns {Object} O novo objeto LinkItem.
 */
async function createLink(linkData) { // FUNÇÃO AGORA É ASSÍNCRONA
    const data = readData();
    const newLinkId = `lk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    
    // 1. CHAMA A CAPTURA DE SCREENSHOT
    const previewUrl = await captureScreenshot(linkData.url, newLinkId);

    const newLink = {
        id: newLinkId, // ID único simples
        date_saved: new Date().toISOString(),
        ...linkData, // Espalha os dados recebidos (url, title, description, collection_id, tags...)
        is_read: false,
        preview_image_url: previewUrl // USA A URL DO SCREENSHOT
    };
    
    data.links.unshift(newLink); // Adiciona o novo link no topo da lista
    writeData(data); // Salva o arquivo
    return newLink;
}

/**
 * 🗑️ Exclui um link pelo ID.
 * @param {string} linkId - ID do link a ser excluído.
 * @returns {boolean} True se a exclusão foi bem-sucedida.
 */
function deleteLink(linkId) {
    const data = readData();
    const initialLength = data.links.length;
    
    // Filtra para manter APENAS os links cujo ID não corresponda ao linkId
    data.links = data.links.filter(link => link.id !== linkId);
    
    if (data.links.length < initialLength) {
        writeData(data);
        return true;
    }
    return false;
}

/**
 * ✏️ Atualiza as propriedades de um link existente.
 * @param {string} linkId - ID do link a ser atualizado.
 * @param {Object} newData - Objeto contendo os novos dados (title, description, tags, collection_id).
 * @returns {boolean} True se a atualização foi bem-sucedida.
 */
function updateLink(linkId, newData) {
    const data = readData();
    const index = data.links.findIndex(link => link.id === linkId);

    if (index !== -1) {
        // Aplica os novos dados sobre o link existente (mantendo o ID e data_saved originais)
        data.links[index] = {
            ...data.links[index],
            ...newData,
            // As tags devem ser um array, garantindo que o Front-end envie o formato correto
            tags: newData.tags || data.links[index].tags 
        };
        writeData(data);
        return true;
    }
    return false;
}

/**
 * 🔎 Busca links em todos os campos (título, descrição, URL, tags). (NOVA FUNÇÃO)
 * @param {string} query - O termo de busca.
 * @returns {Array} Lista de objetos LinkItem filtrados.
 */
function searchLinks(query) { 
    const data = readData();
    if (!query || query.trim() === '') {
        return data.links; // Retorna todos se a busca for vazia
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

// Exporta as funções para serem usadas no Front-end
module.exports = {
    getAllCollections,
    getLinksByCollection,
    createLink,
    deleteLink, 
    updateLink,
    searchLinks // NOVO EXPORT
};
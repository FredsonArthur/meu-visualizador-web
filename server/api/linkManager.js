const fs = require('fs');
const path = require('path');
// MUDANÇA: Importamos as duas funções do nosso scraper mock
const { captureScreenshot, getMetadata } = require('./scraper'); 

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
async function createLink(linkData) { 
    const data = readData();
    const newLinkId = `lk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    
    // 1. CHAMA A CAPTURA DE SCREENSHOT (Simulação)
    const previewUrl = await captureScreenshot(linkData.url, newLinkId);
    
    // 2. OBTÉM METADADOS (Simulação)
    const metadata = await getMetadata(linkData.url);

    const newLink = {
        id: newLinkId, // ID único simples
        date_saved: new Date().toISOString(),
        ...linkData, 
        // Sobrescreve title/description se o scraper mock retornar algo melhor e o usuário não tiver preenchido
        title: linkData.title || metadata.title,
        description: linkData.description || metadata.description, 
        is_read: false,
        preview_image_url: previewUrl // USA A URL DO SCREENSHOT
    };
    
    data.links.unshift(newLink); // Adiciona o novo link no topo da lista
    writeData(data); // Salva o arquivo
    return newLink;
}

/**
 * 🗑️ Exclui um link pelo seu ID.
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
        data.links[index] = {
            ...data.links[index],
            ...newData,
            tags: newData.tags || data.links[index].tags 
        };
        writeData(data);
        return true;
    }
    return false;
}

/**
 * 🔎 Busca links por título, descrição ou tags.
 * @param {string} query - O termo de busca.
 * @returns {Array} Lista de links correspondentes.
 */
function searchLinks(query) {
    const data = readData();
    const q = query.toLowerCase();

    return data.links.filter(link => 
        (link.title && link.title.toLowerCase().includes(q)) ||
        (link.description && link.description.toLowerCase().includes(q)) ||
        link.tags.some(tag => tag.toLowerCase().includes(q)) ||
        link.url.toLowerCase().includes(q)
    );
}

/**
 * 🔄 Alterna o status 'is_read' de um link. (NOVA FUNÇÃO)
 * @param {string} linkId - ID do link.
 * @returns {boolean} True se o status foi alterado.
 */
function toggleLinkReadStatus(linkId) {
    const data = readData();
    // Encontra o índice do link na array de links
    const index = data.links.findIndex(link => link.id === linkId);

    if (index !== -1) {
        // Alterna o valor booleano
        data.links[index].is_read = !data.links[index].is_read;
        writeData(data);
        return true;
    }
    return false;
}

// Exporta as funções para serem usadas no Front-end
module.exports = {
    getAllCollections,
    getLinksByCollection,
    createLink,
    deleteLink, 
    updateLink,
    searchLinks,
    toggleLinkReadStatus // ⬅️ NOVO: Exportamos a nova função
};
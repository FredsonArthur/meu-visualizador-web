// Simula a captura de dados externos (Web Scraper)
const fs = require('fs');
const path = require('path');

// Define o diretório onde as imagens de pré-visualização seriam salvas
const PREVIEW_DIR = path.join(__dirname, '..', '..', '..', 'public', 'previews');

// Garante que o diretório de previews existe
if (!fs.existsSync(PREVIEW_DIR)) {
    fs.mkdirSync(PREVIEW_DIR, { recursive: true });
}

// Simula um delay de rede/processamento de scraper (1s a 3s)
const simulateScraperDelay = () => {
    const delay = Math.random() * 2000 + 1000; // 1000ms a 3000ms
    return new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * 📸 Simula a captura de screenshot e obtenção de metadados de uma URL.
 * @param {string} url - A URL para fazer o scraping.
 * @param {string} linkId - O ID do link (usado para nomear o arquivo de imagem).
 * @returns {string} A URL simulada da imagem de pré-visualização salva.
 */
async function captureScreenshot(url, linkId) {
    await simulateScraperDelay();

    // Simula a URL que o Front-end usaria para acessar a imagem salva
    const mockImageUrl = `https://picsum.photos/400/300?random=${linkId}`; 
    
    return mockImageUrl;
}

/**
 * 📋 Simula a extração de Título e Descrição de uma URL.
 * @param {string} url - A URL para fazer o scraping.
 * @returns {Object} Um objeto com { title, description }.
 */
async function getMetadata(url) {
    await simulateScraperDelay();
    
    // Simula a extração de dados baseado na URL ou um mock genérico
    const title = `Título Gerado para: ${url.substring(0, 30)}...`;
    const description = "Esta é uma descrição mock gerada pelo scraper. Em produção, este texto viria da tag <meta name='description'> da página.";

    return { title, description };
}

module.exports = {
    captureScreenshot,
    getMetadata
};
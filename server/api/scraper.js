// Arquivo: server/api/scraper.js

const fs = require('fs');
const path = require('path');

// Define o diretório onde as imagens de pré-visualização seriam salvas
// (Mantido para fins de estrutura, mesmo que o mock não salve arquivos reais)
const PREVIEW_DIR = path.join(__dirname, '..', '..', 'src', 'assets', 'previews');

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
    // Simula o tempo de processamento do Puppeteer (se fosse real)
    await simulateScraperDelay();

    // Simula a URL que o Front-end usaria para acessar a imagem salva
    // Usamos um mock URL com ID para simular uma imagem única
    const mockImageUrl = `https://picsum.photos/400/300?random=${linkId}`; 
    
    console.log(`[SCRAPER MOCK] Screenshot simulado gerado para: ${url}`);
    return mockImageUrl;
}

/**
 * 📋 NOVO: Simula a extração de Título e Descrição de uma URL.
 * @param {string} url - A URL para fazer o scraping.
 * @returns {Object} Um objeto com { title, description }.
 */
async function getMetadata(url) {
    // Simula o tempo de processamento do scraping de metadados
    await simulateScraperDelay();
    
    // Lógica simples de mock para simular a extração
    if (url.includes('reactjs.org')) {
        return { 
            title: 'React – A biblioteca para interfaces de usuário (Auto-Scraped)', 
            description: 'Uma biblioteca JavaScript popular para construir interfaces de usuário modernas e escaláveis.' 
        };
    }
    
    // Dados padrão para outras URLs
    const domain = new URL(url).hostname;
    return { 
        title: `Conteúdo de ${domain} (Título Padrão Scraped)`, 
        description: 'Esta é uma descrição gerada automaticamente pelo sistema de scraping mock.' 
    };
}


module.exports = {
    captureScreenshot,
    getMetadata // EXPORTAMOS A NOVA FUNÇÃO
};
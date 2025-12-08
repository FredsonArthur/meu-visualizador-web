const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Caminho de salvamento das imagens (relativo ao diretório 'api')
const PREVIEWS_DIR = path.join(__dirname, '..', '..', 'src', 'assets', 'previews');

// Função para garantir que o diretório exista
function ensureDirectoryExistence(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Diretório de previews criado: ${dir}`);
    }
}

/**
 * 📸 Captura um screenshot de uma URL.
 * @param {string} url - A URL do site a ser capturado.
 * @param {string} linkId - O ID do link para nomear o arquivo.
 * @returns {string | null} O caminho relativo da imagem para uso no Front-end, ou null em caso de falha.
 */
async function captureScreenshot(url, linkId) {
    let browser;
    ensureDirectoryExistence(PREVIEWS_DIR);

    // O Puppeteer precisa ser instalado no projeto (npm install puppeteer)
    try {
        console.log(`Iniciando captura de screenshot para: ${url}`);
        // Configurações do navegador (headless)
        browser = await puppeteer.launch({ 
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        }); 
        
        const page = await browser.newPage();
        
        // Define a resolução da pré-visualização (tamanho comum de card)
        await page.setViewport({ width: 800, height: 600 }); 
        
        // Tenta navegar
        await page.goto(url, { 
            waitUntil: 'networkidle2', 
            timeout: 20000 // 20 segundos de timeout
        }); 

        const filename = `${linkId}.jpg`;
        const screenshotPath = path.join(PREVIEWS_DIR, filename);
        
        // Caminho relativo para o Front-end (que está em 'src')
        const relativeUrl = `/src/assets/previews/${filename}`; 

        // Tira o screenshot
        await page.screenshot({ 
            path: screenshotPath,
            type: 'jpeg',
            quality: 85
        });

        await browser.close();
        console.log(`Screenshot salvo em: ${relativeUrl}`);
        return relativeUrl;
        
    } catch (error) {
        console.error(`[SCRAPER ERROR] Falha ao capturar screenshot para ${url}:`, error.message);
        if (browser) await browser.close();
        return null; // Retorna null para indicar falha
    }
}

module.exports = { captureScreenshot };
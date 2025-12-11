// Arquivo: server.js (CORRIGIDO)

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
// Mantenha esta linha, pois './server/api/api' é o caminho correto a partir da raiz (onde server.js está).
const api = require('./server/api/api'); 

const app = express();
const PORT = 3000;

// Configuração do Middleware
// 1. Permite ao Express ler o corpo das requisições JSON (usado em POST/PUT)
app.use(bodyParser.json());

// 2. Serve os arquivos estáticos (HTML, CSS, JS)
// CORRIGIDO: A pasta 'public' está na raiz (__dirname), não precisa subir de diretório ('..').
app.use(express.static(path.join(__dirname)));

// ===================================================
// ROTAS DA API
// ===================================================

// Rotas de COLEÇÕES (Sidebar)
app.get('/api/collections', api.getAllCollections);
app.get('/api/links/:collectionId', api.getLinksByCollection); 

// Rotas de LINKS
app.post('/api/links', api.createLink);
app.delete('/api/links/:linkId', api.deleteLink);
app.put('/api/links/:linkId', api.updateLink); // Rota para edição (Fase 3)
app.put('/api/links/toggle-read/:linkId', api.toggleLinkReadStatus); // Rota para marcar lido/não lido

// Rotas de Busca
app.get('/api/search', api.searchLinks); 


// ===================================================
// INICIALIZAÇÃO
// ===================================================

app.listen(PORT, () => {
    console.log(`Servidor Express rodando em http://localhost:${PORT}`);
    // Exibe a URL para facilitar o teste no navegador
});
// Arquivo: server/server.js

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const api = require('./server/api/api'); // Caminho correto para o módulo de API

const app = express();
const PORT = 3000;

// Configuração do Middleware
// 1. Permite ao Express ler o corpo das requisições JSON
app.use(bodyParser.json());

// 2. Serve os arquivos estáticos (HTML, CSS, JS)
// 🚨 CORREÇÃO CRÍTICA: path.join(__dirname, '..') aponta para a raiz do projeto (fora da pasta 'server')
// Isso permite que o navegador acesse /index.html, /src/pages/home.js, /src/components/LinkCard.js, etc.
app.use(express.static(path.join(__dirname, )));

// ===================================================
// ROTAS DA API
// ===================================================

app.get('/api/collections', api.getAllCollections);
app.get('/api/links/:collectionId', api.getLinksByCollection); 

app.post('/api/links', api.createLink);
app.delete('/api/links/:linkId', api.deleteLink);
app.put('/api/links/:linkId', api.updateLink);
app.put('/api/links/toggle-read/:linkId', api.toggleLinkReadStatus);

app.get('/api/search', api.searchLinks); 


// ===================================================
// INICIALIZAÇÃO
// ===================================================

app.listen(PORT, () => {
    console.log(`\n🎉 Servidor rodando em http://localhost:${PORT}`);
    console.log(`Front-end: http://localhost:${PORT}/index.html\n`);
});

// Exporta o app para testes (opcional)
module.exports = app;
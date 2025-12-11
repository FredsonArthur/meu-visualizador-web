// CORREÇÃO: linkManager.js está na mesma pasta (server/api), então usamos './linkManager'
const linkManager = require('./linkManager'); 

// ===================================================
// Ações da API (Controladores)
// ===================================================

// Rota: GET /api/collections
function getAllCollections(req, res) {
    const collections = linkManager.getAllCollections();
    res.json(collections);
}

// Rota: GET /api/links/:collectionId
function getLinksByCollection(req, res) {
    const { collectionId } = req.params;
    const links = linkManager.getLinksByCollection(collectionId);
    res.json(links);
}

// Rota: POST /api/links
async function createLink(req, res) {
    // Pega os dados do corpo da requisição POST
    const { url, title, description, tags, collectionId } = req.body;
    
    // Chama a função de criação que lida com o scraping
    const newLink = await linkManager.createLink({ url, title, description, tags, collectionId });
    
    if (newLink) {
        // HTTP 201 Created
        res.status(201).json(newLink); 
    } else {
        // HTTP 400 Bad Request
        res.status(400).json({ error: "Falha ao criar link." });
    }
}

// Rota: DELETE /api/links/:linkId
function deleteLink(req, res) {
    const { linkId } = req.params;
    const success = linkManager.deleteLink(linkId);

    if (success) {
        res.status(204).send(); // HTTP 204 No Content (sucesso sem corpo)
    } else {
        res.status(404).json({ error: "Link não encontrado." });
    }
}

// Rota: PUT /api/links/:linkId (USADO NA FASE 3: EDIÇÃO)
function updateLink(req, res) {
    const { linkId } = req.params;
    const updatedData = req.body;
    
    // Chama o linkManager para atualizar os dados no dataStore.json
    const success = linkManager.updateLink(linkId, updatedData);

    if (success) {
        // HTTP 200 OK (Link atualizado)
        res.status(200).json({ message: "Link atualizado com sucesso." });
    } else {
        // HTTP 404 Not Found (Link ID não existe)
        res.status(404).json({ error: "Falha ao atualizar link. ID não encontrado." });
    }
}

// Rota: PUT /api/links/toggle-read/:linkId
function toggleLinkReadStatus(req, res) {
    const { linkId } = req.params;
    const success = linkManager.toggleLinkReadStatus(linkId);

    if (success) {
        res.status(200).json({ message: "Status alterado." });
    } else {
        res.status(404).json({ error: "Link não encontrado." });
    }
}

// Rota: GET /api/search?q=query
function searchLinks(req, res) {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: "Parâmetro 'q' é obrigatório para a busca." });
    }
    const results = linkManager.searchLinks(query);
    res.json(results);
}


module.exports = {
    getAllCollections,
    getLinksByCollection,
    createLink,
    deleteLink,
    updateLink,
    toggleLinkReadStatus,
    searchLinks
};
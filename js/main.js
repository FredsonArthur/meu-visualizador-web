// js/main.js

console.log("-----------------------------------------");
console.log("✅ main.js carregado com sucesso!");
console.log("-----------------------------------------");


document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 0. LÓGICA DE INJEÇÃO DE COMPONENTE (NAV)
    // ==========================================
    function loadNavComponent() {
        const navPlaceholder = document.getElementById('nav-placeholder');
        
        if (navPlaceholder) {
            // Ajusta o caminho de busca: '../_nav.html' se estiver em 'pages/', '_nav.html' se estiver na raiz.
            let navPath = (window.location.pathname.includes('/pages/')) ? '../_nav.html' : '_nav.html';

            fetch(navPath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Status HTTP ${response.status}`);
                    }
                    return response.text();
                })
                .then(html => {
                    navPlaceholder.innerHTML = html;
                })
                .catch(error => {
                    // Mensagem de erro visível se a navegação falhar
                    navPlaceholder.innerHTML = '<p style="color:red; text-align:center; padding:10px; background:#fff0f0; border:1px solid red;">[Erro ao carregar navegação. Verifique se _nav.html existe na raiz e o caminho está correto.]</p>';
                    console.error("Erro ao carregar a navegação:", error);
                });
        }
    }

    // Chame a função para carregar a navegação
    loadNavComponent(); 

    
    // ==========================================
    // 1. LÓGICA DO MODAL (Usada em pages/modal-teste.html)
    // ==========================================
    const openBtn = document.getElementById('openModalBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const modal = document.getElementById('testModal');

    if (openBtn && modal) {
        openBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }

    // ==========================================
    // 2. LÓGICA DO FORMULÁRIO (Usada em pages/form-teste.html)
    // ==========================================
    const form = document.getElementById('testForm');
    
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault(); 
            
            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            
            console.log('--- Submissão de Formulário Simulado ---');
            console.log(`Nome: ${nome}`);
            console.log(`Email: ${email}`);

            alert(`Sucesso! Formulário de ${nome} capturado.`);

            form.reset();
        });
    }
});
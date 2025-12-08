// js/main.js

console.log("-----------------------------------------");
console.log("✅ main.js carregado com sucesso!");
console.log("O Live Server está funcionando.");
console.log("-----------------------------------------");


document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 0. LÓGICA DE INJEÇÃO DE COMPONENTE (NAV)
    // ==========================================
    function loadNavComponent() {
        const navPlaceholder = document.getElementById('nav-placeholder');
        
        if (navPlaceholder) {
            // Se a página estiver em 'pages/', precisa de '../'. Caso contrário, é na raiz.
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
    // Obtém referências para os elementos do Modal
    const openBtn = document.getElementById('openModalBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const modal = document.getElementById('testModal');

    // Verifica se os elementos existem antes de tentar manipulá-los (essencial para evitar erros em outras páginas)
    if (openBtn && modal) {
        // Adiciona um listener para abrir o modal
        openBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
        });
    }

    if (closeBtn && modal) {
        // Adiciona um listener para fechar o modal (clique no "x")
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    if (modal) {
        // Adiciona um listener para fechar o modal ao clicar fora (no fundo)
        modal.addEventListener('click', (event) => {
            // Verifica se o clique foi diretamente no fundo (e não no conteúdo interno)
            if (event.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }

    // ==========================================
    // 2. LÓGICA DO FORMULÁRIO (Usada em pages/form-teste.html)
    // ==========================================
    // Obtém a referência para o formulário
    const form = document.getElementById('testForm');
    
    if (form) {
        // Adiciona um listener para o evento de SUBMIT do formulário
        form.addEventListener('submit', (event) => {
            event.preventDefault(); // <-- CRUCIAL: Impede o envio padrão e o recarregamento da página
            
            // Simulação da Captura de Dados
            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            
            console.log('--- Submissão de Formulário Simulado ---');
            console.log(`Nome: ${nome}`);
            console.log(`Email: ${email}`);
            console.log('---------------------------------------');

            // Mensagem de Feedback para o usuário
            alert(`Sucesso! Formulário de ${nome} capturado. Verifique o console (F12) para os dados.`);

            // Limpa o formulário após a submissão simulada
            form.reset();
        });
    }
});
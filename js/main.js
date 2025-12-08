// js/main.js

console.log("-----------------------------------------");
console.log("✅ main.js carregado com sucesso!");
console.log("O Live Server está funcionando.");
console.log("-----------------------------------------");


document.addEventListener('DOMContentLoaded', () => {
    
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
/**
 * faq.js - Funcionalidade de perguntas frequentes
 * Permite expandir/retrair respostas ao clicar nas perguntas
 */

function toggleAnswer(button) {
    const answer = button.nextElementSibling;
    
    // Remove a classe active de todos os botões
    document.querySelectorAll('.faq-question').forEach(btn => {
        if (btn !== button) {
            btn.classList.remove('active');
            btn.nextElementSibling.classList.remove('show');
        }
    });
    
    // Alterna o estado do botão e resposta atual
    button.classList.toggle('active');
    answer.classList.toggle('show');
}

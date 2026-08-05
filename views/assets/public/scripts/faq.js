

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



async function fetchFAQs()
{
    const response = await fetch("http://localhost/SGDI/api/faqs/list");
    const faqs = await response.json();
    console.log(faqs.data);
    const faqCategoryCon = document.querySelector(".faq-category-con");
    const faqCategoryProp = document.querySelector(".faq-category-prop");
    const faqCategoryInq = document.querySelector(".faq-category-inq");
    const faqCategoryPag = document.querySelector(".faq-category-pag");

    faqs.data.forEach(faq => {
        console.log(faq.question, faq.answer);
        const faqItem = document.createElement("article");
        faqItem.classList.add("faq-item");
        faqItem.innerHTML = 
        `
         <button class="faq-question" onclick="toggleAnswer(this)">
                        <span>${faq.question}</span>
                        <span class="icon">+</span>
                    </button>
                <div class="faq-answer">
                        <p>${faq.answer}</p>
         </div>
        `;
        switch(faq.id_faq){
            case 1:
                faqCategoryCon.appendChild(faqItem);
            break;

            case 2:
                faqCategoryProp.appendChild(faqItem);
            break;

            case 3:
                faqCategoryInq.appendChild(faqItem);
            break;
            case 4:
                faqCategoryPag.appendChild(faqItem);
            break;
        }
    });
}

fetchFAQs();


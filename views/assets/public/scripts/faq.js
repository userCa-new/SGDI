import FaqService from "../../_common/classes/services/FaqService.js";
import { createToast } from "../../_common/prototypes/Toast.js";

/**
 * faq.js — lista as FAQs da API e expande/retrai as respostas.
 * Eventos por delegação (sem onclick); textos via textContent (sem injeção de HTML).
 */
const CONTAINER_BY_CATEGORY = {
    1: ".faq-category-con",
    2: ".faq-category-prop",
    3: ".faq-category-inq",
    4: ".faq-category-pag",
};

function toggleAnswer(button) {
    const answer = button.nextElementSibling;
    document.querySelectorAll(".faq-question").forEach((other) => {
        if (other !== button) {
            other.classList.remove("active");
            other.nextElementSibling.classList.remove("show");
        }
    });
    button.classList.toggle("active");
    answer.classList.toggle("show");
}

function buildItem(faq) {
    const item = document.createElement("article");
    item.className = "faq-item";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "faq-question";
    const question = document.createElement("span");
    question.textContent = faq.question;
    const icon = document.createElement("span");
    icon.className = "icon";
    icon.textContent = "+";
    button.append(question, icon);

    const answer = document.createElement("div");
    answer.className = "faq-answer";
    const text = document.createElement("p");
    text.textContent = faq.answer;
    answer.appendChild(text);

    item.append(button, answer);
    return item;
}

async function loadFaqs() {
    const toast = createToast();
    try {
        const response = await new FaqService().list();
        if (response.type !== "success") {
            toast.fromResponse(response);
            return;
        }
        for (const faq of response.data) {
            // a FAQ é agrupada pela sua categoria (id_category)
            const container = document.querySelector(CONTAINER_BY_CATEGORY[faq.idCategory]);
            container?.appendChild(buildItem(faq));
        }
    } catch (error) {
        toast.fromError(error);
    }
}

document.querySelector(".faq-content")?.addEventListener("click", (event) => {
    const button = event.target.closest(".faq-question");
    if (button) toggleAnswer(button);
});

loadFaqs();

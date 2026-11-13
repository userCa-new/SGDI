import FaqService from "../../_common/classes/services/FaqService.js";
import { createToast } from "../../_common/prototypes/Toast.js";

const CONTAINER_BY_CATEGORY = {
  1: ".faq-category-con",
  2: ".faq-category-prop",
  3: ".faq-category-inq",
  4: ".faq-category-pag",
};

const API_COPY_TRANSLATIONS = new Map([
  [
    "How can I pay the rent?",
    {
      question: "Como posso pagar o aluguel?",
      answer:
        "As formas de pagamento são informadas pelo proprietário. Faça a transferência diretamente pelo seu banco e confira os dados antes de pagar.",
    },
  ],
  [
    "Can I delay the payment?",
    {
      question: "O que devo fazer se não conseguir pagar no vencimento?",
      answer:
        "Converse com o proprietário e consulte o contrato para confirmar como eventuais atrasos e encargos são tratados.",
    },
  ],
  [
    "How do I terminate a contract?",
    {
      question: "Como posso encerrar um contrato de locação?",
      answer:
        "Converse com o proprietário e consulte as condições de encerramento previstas no contrato.",
    },
  ],
  [
    "Can I visit a property before renting?",
    {
      question: "Posso visitar o imóvel antes de alugar?",
      answer:
        "Consulte o proprietário para combinar a disponibilidade e o horário da visita.",
    },
  ],
]);

function toggleAnswer(button) {
  const answer = button.nextElementSibling;
  document.querySelectorAll(".faq-question").forEach((other) => {
    if (other !== button) {
      other.classList.remove("active");
      other.nextElementSibling.classList.remove("show");
      other.setAttribute("aria-expanded", "false");
    }
  });
  button.classList.toggle("active");
  answer.classList.toggle("show");
  button.setAttribute(
    "aria-expanded",
    String(button.classList.contains("active")),
  );
}

let nextAnswerId = 0;

function buildItem(faq) {
  const copy = API_COPY_TRANSLATIONS.get(faq.question);
  const questionText = copy?.question ?? faq.question;
  const answerText = copy?.answer ?? faq.answer;
  const item = document.createElement("article");
  item.className = "faq-item";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "faq-question";
  button.setAttribute("aria-expanded", "false");
  const question = document.createElement("span");
  question.textContent = questionText;
  const icon = document.createElement("span");
  icon.className = "icon";
  icon.textContent = "+";
  icon.setAttribute("aria-hidden", "true");
  const answerId = `faq-answer-${nextAnswerId++}`;
  button.setAttribute("aria-controls", answerId);
  button.append(question, icon);

  const answer = document.createElement("section");
  answer.className = "faq-answer";
  answer.id = answerId;
  const text = document.createElement("p");
  text.textContent = answerText;
  answer.appendChild(text);

  item.append(button, answer);
  return item;
}

async function loadFaqs() {
  const toast = createToast();
  const emptyMessages = document.querySelectorAll(".faq-empty");
  try {
    const response = await new FaqService().list();
    if (response.type !== "success") {
      toast.fromResponse(response);
      emptyMessages.forEach((message) => {
        message.textContent =
          "Não foi possível carregar as perguntas. Tente novamente mais tarde.";
      });
      return;
    }

    emptyMessages.forEach((message) => {
      message.textContent = "Nenhuma pergunta cadastrada para este assunto.";
    });

    for (const faq of response.data) {
      const container = document.querySelector(
        CONTAINER_BY_CATEGORY[faq.idCategory],
      );
      if (!container) continue;
      container.querySelector(".faq-empty")?.remove();
      container.appendChild(buildItem(faq));
    }
  } catch (error) {
    toast.fromError(error);
    emptyMessages.forEach((message) => {
      message.textContent =
        "Não foi possível carregar as perguntas. Tente novamente mais tarde.";
    });
  }
}

document.querySelector(".faq-content")?.addEventListener("click", (event) => {
  const button = event.target.closest(".faq-question");
  if (button) toggleAnswer(button);
});

loadFaqs();

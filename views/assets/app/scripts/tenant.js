const issueForm = document.getElementById("maintenance-form");
const issueList = document.getElementById("issue-list");
const chatForm = document.getElementById("chat-form");
const chatWindow = document.getElementById("chat-window");
const receiptButton = document.getElementById("receipt-button");
const scheduleDescription = document.getElementById("schedule-description");
const scheduleItems = document.getElementById("schedule-items");
const paymentStatusText = document.getElementById("payment-status-text");

const savedIssues = JSON.parse(localStorage.getItem("tenantIssues") || "[]");
const savedMessages = JSON.parse(localStorage.getItem("chatMessages") || "[]");

function renderIssues() {
  if (!savedIssues.length) {
    issueList.innerHTML = "<li>Você ainda não enviou solicitações.</li>";
    return;
  }

  issueList.innerHTML = savedIssues
    .map((issue) => {
      return `
            <li>
                <strong>${issue.type}</strong>
                <p>${issue.details}</p>
                <time>Enviado em ${new Date(issue.createdAt).toLocaleString("pt-BR")}</time>
            </li>
        `;
    })
    .join("");
}

function renderMessages() {
  if (!savedMessages.length) {
    chatWindow.innerHTML =
      "<p>Inicie uma conversa com seu proprietário usando o formulário abaixo.</p>";
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return;
  }

  chatWindow.innerHTML = savedMessages
    .map((message) => {
      return `
            <article class="chat-message ${message.from}">
                <p>${message.text}</p>
                <time>${new Date(message.createdAt).toLocaleTimeString("pt-BR")}</time>
            </article>
        `;
    })
    .join("");

  chatWindow.scrollTop = chatWindow.scrollHeight;
  adjustChatScrolling(chatWindow);
}

function adjustChatScrolling(container) {
  if (!container) return;
  const messages = container.querySelectorAll(".chat-message");
  if (messages.length > 3) {
    container.style.maxHeight = "320px";
    container.style.overflowY = "auto";
  } else {
    container.style.maxHeight = "";
    container.style.overflowY = "";
  }
}

function renderSchedule() {
  const appointment = JSON.parse(
    localStorage.getItem("ownerAppointment") || "null",
  );
  if (!appointment) {
    scheduleDescription.textContent =
      "Acompanhe o agendamento definido pelo proprietário.";
    scheduleItems.innerHTML = "<li>Nenhum agendamento definido.</li>";
    return;
  }

  scheduleDescription.textContent = "Agendamento definido pelo proprietário:";
  scheduleItems.innerHTML = `
        <li>${appointment.date} • ${appointment.time} - ${appointment.note || "Sem observação adicional"}</li>
    `;
}

function renderPaymentStatus() {
  const lastConfirmed = JSON.parse(
    localStorage.getItem("lastPaymentConfirmed") || "null",
  );
  if (!lastConfirmed) {
    paymentStatusText.textContent = "Nenhum pagamento confirmado recentemente.";
    return;
  }

  paymentStatusText.textContent = `Último pagamento confirmado: ${lastConfirmed.tenant} • ${lastConfirmed.amount} • vencimento ${lastConfirmed.due}`;
}

issueForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const issue = {
    type: document.getElementById("issue-type").value,
    details: document.getElementById("issue-details").value.trim(),
    createdAt: new Date().toISOString(),
  };

  savedIssues.unshift(issue);
  localStorage.setItem("tenantIssues", JSON.stringify(savedIssues));
  renderIssues();
  issueForm.reset();
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const message = {
    from: "customer",
    text: document.getElementById("chat-message").value.trim(),
    createdAt: new Date().toISOString(),
  };

  savedMessages.push(message);
  localStorage.setItem("chatMessages", JSON.stringify(savedMessages));
  renderMessages();
  chatForm.reset();
});

function getPaymentProofs() {
  return JSON.parse(localStorage.getItem("paymentProofs") || "[]");
}

function savePaymentProofs(list) {
  localStorage.setItem("paymentProofs", JSON.stringify(list));
}

function createTenantProofModal() {
  const modal = document.createElement("section");
  modal.className = "modal-backdrop";
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");

  modal.innerHTML = `
    <section class="modal" role="dialog" aria-modal="true" aria-labelledby="proof-modal-title">
      <header class="modal-header">
        <section class="modal-heading">
          <p class="eyebrow">Comprovante</p>
          <h2 id="proof-modal-title">Registrar comprovante neste navegador</h2>
        </section>
        <button type="button" class="modal-close" id="proof-modal-close" aria-label="Fechar">×</button>
      </header>

      <form id="proof-form" class="payment-method-form">
        <label for="proof-ref">Referência (ex: Apartamento 201)</label>
        <input id="proof-ref" type="text" placeholder="Informe referência do pagamento" required />

        <label for="proof-amount">Valor pago</label>
        <input id="proof-amount" type="text" placeholder="R$ 0,00" />

        <label for="proof-file">Anexar comprovante (imagem ou PDF)</label>
        <input id="proof-file" type="file" accept="image/*,application/pdf" />

        <section class="qr-preview" id="proof-preview" hidden>
          <p class="label">Prévia</p>
          <img id="proof-image-preview" alt="Prévia do comprovante" />
        </section>

        <footer class="modal-actions">
          <button type="button" class="button-secondary" id="proof-cancel">Cancelar</button>
          <button type="submit" class="confirm-button">Salvar comprovante</button>
        </footer>
      </form>
    </section>
  `;

  const form = modal.querySelector("#proof-form");
  const closeBtn = modal.querySelector("#proof-modal-close");
  const cancelBtn = modal.querySelector("#proof-cancel");
  const fileInput = modal.querySelector("#proof-file");
  const preview = modal.querySelector("#proof-preview");
  const imgPreview = modal.querySelector("#proof-image-preview");
  const refInput = modal.querySelector("#proof-ref");
  const amountInput = modal.querySelector("#proof-amount");

  function open() {
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    refInput.focus();
  }

  function close() {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    form.reset();
    preview.hidden = true;
    imgPreview.src = "";
  }

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        imgPreview.src = reader.result;
        preview.hidden = false;
      };
      reader.readAsDataURL(file);
    } else {
      preview.hidden = true;
      imgPreview.src = "";
    }
  });

  modal.addEventListener("click", (ev) => {
    if (ev.target === modal) close();
  });

  closeBtn.addEventListener("click", close);
  cancelBtn.addEventListener("click", close);

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const proofs = getPaymentProofs();
    const file = fileInput.files[0];
    const proof = {
      reference: refInput.value.trim(),
      amount: amountInput.value.trim(),
      createdAt: new Date().toISOString(),
      dataUrl: "",
      fileName: file ? file.name : "",
      fileType: file ? file.type : "",
    };

    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        proof.dataUrl = reader.result;
        proofs.unshift(proof);
        savePaymentProofs(proofs);
        close();
        alert("Comprovante salvo neste navegador; não foi enviado ao proprietário.");
      };
      reader.readAsDataURL(file);
    } else if (file && file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = () => {
        proof.dataUrl = reader.result;
        proofs.unshift(proof);
        savePaymentProofs(proofs);
        close();
        alert("Comprovante salvo neste navegador; não foi enviado ao proprietário.");
      };
      reader.readAsDataURL(file);
    } else {
      proofs.unshift(proof);
      savePaymentProofs(proofs);
      close();
      alert("Referência salva neste navegador, sem arquivo e sem envio ao proprietário.");
    }
  });

  return { modal, open };
}

const tenantProofModal = createTenantProofModal();
document.body.appendChild(tenantProofModal.modal);

receiptButton.addEventListener("click", () => {
  tenantProofModal.open();
});

renderIssues();
renderMessages();
renderSchedule();
renderPaymentStatus();

window.addEventListener("storage", (event) => {
  if (event.key === "lastMaintenanceCompleted" && event.newValue) {
    try {
      const payload = JSON.parse(event.newValue);
      const removed = payload.removed;
      if (removed) {
        alert(
          `Solicitação concluída pelo proprietário:\n\nTipo: ${removed.type}\nDescrição: ${removed.details}`,
        );
      }
    } catch (err) {}
    renderIssues();
  }
});

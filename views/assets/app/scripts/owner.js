const paymentList = document.getElementById('payment-list');
const toast = document.getElementById('toast');
const scheduleForm = document.getElementById('schedule-form');
const scheduleDisplay = document.getElementById('schedule-display');
const chatWindow = document.getElementById('owner-chat-window');
const ownerChatForm = document.getElementById('owner-chat-form');

const savedPayments = JSON.parse(localStorage.getItem('ownerPayments') || '[]');
const chatMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
let lastConfirmedPayment = null;
let toastTimeout = null;

const paymentPanel = document.querySelector('.pix-panel');
const paymentMethodsContainer = document.createElement('div');
paymentMethodsContainer.className = 'payment-methods';
if (paymentPanel) {
  const pixList = paymentPanel.querySelector('.pix-list');
  if (pixList) {
    paymentPanel.insertBefore(paymentMethodsContainer, pixList);
  }
}

function getPaymentMethods() {
  return JSON.parse(localStorage.getItem('ownerPaymentMethods') || '[]');
}

function savePaymentMethods(methods) {
  localStorage.setItem('ownerPaymentMethods', JSON.stringify(methods));
}

function renderPaymentMethods() {
  const methods = getPaymentMethods();

  if (!paymentMethodsContainer) return;

  if (!methods.length) {
    paymentMethodsContainer.innerHTML =
      '<p class="hint">Nenhum método fixado. Clique em "Fixar método de pagamento" para adicionar Pix, QR Code ou dados bancários.</p>';
    return;
  }

  paymentMethodsContainer.innerHTML = methods
    .map((method) => {
      return `
            <article class="payment-card">
                <p class="method-type">${method.type}</p>
                <p class="method-value">${method.value}</p>
                ${method.qrDataUrl ? `<img src="${method.qrDataUrl}" alt="QR Code de ${method.type}" />` : ''}
            </article>
        `;
    })
    .join('');
}

function createPaymentModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  modal.hidden = true;
  modal.setAttribute('aria-hidden', 'true');

  modal.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="payment-modal-title">
      <header class="modal-header">
        <div>
          <p class="eyebrow">Cobranças</p>
          <h2 id="payment-modal-title">Configurar método de cobrança</h2>
        </div>
        <button type="button" class="modal-close" id="payment-modal-close" aria-label="Fechar modal">×</button>
      </header>

      <form id="payment-method-form" class="payment-method-form">
        <label for="payment-type">Tipo de cobrança</label>
        <select id="payment-type" required>
          <option value="Pix">Pix</option>
          <option value="QR Code">QR Code</option>
          <option value="Banco">Banco</option>
        </select>

        <label for="payment-value">Chave ou dados</label>
        <input id="payment-value" type="text" placeholder="Digite a chave Pix, QR ou dados bancários" required />

        <div class="qr-input-group" hidden>
          <label for="qr-file">Anexar QR Code</label>
          <input id="qr-file" type="file" accept="image/*" />
        </div>

        <div class="qr-preview" id="qr-preview" hidden>
          <p class="label">Prévia do QR Code</p>
          <img id="qr-image-preview" alt="Prévia do QR Code" />
        </div>

        <div class="modal-actions">
          <button type="button" class="button-secondary" id="payment-modal-cancel">Cancelar</button>
          <button type="submit" class="confirm-button">Salvar cobrança</button>
        </div>
      </form>
    </div>
  `;

  const form = modal.querySelector('#payment-method-form');
  const closeButton = modal.querySelector('#payment-modal-close');
  const cancelButton = modal.querySelector('#payment-modal-cancel');
  const fileGroup = modal.querySelector('.qr-input-group');
  const fileInput = modal.querySelector('#qr-file');
  const qrPreview = modal.querySelector('#qr-preview');
  const qrImagePreview = modal.querySelector('#qr-image-preview');
  const paymentType = modal.querySelector('#payment-type');
  const paymentValue = modal.querySelector('#payment-value');

  function closeModal() {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    form.reset();
    fileGroup.hidden = true;
    qrPreview.hidden = true;
    qrImagePreview.src = '';
  }

  function openModal() {
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    paymentValue.focus();
  }

  function toggleQrInput() {
    const isQr = paymentType.value === 'QR Code';
    fileGroup.hidden = !isQr;
    if (!isQr) {
      fileInput.value = '';
      qrPreview.hidden = true;
      qrImagePreview.src = '';
    }
  }

  paymentType.addEventListener('change', toggleQrInput);
  toggleQrInput();

  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      qrPreview.hidden = true;
      qrImagePreview.src = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      qrImagePreview.src = reader.result;
      qrPreview.hidden = false;
    };
    reader.readAsDataURL(file);
  });

  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  closeButton.addEventListener('click', closeModal);
  cancelButton.addEventListener('click', closeModal);

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const methods = getPaymentMethods();
    const newMethod = {
      type: paymentType.value,
      value: paymentValue.value.trim(),
      qrDataUrl:
        paymentType.value === 'QR Code' ? qrImagePreview.src || '' : '',
      createdAt: new Date().toISOString(),
    };

    methods.unshift(newMethod);
    savePaymentMethods(methods);
    renderPaymentMethods();
    closeModal();
  });

  return { modal, openModal };
}

const paymentModal = createPaymentModal();
document.body.appendChild(paymentModal.modal);
renderPaymentMethods();

const paymentMethodButton = document.getElementById('manage-payment-method');
if (paymentMethodButton) {
  paymentMethodButton.addEventListener('click', () => {
    paymentModal.openModal();
  });
}

function renderPaymentList() {
  if (!savedPayments.length) {
    paymentList.innerHTML =
      '<p class="hint">Nenhum pagamento registrado. Aguarde confirmações assistidas.</p>';
    return;
  }

  paymentList.innerHTML = savedPayments
    .map((payment, index) => {
      return `
            <article class="payment-item">
                <header>
                    <div>
                        <strong>${payment.tenant}</strong>
                        <p>${payment.status}</p>
                    </div>
                    <button class="confirm-button" data-index="${index}">${payment.status.toLowerCase().includes('confirmado') ? 'Confirmado' : 'Confirmar'}</button>
                </header>
                <p>Valor: ${payment.amount}</p>
                <p>Vencimento: ${payment.due}</p>
            </article>
        `;
    })
    .join('');
}

function savePayments() {
  localStorage.setItem('ownerPayments', JSON.stringify(savedPayments));
}

function saveChatMessages() {
  localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
}

function renderChat() {
  if (!chatMessages.length) {
    chatWindow.innerHTML =
      '<p>Inicie a conversa com o inquilino usando o formulário abaixo.</p>';
    chatWindow.scrollTop = chatWindow.scrollHeight;
    return;
  }

  chatWindow.innerHTML = chatMessages
    .map((message) => {
      return `
            <article class="chat-message ${message.from}">
                <p>${message.text}</p>
                <time>${new Date(message.createdAt).toLocaleTimeString('pt-BR')}</time>
            </article>
        `;
    })
    .join('');

  chatWindow.scrollTop = chatWindow.scrollHeight;
  adjustChatScrolling(chatWindow);
}

function adjustChatScrolling(container) {
  if (!container) return;
  const messages = container.querySelectorAll('.chat-message');
  if (messages.length > 3) {
    container.style.maxHeight = '320px';
    container.style.overflowY = 'auto';
  } else {
    container.style.maxHeight = '';
    container.style.overflowY = '';
  }
}

function renderAppointment() {
  const appointment = JSON.parse(
    localStorage.getItem('ownerAppointment') || 'null',
  );

  if (!appointment) {
    scheduleDisplay.textContent = 'Nenhum agendamento definido.';
    return;
  }

  scheduleDisplay.textContent =
    `${appointment.date} às ${appointment.time}` +
    (appointment.note ? ` — ${appointment.note}` : '');
}

function showToast(message, onUndo) {
  if (!toast) return;

  toast.innerHTML = `
        <p>${message}</p>
        <button type="button" class="toast-action">Desfazer</button>
    `;
  toast.classList.add('show');

  const action = toast.querySelector('.toast-action');
  if (action) {
    action.addEventListener(
      'click',
      () => {
        if (onUndo) {
          onUndo();
        }
        toast.classList.remove('show');
        toast.innerHTML = '';
        clearTimeout(toastTimeout);
      },
      { once: true },
    );
  }

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
    toast.innerHTML = '';
  }, 6000);
}

paymentList.addEventListener('click', (event) => {
  const button = event.target.closest('.confirm-button');
  if (!button) {
    return;
  }

  const index = Number(button.dataset.index);
  if (Number.isNaN(index)) {
    return;
  }

  const confirmedPayment = savedPayments.splice(index, 1)[0];
  savePayments();

  localStorage.setItem(
    'lastPaymentConfirmed',
    JSON.stringify({
      tenant: confirmedPayment.tenant,
      amount: confirmedPayment.amount,
      due: confirmedPayment.due,
      confirmedAt: new Date().toISOString(),
    }),
  );

  lastConfirmedPayment = {
    payment: confirmedPayment,
    index,
  };

  renderPaymentList();
  showToast(`Pagamento de ${confirmedPayment.tenant} confirmado.`, () => {
    if (!lastConfirmedPayment) return;
    savedPayments.splice(
      lastConfirmedPayment.index,
      0,
      lastConfirmedPayment.payment,
    );
    savePayments();
    renderPaymentList();
    lastConfirmedPayment = null;
  });
});

if (!savedPayments.length) {
  const samplePayments = [
    {
      tenant: 'Apartamento 201',
      amount: 'R$ 1.680,00',
      due: '07/06',
      status: 'Pendente, confirme no banco',
    },
    {
      tenant: 'Apartamento 110',
      amount: 'R$ 1.320,00',
      due: '10/06',
      status: 'Em análise',
    },
    {
      tenant: 'Apartamento 304',
      amount: 'R$ 1.940,00',
      due: '12/06',
      status: 'Pendente, aguardando comprovante',
    },
  ];
  savedPayments.push(...samplePayments);
  savePayments();
}

if (scheduleForm) {
  scheduleForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const appointment = {
      date: document.getElementById('schedule-date').value,
      time: document.getElementById('schedule-time').value,
      note: document.getElementById('schedule-note').value.trim(),
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem('ownerAppointment', JSON.stringify(appointment));
    renderAppointment();
    alert('Agendamento salvo e disponível para o inquilino.');
    scheduleForm.reset();
  });
}

if (ownerChatForm) {
  ownerChatForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const messageText = document
      .getElementById('owner-chat-message')
      .value.trim();
    if (!messageText) {
      return;
    }

    chatMessages.push({
      from: 'owner',
      text: messageText,
      createdAt: new Date().toISOString(),
    });

    saveChatMessages();
    renderChat();
    ownerChatForm.reset();
  });
}

renderPaymentList();
renderAppointment();
renderChat();

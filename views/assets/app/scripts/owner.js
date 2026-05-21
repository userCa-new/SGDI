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

const paymentMethodButton = document.getElementById('manage-payment-method');
if (paymentMethodButton) {
  paymentMethodButton.addEventListener('click', () => {
    const method = prompt(
      'Digite o meio de pagamento fixo (ex: Pix, QR ou chave):',
      'Pix',
    );
    if (!method) {
      return;
    }

    alert(
      `Método de pagamento fixado: ${method}. Atualize os dados de cobrança conforme necessário.`,
    );
  });
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

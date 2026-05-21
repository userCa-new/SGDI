const issueForm = document.getElementById('maintenance-form');
const issueList = document.getElementById('issue-list');
const chatForm = document.getElementById('chat-form');
const chatWindow = document.getElementById('chat-window');
const receiptButton = document.getElementById('receipt-button');
const scheduleDescription = document.getElementById('schedule-description');
const scheduleItems = document.getElementById('schedule-items');
const paymentStatusText = document.getElementById('payment-status-text');

const savedIssues = JSON.parse(localStorage.getItem('tenantIssues') || '[]');
const savedMessages = JSON.parse(localStorage.getItem('chatMessages') || '[]');

function renderIssues() {
    if (!savedIssues.length) {
        issueList.innerHTML = '<li>Você ainda não enviou solicitações.</li>';
        return;
    }

    issueList.innerHTML = savedIssues.map((issue) => {
        return `
            <li>
                <strong>${issue.type}</strong>
                <p>${issue.details}</p>
                <time>Enviado em ${new Date(issue.createdAt).toLocaleString('pt-BR')}</time>
            </li>
        `;
    }).join('');
}

function renderMessages() {
    if (!savedMessages.length) {
        chatWindow.innerHTML = '<p>Inicie uma conversa com seu proprietário usando o formulário abaixo.</p>';
        return;
    }

    chatWindow.innerHTML = savedMessages.map((message) => {
        return `
            <article class="chat-message ${message.from}">
                <p>${message.text}</p>
                <time>${new Date(message.createdAt).toLocaleTimeString('pt-BR')}</time>
            </article>
        `;
    }).join('');
}

function renderSchedule() {
    const appointment = JSON.parse(localStorage.getItem('ownerAppointment') || 'null');
    if (!appointment) {
        scheduleDescription.textContent = 'Acompanhe o agendamento definido pelo proprietário.';
        scheduleItems.innerHTML = '<li>Nenhum agendamento definido.</li>';
        return;
    }

    scheduleDescription.textContent = 'Agendamento definido pelo proprietário:';
    scheduleItems.innerHTML = `
        <li>${appointment.date} • ${appointment.time} - ${appointment.note || 'Sem observação adicional'}</li>
    `;
}

function renderPaymentStatus() {
    const lastConfirmed = JSON.parse(localStorage.getItem('lastPaymentConfirmed') || 'null');
    if (!lastConfirmed) {
        paymentStatusText.textContent = 'Nenhum pagamento confirmado recentemente.';
        return;
    }

    paymentStatusText.textContent = `Último pagamento confirmado: ${lastConfirmed.tenant} • ${lastConfirmed.amount} • vencimento ${lastConfirmed.due}`;
}

issueForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const issue = {
        type: document.getElementById('issue-type').value,
        details: document.getElementById('issue-details').value.trim(),
        createdAt: new Date().toISOString()
    };

    savedIssues.unshift(issue);
    localStorage.setItem('tenantIssues', JSON.stringify(savedIssues));
    renderIssues();
    issueForm.reset();
});

chatForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const message = {
        from: 'customer',
        text: document.getElementById('chat-message').value.trim(),
        createdAt: new Date().toISOString()
    };

    savedMessages.push(message);
    localStorage.setItem('chatMessages', JSON.stringify(savedMessages));
    renderMessages();
    chatForm.reset();
});

receiptButton.addEventListener('click', () => {
    const receipt = {
        title: 'Comprovante de pagamento (simulado)',
        date: new Date().toLocaleDateString('pt-BR'),
        amount: 'R$ 1.680,00',
        status: 'Confirmado'
    };

    alert(`${receipt.title}\n\nData: ${receipt.date}\nValor: ${receipt.amount}\nStatus: ${receipt.status}`);
});

renderIssues();
renderMessages();
renderSchedule();
renderPaymentStatus();

const paymentForm = document.getElementById('payment-form');
const paymentItems = document.getElementById('payment-items');
const savedPayments = JSON.parse(localStorage.getItem('sgdiPayments') || '[]');

function formatPaymentItem(payment) {
    return `
        <li>
            <strong>${payment.type.toUpperCase()}</strong> - ${payment.name}
            <p>${payment.key}</p>
            <p><strong>Valor:</strong> ${payment.amount} • <strong>Vencimento:</strong> ${payment.due}</p>
        </li>
    `;
}

function renderPayments() {
    if (!savedPayments.length) {
        paymentItems.innerHTML = '<li class="empty-state">Nenhum método cadastrado ainda.</li>';
        return;
    }

    paymentItems.innerHTML = savedPayments
        .map(formatPaymentItem)
        .join('');
}

paymentForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const payment = {
        type: document.getElementById('payment-type').value,
        name: document.getElementById('payment-name').value.trim(),
        key: document.getElementById('payment-key').value.trim(),
        amount: document.getElementById('payment-amount').value.trim(),
        due: document.getElementById('payment-due').value,
        createdAt: new Date().toISOString()
    };

    savedPayments.unshift(payment);
    localStorage.setItem('sgdiPayments', JSON.stringify(savedPayments));
    renderPayments();
    paymentForm.reset();
    document.getElementById('payment-type').focus();
});

renderPayments();

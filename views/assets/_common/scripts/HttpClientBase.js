// HttpClientBase.js - Cliente HTTP reutilizável

class HttpClientBase {
    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl;
    }

    /**
     * Realiza uma requisição HTTP genérica
     * @param {string} method - GET, POST, PUT, DELETE, etc
     * @param {string} endpoint - Caminho da API (ex: '/users')
     * @param {Object} data - Dados a enviar (opcional)
     * @returns {Promise<Object>} Resposta da API
     */
    async request(method, endpoint, data = null) {
        const url = `${this.baseUrl}${endpoint}`;
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        // Adiciona token se existir no localStorage
        const token = localStorage.getItem('token');
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro na requisição:', error);
            throw error;
        }
    }

    // Métodos convenientes
    get(endpoint) {
        return this.request('GET', endpoint);
    }

    post(endpoint, data) {
        return this.request('POST', endpoint, data);
    }

    put(endpoint, data) {
        return this.request('PUT', endpoint, data);
    }

    delete(endpoint) {
        return this.request('DELETE', endpoint);
    }
}

export default HttpClientBase;
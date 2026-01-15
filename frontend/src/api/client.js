const API_BASE = '/api';

class APIClient {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            this.token = null;
            localStorage.removeItem('token');
            window.location.href = '/login';
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(error.detail || 'Request failed');
        }

        if (response.status === 204) {
            return null;
        }

        return response.json().catch(() => null);
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
    }

    async login(username, password) {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const data = await this.request('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData,
        });

        this.setToken(data.access_token);
        return data;
    }

    async register(username, email, password) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password }),
        });
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    async getTransactions(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/transactions/${queryString ? `?${queryString}` : ''}`);
    }

    async createTransaction(transaction) {
        return this.request('/transactions/', {
            method: 'POST',
            body: JSON.stringify(transaction),
        });
    }

    async updateTransaction(id, transaction) {
        return this.request(`/transactions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(transaction),
        });
    }

    async deleteTransaction(id) {
        return this.request(`/transactions/${id}`, {
            method: 'DELETE',
        });
    }

    async getGoals() {
        return this.request('/goals/');
    }

    async createGoal(goal) {
        return this.request('/goals/', {
            method: 'POST',
            body: JSON.stringify(goal),
        });
    }

    async updateGoal(id, goal) {
        return this.request(`/goals/${id}`, {
            method: 'PUT',
            body: JSON.stringify(goal),
        });
    }

    async deleteGoal(id) {
        return this.request(`/goals/${id}`, {
            method: 'DELETE',
        });
    }

    async getAnalyticsSummary() {
        return this.request('/analytics/summary');
    }

    async getSpendingByCategory(days = 30) {
        return this.request(`/analytics/spending-by-category?days=${days}`);
    }

    async getMonthlySummary() {
        return this.request('/analytics/monthly-summary');
    }

    async getPredictions() {
        return this.request('/analytics/predictions');
    }

    async getAIInsights() {
        return this.request('/ai/insights');
    }

    async getSavingsRecommendations() {
        return this.request('/ai/savings-recommendations');
    }
}

export const api = new APIClient();

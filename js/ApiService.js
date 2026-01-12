/**
 * ApiService - Handles all API communication
 */
export class ApiService {
    constructor() {
        this.baseUrl = window.location.origin;
        this.csrfToken = null;
    }

    /**
     * Get CSRF token from session
     */
    async getCSRFToken() {
        if (this.csrfToken) {
            return this.csrfToken;
        }

        try {
            const response = await fetch(`${this.baseUrl}/api/auth.php?action=status`);
            const data = await response.json();
            if (data.success && data.data.csrf_token) {
                this.csrfToken = data.data.csrf_token;
                return this.csrfToken;
            }
        } catch (error) {
            console.error('Failed to get CSRF token:', error);
        }
        return null;
    }

    /**
     * Make API request
     */
    async request(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Add CSRF token for POST/PUT/DELETE
        if (['POST', 'PUT', 'DELETE'].includes(options.method?.toUpperCase())) {
            const token = await this.getCSRFToken();
            if (token) {
                headers['X-CSRF-Token'] = token;
            }
        }

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Auth methods
    async login(username, password) {
        const data = await this.request(`${this.baseUrl}/api/auth.php?action=login`, {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        if (data.success && data.data.csrf_token) {
            this.csrfToken = data.data.csrf_token;
        }
        return data;
    }

    async logout() {
        const data = await this.request(`${this.baseUrl}/api/auth.php?action=logout`, {
            method: 'POST'
        });
        this.csrfToken = null;
        return data;
    }

    async checkAuth() {
        return this.request(`${this.baseUrl}/api/auth.php?action=status`);
    }

    // Posts methods
    async getPosts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`${this.baseUrl}/api/posts.php${queryString ? '?' + queryString : ''}`);
    }

    async getPost(id) {
        return this.request(`${this.baseUrl}/api/posts.php?id=${id}`);
    }

    async createPost(postData) {
        return this.request(`${this.baseUrl}/api/posts.php`, {
            method: 'POST',
            body: JSON.stringify(postData)
        });
    }

    async updatePost(id, postData) {
        return this.request(`${this.baseUrl}/api/posts.php`, {
            method: 'PUT',
            body: JSON.stringify({ id, ...postData })
        });
    }

    async deletePost(id) {
        return this.request(`${this.baseUrl}/api/posts.php`, {
            method: 'DELETE',
            body: JSON.stringify({ id })
        });
    }

    // Shops methods
    async getShops(activeOnly = false) {
        return this.request(`${this.baseUrl}/api/shops.php${activeOnly ? '?active=1' : ''}`);
    }

    async getShop(id) {
        return this.request(`${this.baseUrl}/api/shops.php?id=${id}`);
    }

    async createShop(shopData) {
        return this.request(`${this.baseUrl}/api/shops.php`, {
            method: 'POST',
            body: JSON.stringify(shopData)
        });
    }

    async updateShop(id, shopData) {
        return this.request(`${this.baseUrl}/api/shops.php`, {
            method: 'PUT',
            body: JSON.stringify({ id, ...shopData })
        });
    }

    async deleteShop(id) {
        return this.request(`${this.baseUrl}/api/shops.php`, {
            method: 'DELETE',
            body: JSON.stringify({ id })
        });
    }

    // Templates methods
    async getTemplates(activeOnly = false) {
        return this.request(`${this.baseUrl}/api/templates.php${activeOnly ? '?active=1' : ''}`);
    }

    async getTemplate(id) {
        return this.request(`${this.baseUrl}/api/templates.php?id=${id}`);
    }

    async createTemplate(templateData) {
        return this.request(`${this.baseUrl}/api/templates.php`, {
            method: 'POST',
            body: JSON.stringify(templateData)
        });
    }

    async updateTemplate(id, templateData) {
        return this.request(`${this.baseUrl}/api/templates.php`, {
            method: 'PUT',
            body: JSON.stringify({ id, ...templateData })
        });
    }

    async deleteTemplate(id) {
        return this.request(`${this.baseUrl}/api/templates.php`, {
            method: 'DELETE',
            body: JSON.stringify({ id })
        });
    }

    // Media upload
    async uploadMedia(postId, file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('post_id', postId);

        const token = await this.getCSRFToken();
        const headers = {};
        if (token) {
            headers['X-CSRF-Token'] = token;
        }

        try {
            const response = await fetch(`${this.baseUrl}/api/uploads.php`, {
                method: 'POST',
                headers,
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            return data;
        } catch (error) {
            console.error('Upload failed:', error);
            throw error;
        }
    }

    async deleteMedia(id) {
        return this.request(`${this.baseUrl}/api/uploads.php`, {
            method: 'DELETE',
            body: JSON.stringify({ id })
        });
    }
}

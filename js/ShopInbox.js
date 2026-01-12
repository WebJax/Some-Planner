/**
 * ShopInbox - Manages shops list and overview
 */
export class ShopInbox {
    constructor(apiService) {
        this.apiService = apiService;
        this.shops = [];
    }

    /**
     * Load all shops
     */
    async loadShops() {
        try {
            const response = await this.apiService.getShops();
            this.shops = response.data || [];
            return this.shops;
        } catch (error) {
            console.error('Failed to load shops:', error);
            return [];
        }
    }

    /**
     * Get shop by ID
     */
    getShop(id) {
        return this.shops.find(s => s.id === id);
    }

    /**
     * Get active shops only
     */
    getActiveShops() {
        return this.shops.filter(s => s.active);
    }

    /**
     * Create new shop
     */
    async createShop(name, contactName, contactEmail, contactPhone) {
        try {
            const response = await this.apiService.createShop({
                name,
                contact_name: contactName,
                contact_email: contactEmail,
                contact_phone: contactPhone,
                active: 1
            });
            await this.loadShops();
            return response.data;
        } catch (error) {
            console.error('Failed to create shop:', error);
            throw error;
        }
    }

    /**
     * Update shop
     */
    async updateShop(id, data) {
        try {
            const response = await this.apiService.updateShop(id, data);
            await this.loadShops();
            return response.data;
        } catch (error) {
            console.error('Failed to update shop:', error);
            throw error;
        }
    }

    /**
     * Delete shop
     */
    async deleteShop(id) {
        try {
            await this.apiService.deleteShop(id);
            await this.loadShops();
        } catch (error) {
            console.error('Failed to delete shop:', error);
            throw error;
        }
    }

    /**
     * Toggle shop active status
     */
    async toggleShopStatus(id) {
        const shop = this.getShop(id);
        if (!shop) return;

        try {
            await this.updateShop(id, { active: shop.active ? 0 : 1 });
        } catch (error) {
            console.error('Failed to toggle shop status:', error);
            throw error;
        }
    }
}

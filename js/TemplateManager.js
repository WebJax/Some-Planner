/**
 * TemplateManager - Manages caption templates
 */
export class TemplateManager {
    constructor(apiService) {
        this.apiService = apiService;
        this.templates = [];
    }

    /**
     * Load all templates
     */
    async loadTemplates() {
        try {
            const response = await this.apiService.getTemplates();
            this.templates = response.data || [];
            return this.templates;
        } catch (error) {
            console.error('Failed to load templates:', error);
            return [];
        }
    }

    /**
     * Get template by ID
     */
    getTemplate(id) {
        return this.templates.find(t => t.id === id);
    }

    /**
     * Apply template with variable substitution
     */
    applyTemplate(templateId, variables = {}) {
        const template = this.getTemplate(templateId);
        if (!template) return '';

        let caption = template.caption_template;
        
        // Replace variables in template
        Object.keys(variables).forEach(key => {
            const placeholder = `{${key}}`;
            caption = caption.replace(new RegExp(placeholder, 'g'), variables[key] || '');
        });

        return caption;
    }

    /**
     * Create new template
     */
    async createTemplate(name, captionTemplate, mediaGuide) {
        try {
            const response = await this.apiService.createTemplate({
                name,
                caption_template: captionTemplate,
                media_guide: mediaGuide
            });
            await this.loadTemplates();
            return response.data;
        } catch (error) {
            console.error('Failed to create template:', error);
            throw error;
        }
    }

    /**
     * Update template
     */
    async updateTemplate(id, data) {
        try {
            const response = await this.apiService.updateTemplate(id, data);
            await this.loadTemplates();
            return response.data;
        } catch (error) {
            console.error('Failed to update template:', error);
            throw error;
        }
    }

    /**
     * Delete template
     */
    async deleteTemplate(id) {
        try {
            await this.apiService.deleteTemplate(id);
            await this.loadTemplates();
        } catch (error) {
            console.error('Failed to delete template:', error);
            throw error;
        }
    }
}

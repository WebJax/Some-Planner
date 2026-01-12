/**
 * PostCard - Handles post editing sidebar
 */
export class PostCard {
    constructor(apiService, onSave, onDelete) {
        this.apiService = apiService;
        this.onSave = onSave;
        this.onDelete = onDelete;
        this.currentPost = null;
        this.shops = [];
        this.templates = [];
        
        this.createElements();
        this.loadShops();
        this.loadTemplates();
    }

    /**
     * Create sidebar elements
     */
    createElements() {
        // Create backdrop
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'sidebar-backdrop';
        this.backdrop.addEventListener('click', () => this.close());
        document.body.appendChild(this.backdrop);

        // Create sidebar
        this.sidebar = document.createElement('div');
        this.sidebar.className = 'sidebar';
        this.sidebar.id = 'postSidebar';
        document.body.appendChild(this.sidebar);
    }

    /**
     * Load shops for dropdown
     */
    async loadShops() {
        try {
            const response = await this.apiService.getShops(true);
            this.shops = response.data || [];
        } catch (error) {
            console.error('Failed to load shops:', error);
        }
    }

    /**
     * Load templates
     */
    async loadTemplates() {
        try {
            const response = await this.apiService.getTemplates(true);
            this.templates = response.data || [];
        } catch (error) {
            console.error('Failed to load templates:', error);
        }
    }

    /**
     * Open sidebar for new post
     */
    openNew(date) {
        this.currentPost = {
            date: this.formatDate(date),
            type: 'post',
            format: '',
            shop_id: null,
            status: 'draft',
            caption: '',
            notes: '',
            media: []
        };
        this.render();
        this.show();
    }

    /**
     * Open sidebar for existing post
     */
    async openEdit(postId) {
        try {
            const response = await this.apiService.getPost(postId);
            this.currentPost = response.data;
            this.render();
            this.show();
        } catch (error) {
            console.error('Failed to load post:', error);
            alert('Kunne ikke indlæse opslag');
        }
    }

    /**
     * Render sidebar content
     */
    render() {
        const isNew = !this.currentPost.id;
        
        const shopOptions = this.shops.map(shop => 
            `<option value="${shop.id}" ${this.currentPost.shop_id == shop.id ? 'selected' : ''}>${shop.name}</option>`
        ).join('');

        const templateOptions = this.templates.map(template =>
            `<option value="${template.id}">${template.name}</option>`
        ).join('');

        this.sidebar.innerHTML = `
            <div class="modal-header">
                <h2 class="modal-title">${isNew ? 'Nyt opslag' : 'Rediger opslag'}</h2>
                <button class="btn btn-ghost" id="closeSidebar">✕</button>
            </div>
            
            <div class="modal-body">
                <form id="postForm">
                    <div class="form-group">
                        <label class="form-label" for="postDate">Dato</label>
                        <input type="date" id="postDate" class="form-input" value="${this.currentPost.date}" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="postType">Type</label>
                        <select id="postType" class="form-select" required>
                            <option value="post" ${this.currentPost.type === 'post' ? 'selected' : ''}>Post</option>
                            <option value="reel" ${this.currentPost.type === 'reel' ? 'selected' : ''}>Reel</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="postFormat">Format</label>
                        <input type="text" id="postFormat" class="form-input" value="${this.currentPost.format || ''}" placeholder="F.eks. butik i fokus">
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="postShop">Butik</label>
                        <select id="postShop" class="form-select">
                            <option value="">Ingen butik</option>
                            ${shopOptions}
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="postStatus">Status</label>
                        <select id="postStatus" class="form-select" required>
                            <option value="draft" ${this.currentPost.status === 'draft' ? 'selected' : ''}>Draft</option>
                            <option value="ready" ${this.currentPost.status === 'ready' ? 'selected' : ''}>Ready</option>
                            <option value="published" ${this.currentPost.status === 'published' ? 'selected' : ''}>Published</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="postTemplate">Skabelon</label>
                        <select id="postTemplate" class="form-select">
                            <option value="">Vælg skabelon...</option>
                            ${templateOptions}
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="postCaption">Caption</label>
                        <textarea id="postCaption" class="form-textarea" rows="6">${this.currentPost.caption || ''}</textarea>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="postNotes">Noter</label>
                        <textarea id="postNotes" class="form-textarea" rows="3">${this.currentPost.notes || ''}</textarea>
                    </div>

                    ${!isNew ? `
                        <div class="form-group">
                            <label class="form-label">Medier</label>
                            <input type="file" id="mediaUpload" accept="image/*,video/*" multiple style="display: none;">
                            <button type="button" class="btn btn-secondary w-full" id="uploadBtn">
                                📷 Upload billede/video
                            </button>
                            <div class="media-grid" id="mediaGrid"></div>
                        </div>
                    ` : ''}
                </form>
            </div>

            <div class="modal-footer">
                ${!isNew ? `<button class="btn btn-secondary" id="deletePost" style="margin-right: auto;">Slet</button>` : ''}
                <button class="btn btn-secondary" id="cancelPost">Annuller</button>
                <button class="btn btn-primary" id="savePost">Gem</button>
            </div>
        `;

        this.attachEventListeners();
        if (!isNew) {
            this.renderMedia();
        }
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        document.getElementById('closeSidebar').addEventListener('click', () => this.close());
        document.getElementById('cancelPost').addEventListener('click', () => this.close());
        document.getElementById('savePost').addEventListener('click', () => this.save());
        
        if (this.currentPost.id) {
            document.getElementById('deletePost').addEventListener('click', () => this.delete());
            document.getElementById('uploadBtn').addEventListener('click', () => {
                document.getElementById('mediaUpload').click();
            });
            document.getElementById('mediaUpload').addEventListener('change', (e) => this.handleFileUpload(e));
        }

        // Template selection
        document.getElementById('postTemplate').addEventListener('change', (e) => {
            if (e.target.value) {
                this.applyTemplate(parseInt(e.target.value));
            }
        });
    }

    /**
     * Apply template to caption
     */
    applyTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (template && template.caption_template) {
            document.getElementById('postCaption').value = template.caption_template;
        }
    }

    /**
     * Render media grid
     */
    renderMedia() {
        const grid = document.getElementById('mediaGrid');
        if (!grid || !this.currentPost.media || this.currentPost.media.length === 0) {
            return;
        }

        grid.innerHTML = this.currentPost.media.map(media => `
            <div class="media-item" data-media-id="${media.id}">
                ${media.media_type === 'image' 
                    ? `<img src="${media.file_path}" alt="${media.file_name}">`
                    : `<video src="${media.file_path}" controls></video>`
                }
                <button class="media-item-remove" data-media-id="${media.id}">✕</button>
            </div>
        `).join('');

        // Add delete listeners
        grid.querySelectorAll('.media-item-remove').forEach(btn => {
            btn.addEventListener('click', () => this.deleteMedia(parseInt(btn.dataset.mediaId)));
        });
    }

    /**
     * Handle file upload
     */
    async handleFileUpload(event) {
        const files = event.target.files;
        if (!files.length) return;

        for (const file of files) {
            try {
                const response = await this.apiService.uploadMedia(this.currentPost.id, file);
                if (response.success) {
                    this.currentPost.media.push(response.data);
                    this.renderMedia();
                }
            } catch (error) {
                console.error('Upload failed:', error);
                alert('Upload fejlede: ' + error.message);
            }
        }

        event.target.value = '';
    }

    /**
     * Delete media
     */
    async deleteMedia(mediaId) {
        if (!confirm('Slet denne mediefil?')) return;

        try {
            await this.apiService.deleteMedia(mediaId);
            this.currentPost.media = this.currentPost.media.filter(m => m.id !== mediaId);
            this.renderMedia();
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Kunne ikke slette medie');
        }
    }

    /**
     * Save post
     */
    async save() {
        const formData = {
            date: document.getElementById('postDate').value,
            type: document.getElementById('postType').value,
            format: document.getElementById('postFormat').value || null,
            shop_id: document.getElementById('postShop').value || null,
            status: document.getElementById('postStatus').value,
            caption: document.getElementById('postCaption').value || null,
            notes: document.getElementById('postNotes').value || null
        };

        try {
            if (this.currentPost.id) {
                await this.apiService.updatePost(this.currentPost.id, formData);
            } else {
                await this.apiService.createPost(formData);
            }
            this.close();
            this.onSave();
        } catch (error) {
            console.error('Save failed:', error);
            alert('Kunne ikke gemme: ' + error.message);
        }
    }

    /**
     * Delete post
     */
    async delete() {
        if (!confirm('Er du sikker på at du vil slette dette opslag?')) return;

        try {
            await this.apiService.deletePost(this.currentPost.id);
            this.close();
            this.onDelete();
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Kunne ikke slette opslag');
        }
    }

    /**
     * Show/hide sidebar
     */
    show() {
        this.sidebar.classList.add('active');
        this.backdrop.classList.add('active');
    }

    close() {
        this.sidebar.classList.remove('active');
        this.backdrop.classList.remove('active');
    }

    /**
     * Helper methods
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}

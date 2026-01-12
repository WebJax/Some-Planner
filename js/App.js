/**
 * App - Main application class
 * Initializes and coordinates all components
 */
import { ApiService } from './ApiService.js';
import { Calendar } from './Calendar.js';
import { PostCard } from './PostCard.js';
import { TemplateManager } from './TemplateManager.js';
import { ShopInbox } from './ShopInbox.js';

export class App {
    constructor() {
        this.apiService = new ApiService();
        this.calendar = null;
        this.postCard = null;
        this.templateManager = null;
        this.shopInbox = null;
        
        this.init();
    }

    /**
     * Initialize application
     */
    async init() {
        // Check authentication
        try {
            const authStatus = await this.apiService.checkAuth();
            if (!authStatus.data.authenticated) {
                window.location.href = '/login.html';
                return;
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            window.location.href = '/login.html';
            return;
        }

        // Initialize components
        this.templateManager = new TemplateManager(this.apiService);
        this.shopInbox = new ShopInbox(this.apiService);

        // Initialize calendar
        const calendarContainer = document.getElementById('calendar');
        if (calendarContainer) {
            this.calendar = new Calendar(
                calendarContainer,
                this.apiService,
                (date) => this.handleDateClick(date),
                (postId) => this.handlePostClick(postId)
            );
        }

        // Initialize post card (sidebar)
        this.postCard = new PostCard(
            this.apiService,
            () => this.handlePostSave(),
            () => this.handlePostDelete()
        );

        // Setup header
        this.setupHeader();
    }

    /**
     * Setup header with user info and logout
     */
    setupHeader() {
        const userInfo = document.getElementById('userInfo');
        if (userInfo) {
            userInfo.innerHTML = `
                <span id="username"></span>
                <button class="btn btn-ghost btn-sm" id="logoutBtn">Log ud</button>
            `;

            document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        }
    }

    /**
     * Handle date click (create new post)
     */
    handleDateClick(date) {
        this.postCard.openNew(date);
    }

    /**
     * Handle post click (edit existing post)
     */
    handlePostClick(postId) {
        this.postCard.openEdit(postId);
    }

    /**
     * Handle post save
     */
    handlePostSave() {
        if (this.calendar) {
            this.calendar.refresh();
        }
    }

    /**
     * Handle post delete
     */
    handlePostDelete() {
        if (this.calendar) {
            this.calendar.refresh();
        }
    }

    /**
     * Logout
     */
    async logout() {
        try {
            await this.apiService.logout();
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Logout failed:', error);
            window.location.href = '/login.html';
        }
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new App();
    });
} else {
    window.app = new App();
}

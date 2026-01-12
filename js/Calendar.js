/**
 * Calendar - Handles calendar view and navigation
 */
export class Calendar {
    constructor(container, apiService, onDateClick, onPostClick) {
        this.container = container;
        this.apiService = apiService;
        this.onDateClick = onDateClick;
        this.onPostClick = onPostClick;
        this.currentDate = new Date();
        this.posts = [];
        
        this.init();
    }

    init() {
        this.render();
        this.loadPosts();
    }

    /**
     * Render calendar controls and grid
     */
    render() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const monthNames = [
            'Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni',
            'Juli', 'August', 'September', 'Oktober', 'November', 'December'
        ];

        this.container.innerHTML = `
            <div class="calendar-controls">
                <div>
                    <button class="btn btn-secondary btn-sm" id="prevMonth">← Forrige</button>
                    <button class="btn btn-secondary btn-sm" id="nextMonth">Næste →</button>
                    <button class="btn btn-ghost btn-sm" id="today">I dag</button>
                </div>
                <h2 class="calendar-title">${monthNames[month]} ${year}</h2>
                <button class="btn btn-primary" id="newPost">+ Nyt opslag</button>
            </div>
            <div class="calendar-grid" id="calendarGrid"></div>
        `;

        // Event listeners
        document.getElementById('prevMonth').addEventListener('click', () => this.previousMonth());
        document.getElementById('nextMonth').addEventListener('click', () => this.nextMonth());
        document.getElementById('today').addEventListener('click', () => this.goToToday());
        document.getElementById('newPost').addEventListener('click', () => this.onDateClick(new Date()));

        this.renderGrid();
    }

    /**
     * Render calendar grid
     */
    renderGrid() {
        const grid = document.getElementById('calendarGrid');
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday = 0
        
        const dayNames = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];
        
        let html = '';
        
        // Day headers
        dayNames.forEach(day => {
            html += `<div class="calendar-day-header">${day}</div>`;
        });
        
        // Empty cells before first day
        for (let i = 0; i < startingDayOfWeek; i++) {
            const prevMonthDate = new Date(year, month, -startingDayOfWeek + i + 1);
            html += this.renderDay(prevMonthDate, true);
        }
        
        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            html += this.renderDay(date, false);
        }
        
        // Fill remaining cells
        const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;
        const remainingCells = totalCells - (daysInMonth + startingDayOfWeek);
        for (let i = 1; i <= remainingCells; i++) {
            const nextMonthDate = new Date(year, month + 1, i);
            html += this.renderDay(nextMonthDate, true);
        }
        
        grid.innerHTML = html;
    }

    /**
     * Render single day cell
     */
    renderDay(date, isOtherMonth) {
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();
        const dateStr = this.formatDate(date);
        
        const dayPosts = this.posts.filter(post => post.date === dateStr);
        
        let classes = 'calendar-day';
        if (isOtherMonth) classes += ' other-month';
        if (isToday) classes += ' today';
        
        let postsHtml = '';
        dayPosts.forEach(post => {
            postsHtml += `
                <div class="post-card" data-post-id="${post.id}">
                    <div class="post-card-header">
                        <span class="post-card-type">${post.type}</span>
                        <span class="post-card-status status-${post.status}">${post.status}</span>
                    </div>
                    ${post.shop_name ? `<div class="post-card-shop">${post.shop_name}</div>` : ''}
                    ${post.caption ? `<div class="post-card-caption">${this.truncate(post.caption, 50)}</div>` : ''}
                    ${post.media_count > 0 ? `<div class="post-card-media-indicator">📷 ${post.media_count}</div>` : ''}
                </div>
            `;
        });
        
        return `
            <div class="${classes}" data-date="${dateStr}">
                <div class="calendar-day-number">${date.getDate()}</div>
                <div class="calendar-day-posts">${postsHtml}</div>
            </div>
        `;
    }

    /**
     * Load posts for current month
     */
    async loadPosts() {
        try {
            const year = this.currentDate.getFullYear();
            const month = this.currentDate.getMonth() + 1;
            
            const response = await this.apiService.getPosts({ year, month });
            this.posts = response.data || [];
            this.renderGrid();
            
            // Add click listeners to posts
            this.addPostClickListeners();
        } catch (error) {
            console.error('Failed to load posts:', error);
        }
    }

    /**
     * Add click listeners to post cards
     */
    addPostClickListeners() {
        document.querySelectorAll('.post-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                const postId = parseInt(card.dataset.postId);
                this.onPostClick(postId);
            });
        });
        
        // Add click listener to empty day cells
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.addEventListener('click', () => {
                const dateStr = day.dataset.date;
                const date = new Date(dateStr);
                this.onDateClick(date);
            });
        });
    }

    /**
     * Navigation methods
     */
    previousMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
        this.loadPosts();
    }

    nextMonth() {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
        this.loadPosts();
    }

    goToToday() {
        this.currentDate = new Date();
        this.render();
        this.loadPosts();
    }

    /**
     * Refresh calendar
     */
    refresh() {
        this.loadPosts();
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

    truncate(str, length) {
        if (!str) return '';
        if (str.length <= length) return str;
        return str.substring(0, length) + '...';
    }
}

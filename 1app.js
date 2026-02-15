// ============================================
// StreamVerse - Main Application
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const app = new StreamVerseApp();
    app.init();
});

class StreamVerseApp {
    constructor() {
        this.currentHeroSlide = 0;
        this.heroInterval = null;
        this.allContent = [];
    }

    async init() {
        await this.loadContent();
        this.initPreloader();
        this.initNavbar();
        this.initHero();
        this.initSearch();
        this.initSliders();
        this.initBackToTop();
        this.initAdminModal();
        this.initDetailModal();
        this.renderSections();
    }

    // ========== PRELOADER ==========
    initPreloader() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const preloader = document.getElementById('preloader');
                if (preloader) {
                    preloader.classList.add('hidden');
                }
            }, 1500);
        });

        // Fallback: hide after 3 seconds max
        setTimeout(() => {
            const preloader = document.getElementById('preloader');
            if (preloader) preloader.classList.add('hidden');
        }, 3000);
    }

    // ========== LOAD CONTENT ==========
    async loadContent() {
        try {
            if (isSupabaseConfigured() && supabase) {
                const { data, error } = await supabase
                    .from('contents')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (error) throw error;
                this.allContent = data || [];
            } else {
                this.allContent = await db.getAllContent();
            }
        } catch (error) {
            console.log('Loading from local storage:', error.message);
            this.allContent = await db.getAllContent();
        }
    }

    // ========== NAVBAR ==========
    initNavbar() {
        const navbar = document.getElementById('navbar');
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.getElementById('navLinks');

        // Scroll effect
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Mobile menu
        if (hamburger) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navLinks.classList.toggle('active');
            });

            // Close menu when clicking a link
            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navLinks.classList.remove('active');
                });
            });
        }
    }

    // ========== HERO SLIDER ==========
    initHero() {
        const featured = this.allContent.filter(c => c.featured);
        const heroSlider = document.getElementById('heroSlider');
        const heroDots = document.getElementById('heroDots');

        if (!heroSlider || featured.length === 0) {
            // Show a default hero if no featured content
            if (heroSlider && this.allContent.length > 0) {
                this.renderHeroSlides(this.allContent.slice(0, 3));
            }
            return;
        }

        this.renderHeroSlides(featured);
    }

    renderHeroSlides(items) {
        const heroSlider = document.getElementById('heroSlider');
        const heroDots = document.getElementById('heroDots');

        if (!heroSlider) return;

        heroSlider.innerHTML = '';
        if (heroDots) heroDots.innerHTML = '';

        items.forEach((item, index) => {
            // Slide
            const slide = document.createElement('div');
            slide.className = `hero-slide ${index === 0 ? 'active' : ''}`;
            slide.innerHTML = `
                <img class="hero-bg" src="${item.backdrop || item.poster}" alt="${item.title}" 
                     onerror="this.src='https://via.placeholder.com/1920x800/141414/666?text=${encodeURIComponent(item.title)}'">
                <div class="hero-overlay"></div>
                <div class="hero-info">
                    <div class="badge-group">
                        <span class="badge badge-primary">${item.type}</span>
                        <span class="badge badge-secondary">${item.quality || 'HD'}</span>
                        ${item.rating ? `<span class="badge badge-rating"><i class="fas fa-star"></i> ${item.rating}</span>` : ''}
                    </div>
                    <h1>${item.title}</h1>
                    <div class="meta">
                        <span><i class="fas fa-calendar"></i> ${item.year || 'N/A'}</span>
                        ${item.duration ? `<span><i class="fas fa-clock"></i> ${item.duration}</span>` : ''}
                        <span><i class="fas fa-eye"></i> ${this.formatViews(item.views || 0)}</span>
                    </div>
                    <p class="description">${item.description || ''}</p>
                    <div class="hero-buttons">
                        <button class="btn-play" onclick="app.playContent('${item.id}')">
                            <i class="fas fa-play"></i> Watch Now
                        </button>
                        <button class="btn-info" onclick="app.showDetail('${item.id}')">
                            <i class="fas fa-info-circle"></i> More Info
                        </button>
                    </div>
                </div>
            `;
            heroSlider.appendChild(slide);

            // Dot
            if (heroDots) {
                const dot = document.createElement('div');
                dot.className = `hero-dot ${index === 0 ? 'active' : ''}`;
                dot.addEventListener('click', () => this.goToHeroSlide(index));
                heroDots.appendChild(dot);
            }
        });

        // Auto-play
        if (items.length > 1) {
            this.startHeroAutoplay(items.length);

            // Controls
            const prevBtn = document.getElementById('heroPrev');
            const nextBtn = document.getElementById('heroNext');
            if (prevBtn) prevBtn.addEventListener('click', () => this.prevHeroSlide(items.length));
            if (nextBtn) nextBtn.addEventListener('click', () => this.nextHeroSlide(items.length));
        }
    }

    startHeroAutoplay(total) {
        this.heroInterval = setInterval(() => {
            this.nextHeroSlide(total);
        }, 6000);
    }

    goToHeroSlide(index) {
        const slides = document.querySelectorAll('.hero-slide');
        const dots = document.querySelectorAll('.hero-dot');

        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));

        if (slides[index]) slides[index].classList.add('active');
        if (dots[index]) dots[index].classList.add('active');

        this.currentHeroSlide = index;

        // Reset autoplay
        clearInterval(this.heroInterval);
        this.startHeroAutoplay(slides.length);
    }

    nextHeroSlide(total) {
        this.currentHeroSlide = (this.currentHeroSlide + 1) % total;
        this.goToHeroSlide(this.currentHeroSlide);
    }

    prevHeroSlide(total) {
        this.currentHeroSlide = (this.currentHeroSlide - 1 + total) % total;
        this.goToHeroSlide(this.currentHeroSlide);
    }

    // ========== SEARCH ==========
    initSearch() {
        const searchToggle = document.getElementById('searchToggle');
        const searchBox = document.getElementById('searchBox');
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');

        if (searchToggle) {
            searchToggle.addEventListener('click', () => {
                searchBox.classList.toggle('active');
                if (searchBox.classList.contains('active')) {
                    searchInput.focus();
                }
            });
        }

        if (searchInput) {
            let debounce;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounce);
                debounce = setTimeout(() => {
                    this.performSearch(e.target.value);
                }, 300);
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = e.target.value.trim();
                    if (query) {
                        window.location.href = `pages/search.html?q=${encodeURIComponent(query)}`;
                    }
                }
            });

            // Close search results when clicking outside
            document.addEventListener('click', (e) => {
                if (!searchBox.contains(e.target) && !searchToggle.contains(e.target)) {
                    searchResults.classList.remove('active');
                    searchBox.classList.remove('active');
                }
            });
        }
    }

    async performSearch(query) {
        const searchResults = document.getElementById('searchResults');
        if (!query.trim()) {
            searchResults.classList.remove('active');
            return;
        }

        const results = this.allContent.filter(c =>
            c.title.toLowerCase().includes(query.toLowerCase()) ||
            (c.genre && c.genre.some(g => g.toLowerCase().includes(query.toLowerCase())))
        ).slice(0, 8);

        if (results.length === 0) {
            searchResults.innerHTML = '<div class="search-result-item"><div class="info"><h4>No results found</h4><p>Try different keywords</p></div></div>';
        } else {
            searchResults.innerHTML = results.map(item => `
                <div class="search-result-item" onclick="app.showDetail('${item.id}')">
                    <img src="${item.poster}" alt="${item.title}" 
                         onerror="this.src='https://via.placeholder.com/45x65/333/fff?text=?'">
                    <div class="info">
                        <h4>${item.title}</h4>
                        <p>${item.type.charAt(0).toUpperCase() + item.type.slice(1)} • ${item.year || 'N/A'} ${item.rating ? '• ⭐ ' + item.rating : ''}</p>
                    </div>
                </div>
            `).join('');
        }

        searchResults.classList.add('active');
    }

    // ========== RENDER CONTENT SECTIONS ==========
    renderSections() {
        // Trending
        const trending = [...this.allContent].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 20);
        this.renderTrack('trendingTrack', trending);

        // Movies
        const movies = this.allContent.filter(c => c.type === 'movie');
        this.renderTrack('moviesTrack', movies);

        // Series
        const series = this.allContent.filter(c => c.type === 'series');
        this.renderTrack('seriesTrack', series);

        // Anime
        const anime = this.allContent.filter(c => c.type === 'anime');
        this.renderTrack('animeTrack', anime);

        // Cartoons
        const cartoons = this.allContent.filter(c => c.type === 'cartoon');
        this.renderTrack('cartoonTrack', cartoons);

        // Continue Watching
        this.renderContinueWatching();

        // Hide empty sections
        this.hideEmptySections();
    }

    renderTrack(trackId, items) {
        const track = document.getElementById(trackId);
        if (!track) return;

        if (items.length === 0) {
            track.innerHTML = '<div class="empty-state"><i class="fas fa-film"></i><h3>No content yet</h3><p>Check back soon!</p></div>';
            return;
        }

        track.innerHTML = items.map(item => this.createCard(item)).join('');
    }

    createCard(item) {
        return `
            <div class="content-card" onclick="app.showDetail('${item.id}')">
                <div class="card-poster">
                    <img src="${item.poster}" alt="${item.title}" loading="lazy"
                         onerror="this.src='https://via.placeholder.com/200x300/1a1a2e/e50914?text=${encodeURIComponent(item.title)}'">
                    <div class="card-overlay">
                        <div class="card-play-btn">
                            <i class="fas fa-play"></i>
                        </div>
                    </div>
                    <div class="card-badges">
                        <span class="card-quality">${item.quality || 'HD'}</span>
                        <span class="card-type">${item.type}</span>
                    </div>
                    ${item.rating ? `<div class="card-rating"><i class="fas fa-star"></i> ${item.rating}</div>` : ''}
                </div>
                <div class="card-info">
                    <h3>${item.title}</h3>
                    <div class="card-meta">
                        <span><i class="fas fa-calendar-alt"></i> ${item.year || 'N/A'}</span>
                        <span><i class="fas fa-eye"></i> ${this.formatViews(item.views || 0)}</span>
                    </div>
                </div>
            </div>
        `;
    }

    async renderContinueWatching() {
        const section = document.getElementById('continueSection');
        const track = document.getElementById('continueTrack');
        if (!section || !track) return;

        const history = await db.getWatchHistory();
        if (history.length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';
        const items = [];

        for (const entry of history.slice(0, 15)) {
            const content = this.allContent.find(c => c.id === entry.contentId);
            if (content) {
                items.push({ ...content, progress: entry.progress });
            }
        }

        if (items.length === 0) {
            section.style.display = 'none';
            return;
        }

        track.innerHTML = items.map(item => `
            <div class="content-card" onclick="app.playContent('${item.id}')">
                <div class="card-poster">
                    <img src="${item.poster}" alt="${item.title}" loading="lazy"
                         onerror="this.src='https://via.placeholder.com/200x300/1a1a2e/e50914?text=${encodeURIComponent(item.title)}'">
                    <div class="card-overlay">
                        <div class="card-play-btn">
                            <i class="fas fa-play"></i>
                        </div>
                    </div>
                    <div class="card-progress">
                        <div class="card-progress-bar" style="width: ${item.progress || 0}%"></div>
                    </div>
                </div>
                <div class="card-info">
                    <h3>${item.title}</h3>
                    <div class="card-meta">
                        <span><i class="fas fa-history"></i> ${item.progress || 0}%</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Clear history button
        const clearBtn = document.getElementById('clearHistory');
        if (clearBtn) {
            clearBtn.addEventListener('click', async () => {
                await db.clearWatchHistory();
                section.style.display = 'none';
                showToast('Watch history cleared', 'success');
            });
        }
    }

    hideEmptySections() {
        const sections = {
            'moviesSection': this.allContent.filter(c => c.type === 'movie').length,
            'seriesSection': this.allContent.filter(c => c.type === 'series').length,
            'animeSection': this.allContent.filter(c => c.type === 'anime').length,
            'cartoonSection': this.allContent.filter(c => c.type === 'cartoon').length,
        };

        for (const [id, count] of Object.entries(sections)) {
            const el = document.getElementById(id);
            if (el && count === 0) {
                // Keep section but show message
            }
        }
    }

    // ========== SLIDERS ==========
    initSliders() {
        document.querySelectorAll('.content-slider').forEach(slider => {
            const track = slider.querySelector('.slider-track');
            const prevBtn = slider.querySelector('.prev-btn');
            const nextBtn = slider.querySelector('.next-btn');

            if (!track) return;

            const scrollAmount = 650;

            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                });
            }

            // Touch/swipe support
            let isDown = false;
            let startX;
            let scrollLeft;

            track.addEventListener('mousedown', (e) => {
                isDown = true;
                startX = e.pageX - track.offsetLeft;
                scrollLeft = track.scrollLeft;
                track.style.cursor = 'grabbing';
            });

            track.addEventListener('mouseleave', () => {
                isDown = false;
                track.style.cursor = 'grab';
            });

            track.addEventListener('mouseup', () => {
                isDown = false;
                track.style.cursor = 'grab';
            });

            track.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - track.offsetLeft;
                const walk = (x - startX) * 2;
                track.scrollLeft = scrollLeft - walk;
            });
        });
    }

    // ========== BACK TO TOP ==========
    initBackToTop() {
        const btn = document.getElementById('backToTop');
        if (!btn) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        });

        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ========== ADMIN MODAL ==========
    initAdminModal() {
        const adminBtn = document.getElementById('adminBtn');
        const adminModal = document.getElementById('adminModal');
        const modalClose = document.getElementById('modalClose');
        const loginForm = document.getElementById('adminLoginForm');

        if (adminBtn) {
            adminBtn.addEventListener('click', () => {
                if (auth.getIsAdmin()) {
                    window.location.href = 'pages/admin.html';
                } else {
                    adminModal.classList.add('active');
                }
            });
        }

        if (modalClose) {
            modalClose.addEventListener('click', () => {
                adminModal.classList.remove('active');
            });
        }

        if (adminModal) {
            adminModal.addEventListener('click', (e) => {
                if (e.target === adminModal) {
                    adminModal.classList.remove('active');
                }
            });
        }

        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('adminEmail').value;
                const password = document.getElementById('adminPassword').value;
                const errorEl = document.getElementById('loginError');

                const result = await auth.login(email, password);

                if (result.success) {
                    showToast('Welcome, Admin!', 'success');
                    adminModal.classList.remove('active');
                    setTimeout(() => {
                        window.location.href = 'pages/admin.html';
                    }, 500);
                } else {
                    errorEl.textContent = result.message || 'Invalid credentials';
                    setTimeout(() => { errorEl.textContent = ''; }, 3000);
                }
            });
        }
    }

    // ========== DETAIL MODAL ==========
    initDetailModal() {
        const detailModal = document.getElementById('detailModal');
        const detailClose = detailModal ? detailModal.querySelector('.detail-close') : null;

        if (detailClose) {
            detailClose.addEventListener('click', () => {
                detailModal.classList.remove('active');
            });
        }

        if (detailModal) {
            detailModal.addEventListener('click', (e) => {
                if (e.target === detailModal) {
                    detailModal.classList.remove('active');
                }
            });
        }
    }

    showDetail(id) {
        const item = this.allContent.find(c => c.id === id);
        if (!item) return;

        const modal = document.getElementById('detailModal');
        const content = document.getElementById('detailContent');

        if (!modal || !content) return;

        const genreTags = (item.genre || []).map(g => `<span class="genre-tag">${g}</span>`).join('');

        let episodesHTML = '';
        if (item.seasons && item.seasons.length > 0) {
            const seasonOptions = item.seasons.map(s =>
                `<option value="${s.season}">Season ${s.season}</option>`
            ).join('');

            const firstSeason = item.seasons[0];
            const episodesList = (firstSeason.episodes || []).map(ep => `
                <div class="episode-item" onclick="app.playEpisode('${item.id}', ${firstSeason.season}, ${ep.episode})">
                    <span class="episode-num">${ep.episode}</span>
                    <div class="episode-info">
                        <h4>${ep.title || 'Episode ' + ep.episode}</h4>
                        <p>${ep.duration || ''}</p>
                    </div>
                    <div class="episode-play"><i class="fas fa-play"></i></div>
                </div>
            `).join('');

            episodesHTML = `
                <div class="episodes-section">
                    <h3>Episodes</h3>
                    <div class="season-selector">
                        <select onchange="app.changeSeason('${item.id}', this.value)">
                            ${seasonOptions}
                        </select>
                    </div>
                    <div class="episode-list" id="episodeList">
                        ${episodesList}
                    </div>
                </div>
            `;
        }

        content.innerHTML = `
            <div class="detail-backdrop">
                <img src="${item.backdrop || item.poster}" alt="${item.title}"
                     onerror="this.src='https://via.placeholder.com/900x350/141414/666?text=${encodeURIComponent(item.title)}'">
                <div class="detail-backdrop-overlay"></div>
            </div>
            <div class="detail-body">
                <div class="detail-top">
                    <div class="detail-poster">
                        <img src="${item.poster}" alt="${item.title}"
                             onerror="this.src='https://via.placeholder.com/160x240/1a1a2e/e50914?text=${encodeURIComponent(item.title)}'">
                    </div>
                    <div class="detail-info">
                        <h1>${item.title}</h1>
                        <div class="detail-meta">
                            <span><i class="fas fa-calendar"></i> ${item.year || 'N/A'}</span>
                            ${item.duration ? `<span><i class="fas fa-clock"></i> ${item.duration}</span>` : ''}
                            ${item.rating ? `<span><i class="fas fa-star" style="color: var(--accent)"></i> ${item.rating}/10</span>` : ''}
                            <span><i class="fas fa-eye"></i> ${this.formatViews(item.views || 0)} views</span>
                            <span class="badge badge-primary">${item.type}</span>
                            <span class="badge badge-secondary">${item.quality || 'HD'}</span>
                        </div>
                        <div class="detail-genres">${genreTags}</div>
                        <div class="detail-actions">
                            <button class="btn-play" onclick="app.playContent('${item.id}')">
                                <i class="fas fa-play"></i> Watch Now
                            </button>
                        </div>
                    </div>
                </div>
                <p class="detail-description">${item.description || 'No description available.'}</p>
                ${episodesHTML}
            </div>
        `;

        modal.classList.add('active');

        // Increment views
        db.incrementViews(item.id);
    }

    changeSeason(contentId, seasonNum) {
        const item = this.allContent.find(c => c.id === contentId);
        if (!item || !item.seasons) return;

        const season = item.seasons.find(s => s.season == seasonNum);
        if (!season) return;

        const episodeList = document.getElementById('episodeList');
        if (!episodeList) return;

        episodeList.innerHTML = (season.episodes || []).map(ep => `
            <div class="episode-item" onclick="app.playEpisode('${item.id}', ${season.season}, ${ep.episode})">
                <span class="episode-num">${ep.episode}</span>
                <div class="episode-info">
                    <h4>${ep.title || 'Episode ' + ep.episode}</h4>
                    <p>${ep.duration || ''}</p>
                </div>
                <div class="episode-play"><i class="fas fa-play"></i></div>
            </div>
        `).join('');
    }

    // ========== PLAY CONTENT ==========
    playContent(id) {
        const item = this.allContent.find(c => c.id === id);
        if (!item) return;

        // Store content info for player page
        sessionStorage.setItem('streamverse_player', JSON.stringify(item));

        // Add to watch history
        db.addToWatchHistory(id, 10);

        // Navigate to player
        const isHomePage = !window.location.pathname.includes('/pages/');
        const playerUrl = isHomePage ? 'pages/player.html' : 'player.html';
        window.location.href = `${playerUrl}?id=${id}`;
    }

    playEpisode(contentId, season, episode) {
        const item = this.allContent.find(c => c.id === contentId);
        if (!item) return;

        const seasonData = item.seasons ? item.seasons.find(s => s.season == season) : null;
        const episodeData = seasonData ? seasonData.episodes.find(e => e.episode == episode) : null;

        const playerData = {
            ...item,
            currentSeason: season,
            currentEpisode: episode,
            currentVideoUrl: episodeData ? episodeData.video_url : '',
            episodeTitle: episodeData ? episodeData.title : ''
        };

        sessionStorage.setItem('streamverse_player', JSON.stringify(playerData));
        db.addToWatchHistory(contentId, 5);

        const isHomePage = !window.location.pathname.includes('/pages/');
        const playerUrl = isHomePage ? 'pages/player.html' : 'player.html';
        window.location.href = `${playerUrl}?id=${contentId}&s=${season}&e=${episode}`;
    }

    // ========== UTILITY ==========
    formatViews(views) {
        if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
        if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
        return views.toString();
    }
}

// ========== TOAST NOTIFICATION ==========
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle'
    };

    toast.innerHTML = `<i class="${icons[type] || icons.info}"></i> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Make app globally accessible
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new StreamVerseApp();
    app.init();
});
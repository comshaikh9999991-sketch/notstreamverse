// ============================================
// StreamVerse - Admin Module
// ============================================

let episodeCount = 0;
let editingId = null;

document.addEventListener('DOMContentLoaded', () => {
    // Check admin auth
    if (!auth.getIsAdmin()) {
        window.location.href = '../index.html';
        return;
    }

    initAdmin();
});

function initAdmin() {
    loadContentTable();
    loadStats();
    addEpisodeField(); // Add first episode field

    // Upload form
    const form = document.getElementById('uploadForm');
    if (form) {
        form.addEventListener('submit', handleUpload);
    }

    // Manage search/filter
    const searchInput = document.getElementById('manageSearch');
    const filterSelect = document.getElementById('manageFilter');

    if (searchInput) {
        searchInput.addEventListener('input', () => filterTable());
    }
    if (filterSelect) {
        filterSelect.addEventListener('change', () => filterTable());
    }
}

// ========== TAB SWITCHING ==========
function switchTab(tab) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));

    event.target.closest('.admin-tab').classList.add('active');
    const panel = document.getElementById(`panel-${tab}`);
    if (panel) panel.classList.add('active');

    if (tab === 'manage') loadContentTable();
    if (tab === 'stats') loadStats();
}

// ========== TOGGLE EPISODE SECTION ==========
function toggleEpisodeSection() {
    const type = document.getElementById('contentType').value;
    const movieSection = document.getElementById('movieVideoSection');
    const episodeSection = document.getElementById('episodeSection');

    if (type === 'movie') {
        movieSection.style.display = 'block';
        episodeSection.style.display = 'none';
    } else if (type === 'series' || type === 'anime' || type === 'cartoon') {
        movieSection.style.display = 'none';
        episodeSection.style.display = 'block';
    } else {
        movieSection.style.display = 'block';
        episodeSection.style.display = 'none';
    }
}

// ========== EPISODE FIELDS ==========
function addEpisodeField() {
    episodeCount++;
    const container = document.getElementById('episodesList');

    const div = document.createElement('div');
    div.className = 'episode-form-group';
    div.id = `episode-${episodeCount}`;
    div.innerHTML = `
        <button type="button" class="remove-episode" onclick="removeEpisode(${episodeCount})">
            <i class="fas fa-times"></i>
        </button>
        <div class="form-row">
            <div class="form-group">
                <label>Episode ${episodeCount} Title</label>
                <input type="text" class="ep-title" placeholder="Episode title">
            </div>
            <div class="form-group">
                <label>Duration</label>
                <input type="text" class="ep-duration" placeholder="24min">
            </div>
        </div>
        <div class="form-group">
            <label><i class="fas fa-link"></i> Video URL</label>
            <input type="url" class="ep-video" placeholder="Google Drive link, YouTube, or direct video URL">
        </div>
    `;
    container.appendChild(div);
}

function removeEpisode(id) {
    const el = document.getElementById(`episode-${id}`);
    if (el) el.remove();
}

// ========== HANDLE UPLOAD ==========
async function handleUpload(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    submitBtn.disabled = true;

    try {
        const type = document.getElementById('contentType').value;
        const genreStr = document.getElementById('contentGenre').value;
        const genres = genreStr ? genreStr.split(',').map(g => g.trim()).filter(g => g) : [];

        const content = {
            title: document.getElementById('contentTitle').value.trim(),
            type: type,
            year: parseInt(document.getElementById('contentYear').value) || null,
            rating: parseFloat(document.getElementById('contentRating').value) || null,
            quality: document.getElementById('contentQuality').value,
            duration: document.getElementById('contentDuration').value.trim() || null,
            genre: genres,
            description: document.getElementById('contentDescription').value.trim(),
            poster: document.getElementById('contentPoster').value.trim(),
            backdrop: document.getElementById('contentBackdrop').value.trim() || null,
            featured: document.getElementById('contentFeatured').checked,
        };

        if (type === 'movie') {
            content.video_url = document.getElementById('contentVideo').value.trim();
        } else {
            // Collect episodes
            const seasonNum = parseInt(document.getElementById('seasonNumber').value) || 1;
            const episodeForms = document.querySelectorAll('.episode-form-group');
            const episodes = [];

            episodeForms.forEach((form, index) => {
                const title = form.querySelector('.ep-title').value.trim();
                const duration = form.querySelector('.ep-duration').value.trim();
                const videoUrl = form.querySelector('.ep-video').value.trim();

                episodes.push({
                    episode: index + 1,
                    title: title || `Episode ${index + 1}`,
                    duration: duration || '',
                    video_url: videoUrl || ''
                });
            });

            content.seasons = [{
                season: seasonNum,
                episodes: episodes
            }];
        }

        // Validate
        if (!content.title || !content.type || !content.poster) {
            throw new Error('Please fill in all required fields (Title, Type, Poster)');
        }

        // Save
        if (editingId) {
            await db.updateContent(editingId, content);
            showToast('Content updated successfully!', 'success');
            editingId = null;
            submitBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Upload Content';
        } else {
            await db.addContent(content);
            showToast('Content uploaded successfully!', 'success');
        }

        // Reset form
        e.target.reset();
        document.getElementById('episodesList').innerHTML = '';
        episodeCount = 0;
        addEpisodeField();
        toggleEpisodeSection();
        loadContentTable();
        loadStats();

    } catch (error) {
        showToast(error.message || 'Upload failed', 'error');
    } finally {
        submitBtn.disabled = false;
        if (!editingId) {
            submitBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Upload Content';
        }
    }
}

// ========== CONTENT TABLE ==========
async function loadContentTable() {
    const tbody = document.getElementById('contentTableBody');
    if (!tbody) return;

    const contents = await db.getAllContent();

    if (contents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--text-muted);">No content uploaded yet</td></tr>';
        return;
    }

    tbody.innerHTML = contents.map(item => `
        <tr>
            <td>
                <img src="${item.poster}" alt="${item.title}" class="table-poster"
                     onerror="this.src='https://via.placeholder.com/50x70/333/fff?text=?'">
            </td>
            <td><strong>${item.title}</strong></td>
            <td><span class="badge badge-primary" style="font-size:0.7rem;">${item.type}</span></td>
            <td>${item.year || '-'}</td>
            <td>${item.rating ? '⭐ ' + item.rating : '-'}</td>
            <td>${formatViews(item.views || 0)}</td>
            <td>
                <div class="table-actions">
                    <button class="table-btn edit" onclick="editContent('${item.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="table-btn delete" onclick="deleteContent('${item.id}', '${item.title.replace(/'/g, "\\'")}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function filterTable() {
    const search = (document.getElementById('manageSearch').value || '').toLowerCase();
    const filter = document.getElementById('manageFilter').value;
    const rows = document.querySelectorAll('#contentTableBody tr');

    rows.forEach(row => {
        const title = (row.querySelector('strong')?.textContent || '').toLowerCase();
        const type = (row.querySelector('.badge')?.textContent || '').toLowerCase();
        const matchSearch = title.includes(search);
        const matchFilter = filter === 'all' || type === filter;
        row.style.display = matchSearch && matchFilter ? '' : 'none';
    });
}

// ========== EDIT CONTENT ==========
async function editContent(id) {
    const content = await db.getContentById(id);
    if (!content) return;

    editingId = id;

    // Switch to upload tab
    switchTabDirect('upload');

    // Fill form
    document.getElementById('contentTitle').value = content.title;
    document.getElementById('contentType').value = content.type;
    document.getElementById('contentYear').value = content.year || '';
    document.getElementById('contentRating').value = content.rating || '';
    document.getElementById('contentQuality').value = content.quality || 'HD';
    document.getElementById('contentDuration').value = content.duration || '';
    document.getElementById('contentGenre').value = (content.genre || []).join(', ');
    document.getElementById('contentDescription').value = content.description || '';
    document.getElementById('contentPoster').value = content.poster || '';
    document.getElementById('contentBackdrop').value = content.backdrop || '';
    document.getElementById('contentFeatured').checked = content.featured || false;

    toggleEpisodeSection();

    if (content.type === 'movie') {
        document.getElementById('contentVideo').value = content.video_url || '';
    } else if (content.seasons && content.seasons.length > 0) {
        const season = content.seasons[0];
        document.getElementById('seasonNumber').value = season.season;

        // Clear existing episodes
        document.getElementById('episodesList').innerHTML = '';
        episodeCount = 0;

        // Add episode fields
        (season.episodes || []).forEach(ep => {
            addEpisodeField();
            const lastGroup = document.querySelector('.episode-form-group:last-child');
            if (lastGroup) {
                lastGroup.querySelector('.ep-title').value = ep.title || '';
                lastGroup.querySelector('.ep-duration').value = ep.duration || '';
                lastGroup.querySelector('.ep-video').value = ep.video_url || '';
            }
        });
    }

    // Update button
    document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save"></i> Update Content';
    showToast('Editing: ' + content.title, 'info');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchTabDirect(tab) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
    document.querySelector(`.admin-tab:first-child`).classList.add('active');
    const panel = document.getElementById(`panel-${tab}`);
    if (panel) panel.classList.add('active');
}

// ========== DELETE CONTENT ==========
async function deleteContent(id, title) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
        await db.deleteContent(id);
        showToast(`"${title}" deleted successfully`, 'success');
        loadContentTable();
        loadStats();
    } catch (error) {
        showToast('Delete failed: ' + error.message, 'error');
    }
}

// ========== STATS ==========
async function loadStats() {
    const contents = await db.getAllContent();

    const totalViews = contents.reduce((sum, c) => sum + (c.views || 0), 0);
    const movies = contents.filter(c => c.type === 'movie').length;
    const anime = contents.filter(c => c.type === 'anime').length;

    const setEl = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    setEl('statTotal', contents.length);
    setEl('statViews', formatViews(totalViews));
    setEl('statMovies', movies);
    setEl('statAnime', anime);
}

// ========== LOGOUT ==========
async function logout() {
    await auth.logout();
    showToast('Logged out', 'info');
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 500);
}

// ========== UTILITIES ==========
function formatViews(views) {
    if (views >= 1000000) return (views / 1000000).toFixed(1) + 'M';
    if (views >= 1000) return (views / 1000).toFixed(1) + 'K';
    return views.toString();
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icons = { success: 'fas fa-check-circle', error: 'fas fa-exclamation-circle', info: 'fas fa-info-circle' };
    toast.innerHTML = `<i class="${icons[type] || icons.info}"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('removing'); setTimeout(() => toast.remove(), 300); }, 3000);
}
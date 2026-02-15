<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Now Playing - StreamVerse</title>
    <link rel="stylesheet" href="../css/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar scrolled">
        <div class="nav-container">
            <a href="../index.html" class="logo">
                <i class="fas fa-play-circle"></i>
                <span>Stream<span class="accent">Verse</span></span>
            </a>
            <ul class="nav-links" id="navLinks">
                <li><a href="../index.html"><i class="fas fa-home"></i> Home</a></li>
                <li><a href="browse.html?type=movie"><i class="fas fa-film"></i> Movies</a></li>
                <li><a href="browse.html?type=series"><i class="fas fa-tv"></i> Series</a></li>
                <li><a href="browse.html?type=anime"><i class="fas fa-dragon"></i> Anime</a></li>
                <li><a href="browse.html?type=cartoon"><i class="fas fa-hat-wizard"></i> Cartoons</a></li>
            </ul>
            <div class="nav-right">
                <button class="hamburger" id="hamburger">
                    <span></span><span></span><span></span>
                </button>
            </div>
        </div>
    </nav>

    <div class="player-container" id="playerContainer">
        <div class="video-wrapper" id="videoWrapper">
            <div class="empty-state" style="height:100%; display:flex; align-items:center; justify-content:center; flex-direction:column;">
                <i class="fas fa-spinner fa-spin" style="font-size:3rem; color: var(--primary); opacity:0.5;"></i>
                <h3 style="margin-top:15px;">Loading player...</h3>
            </div>
        </div>

        <div class="server-section" id="serverSection" style="display:none;">
            <h3><i class="fas fa-server"></i> Select Server</h3>
            <div class="server-list" id="serverList"></div>
        </div>

        <div class="player-info" id="playerInfo"></div>

        <!-- Episodes for series -->
        <div id="playerEpisodes" style="margin-top:30px;"></div>
    </div>

    <footer class="footer" style="margin-top:40px;">
        <div class="footer-bottom">
            <p>&copy; 2024 StreamVerse. All rights reserved.</p>
        </div>
    </footer>

    <div class="toast-container" id="toastContainer"></div>

    <script src="../js/supabase-config.js"></script>
    <script src="../js/auth.js"></script>
    <script>
        // Toast function
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

        // Mobile menu
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.getElementById('navLinks');
        if (hamburger) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navLinks.classList.toggle('active');
            });
        }

        // Load player
        document.addEventListener('DOMContentLoaded', () => {
            const playerData = JSON.parse(sessionStorage.getItem('streamverse_player') || 'null');
            const params = new URLSearchParams(window.location.search);
            const contentId = params.get('id');

            if (!playerData && !contentId) {
                document.getElementById('videoWrapper').innerHTML = `
                    <div class="empty-state" style="height:100%; display:flex; align-items:center; justify-content:center; flex-direction:column;">
                        <i class="fas fa-exclamation-triangle" style="font-size:3rem; color: var(--accent); opacity:0.5;"></i>
                        <h3 style="margin-top:15px;">Content not found</h3>
                        <p>Please go back and select something to watch.</p>
                        <a href="../index.html" class="btn-play" style="margin-top:20px; text-decoration:none;">
                            <i class="fas fa-home"></i> Go Home
                        </a>
                    </div>
                `;
                return;
            }

            let data = playerData;
            if (!data && contentId) {
                // Try to find from local DB
                const allContent = JSON.parse(localStorage.getItem('streamverse_data') || '{}').contents || [];
                data = allContent.find(c => c.id === contentId);
            }

            if (!data) return;

            // Update document title
            document.title = `${data.title} - StreamVerse`;

            // Determine video URL
            let videoUrl = data.currentVideoUrl || data.video_url || '';

            // Render video
            const videoWrapper = document.getElementById('videoWrapper');

            if (videoUrl) {
                // Check if it's a YouTube embed, Google Drive, or direct video
                if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                    // Ensure it's an embed URL
                    if (!videoUrl.includes('/embed/')) {
                        const videoId = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
                        if (videoId) {
                            videoUrl = `https://www.youtube.com/embed/${videoId[1]}`;
                        }
                    }
                    videoWrapper.innerHTML = `<iframe src="${videoUrl}" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" frameborder="0"></iframe>`;
                } else if (videoUrl.includes('drive.google.com')) {
                    // Google Drive embed
                    const fileId = videoUrl.match(/\/d\/([^\/]+)/);
                    if (fileId) {
                        videoWrapper.innerHTML = `<iframe src="https://drive.google.com/file/d/${fileId[1]}/preview" allowfullscreen frameborder="0"></iframe>`;
                    } else {
                        videoWrapper.innerHTML = `<iframe src="${videoUrl}" allowfullscreen frameborder="0"></iframe>`;
                    }
                } else if (videoUrl.includes('mega.nz')) {
                    videoWrapper.innerHTML = `<iframe src="${videoUrl}" allowfullscreen frameborder="0"></iframe>`;
                } else if (videoUrl.match(/\.(mp4|webm|ogg|mkv)$/i)) {
                    videoWrapper.innerHTML = `
                        <video controls autoplay>
                            <source src="${videoUrl}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    `;
                } else {
                    // Generic iframe embed
                    videoWrapper.innerHTML = `<iframe src="${videoUrl}" allowfullscreen frameborder="0"></iframe>`;
                }
            } else {
                videoWrapper.innerHTML = `
                    <div class="empty-state" style="height:100%; display:flex; align-items:center; justify-content:center; flex-direction:column;">
                        <i class="fas fa-video-slash" style="font-size:3rem; color: var(--primary); opacity:0.3;"></i>
                        <h3 style="margin-top:15px;">Video not available yet</h3>
                        <p>The video link hasn't been added. Check back later!</p>
                    </div>
                `;
            }

            // Player info
            const playerInfo = document.getElementById('playerInfo');
            let titleText = data.title;
            if (data.currentSeason && data.currentEpisode) {
                titleText += ` - S${data.currentSeason}E${data.currentEpisode}`;
                if (data.episodeTitle) titleText += `: ${data.episodeTitle}`;
            }

            playerInfo.innerHTML = `
                <h1>${titleText}</h1>
                <div class="player-meta">
                    <span><i class="fas fa-calendar"></i> ${data.year || 'N/A'}</span>
                    ${data.duration ? `<span><i class="fas fa-clock"></i> ${data.duration}</span>` : ''}
                    ${data.rating ? `<span><i class="fas fa-star" style="color: var(--accent);"></i> ${data.rating}/10</span>` : ''}
                    <span class="badge badge-primary">${data.type}</span>
                    <span class="badge badge-secondary">${data.quality || 'HD'}</span>
                </div>
                <p class="player-description">${data.description || ''}</p>
            `;

            // Episodes for series/anime/cartoon
            if (data.seasons && data.seasons.length > 0) {
                const playerEpisodes = document.getElementById('playerEpisodes');
                const currentSeason = data.currentSeason || data.seasons[0].season;

                const seasonOptions = data.seasons.map(s =>
                    `<option value="${s.season}" ${s.season == currentSeason ? 'selected' : ''}>Season ${s.season}</option>`
                ).join('');

                const renderEpisodes = (seasonNum) => {
                    const season = data.seasons.find(s => s.season == seasonNum);
                    if (!season) return '';
                    return (season.episodes || []).map(ep => `
                        <div class="episode-item ${data.currentEpisode == ep.episode && data.currentSeason == seasonNum ? 'style="border-color: var(--primary);"' : ''}"
                             onclick="playEp('${data.id}', ${seasonNum}, ${ep.episode})">
                            <span class="episode-num">${ep.episode}</span>
                            <div class="episode-info">
                                <h4>${ep.title || 'Episode ' + ep.episode}</h4>
                                <p>${ep.duration || ''}</p>
                            </div>
                            <div class="episode-play"><i class="fas fa-play"></i></div>
                        </div>
                    `).join('');
                };

                playerEpisodes.innerHTML = `
                    <div class="episodes-section">
                        <h3><i class="fas fa-list"></i> Episodes</h3>
                        <div class="season-selector">
                            <select id="seasonSelect" onchange="updateEpisodeList()">
                                ${seasonOptions}
                            </select>
                        </div>
                        <div class="episode-list" id="epList">
                            ${renderEpisodes(currentSeason)}
                        </div>
                    </div>
                `;

                // Make functions available globally
                window.playEp = function(id, season, episode) {
                    const seasonData = data.seasons.find(s => s.season == season);
                    const episodeData = seasonData ? seasonData.episodes.find(e => e.episode == episode) : null;
                    if (episodeData && episodeData.video_url) {
                        data.currentSeason = season;
                        data.currentEpisode = episode;
                        data.currentVideoUrl = episodeData.video_url;
                        data.episodeTitle = episodeData.title;
                        sessionStorage.setItem('streamverse_player', JSON.stringify(data));
                        window.location.reload();
                    } else {
                        showToast('Video not available for this episode yet', 'error');
                    }
                };

                window.updateEpisodeList = function() {
                    const seasonNum = document.getElementById('seasonSelect').value;
                    document.getElementById('epList').innerHTML = renderEpisodes(seasonNum);
                };
            }

            // Add to watch history
            db.addToWatchHistory(data.id, 10);
        });
    </script>
</body>
</html>
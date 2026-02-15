// ============================================
// StreamVerse - Supabase Configuration
// ============================================
// 
// SETUP INSTRUCTIONS:
// 1. Go to https://supabase.com and create a free account
// 2. Create a new project
// 3. Go to Settings > API and copy your URL and anon key
// 4. Replace the values below
// 5. Run the SQL in the Supabase SQL Editor (provided below)
//

const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // e.g., https://xxxx.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Admin credentials - change these!
const ADMIN_EMAIL = 'admin@streamverse.com';
const ADMIN_PASSWORD = 'YourSecurePassword123!';

// Initialize Supabase
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Check if Supabase is configured
const isSupabaseConfigured = () => {
    return SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
};

// ============================================
// LOCAL STORAGE FALLBACK (Works without Supabase)
// ============================================
class LocalDB {
    constructor() {
        this.storageKey = 'streamverse_data';
        this.init();
    }

    init() {
        if (!localStorage.getItem(this.storageKey)) {
            const defaultData = {
                contents: this.getDefaultContent(),
                watchHistory: []
            };
            localStorage.setItem(this.storageKey, JSON.stringify(defaultData));
        }
    }

    getData() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey)) || { contents: [], watchHistory: [] };
        } catch (e) {
            return { contents: [], watchHistory: [] };
        }
    }

    saveData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    // Get all content
    async getAllContent() {
        return this.getData().contents;
    }

    // Get content by type
    async getContentByType(type) {
        const data = this.getData();
        return data.contents.filter(c => c.type === type);
    }

    // Get content by ID
    async getContentById(id) {
        const data = this.getData();
        return data.contents.find(c => c.id === id);
    }

    // Search content
    async searchContent(query) {
        const data = this.getData();
        const q = query.toLowerCase();
        return data.contents.filter(c =>
            c.title.toLowerCase().includes(q) ||
            c.genre.some(g => g.toLowerCase().includes(q)) ||
            c.type.toLowerCase().includes(q)
        );
    }

    // Get featured/trending content
    async getFeatured() {
        const data = this.getData();
        return data.contents.filter(c => c.featured).slice(0, 5);
    }

    // Get trending content
    async getTrending() {
        const data = this.getData();
        return data.contents.sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 15);
    }

    // Add content (admin only)
    async addContent(content) {
        const data = this.getData();
        content.id = 'sv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        content.created_at = new Date().toISOString();
        content.views = 0;
        data.contents.unshift(content);
        this.saveData(data);
        return content;
    }

    // Update content
    async updateContent(id, updates) {
        const data = this.getData();
        const index = data.contents.findIndex(c => c.id === id);
        if (index !== -1) {
            data.contents[index] = { ...data.contents[index], ...updates };
            this.saveData(data);
            return data.contents[index];
        }
        return null;
    }

    // Delete content
    async deleteContent(id) {
        const data = this.getData();
        data.contents = data.contents.filter(c => c.id !== id);
        this.saveData(data);
        return true;
    }

    // Increment views
    async incrementViews(id) {
        const data = this.getData();
        const content = data.contents.find(c => c.id === id);
        if (content) {
            content.views = (content.views || 0) + 1;
            this.saveData(data);
        }
    }

    // Watch history
    async addToWatchHistory(contentId, progress) {
        const data = this.getData();
        const existing = data.watchHistory.findIndex(w => w.contentId === contentId);
        if (existing !== -1) {
            data.watchHistory[existing].progress = progress;
            data.watchHistory[existing].updatedAt = new Date().toISOString();
        } else {
            data.watchHistory.push({
                contentId,
                progress,
                updatedAt: new Date().toISOString()
            });
        }
        this.saveData(data);
    }

    async getWatchHistory() {
        const data = this.getData();
        return data.watchHistory.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    }

    async clearWatchHistory() {
        const data = this.getData();
        data.watchHistory = [];
        this.saveData(data);
    }

    // Filter by genre
    async getContentByGenre(genre) {
        const data = this.getData();
        return data.contents.filter(c =>
            c.genre.some(g => g.toLowerCase() === genre.toLowerCase())
        );
    }

    // Default demo content
    getDefaultContent() {
        return [
            {
                id: 'demo_1',
                title: 'Inception',
                type: 'movie',
                year: 2010,
                rating: 8.8,
                quality: '4K',
                duration: '2h 28min',
                genre: ['Action', 'Sci-Fi', 'Thriller'],
                description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
                poster: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
                backdrop: 'https://image.tmdb.org/t/p/original/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
                video_url: 'https://www.youtube.com/embed/YoHD9XEInc0',
                featured: true,
                views: 15420,
                created_at: '2024-01-01'
            },
            {
                id: 'demo_2',
                title: 'Breaking Bad',
                type: 'series',
                year: 2008,
                rating: 9.5,
                quality: 'HD',
                genre: ['Drama', 'Crime', 'Thriller'],
                description: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine to secure his family\'s future.',
                poster: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
                backdrop: 'https://image.tmdb.org/t/p/original/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
                featured: true,
                views: 23100,
                seasons: [
                    {
                        season: 1,
                        episodes: [
                            { episode: 1, title: 'Pilot', video_url: 'https://www.youtube.com/embed/HhesaQXLuRY', duration: '58min' },
                            { episode: 2, title: 'Cat\'s in the Bag...', video_url: '', duration: '48min' },
                            { episode: 3, title: '...And the Bag\'s in the River', video_url: '', duration: '48min' }
                        ]
                    }
                ],
                created_at: '2024-01-02'
            },
            {
                id: 'demo_3',
                title: 'Attack on Titan',
                type: 'anime',
                year: 2013,
                rating: 9.0,
                quality: 'HD',
                genre: ['Action', 'Fantasy', 'Drama'],
                description: 'After his hometown is destroyed and his mother is killed, young Eren Yeager vows to cleanse the earth of the giant humanoid Titans that have brought humanity to the brink of extinction.',
                poster: 'https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg',
                backdrop: 'https://image.tmdb.org/t/p/original/sHim6U0ANsbzxcmNSoGH0Bsvqjf.jpg',
                featured: true,
                views: 31000,
                seasons: [
                    {
                        season: 1,
                        episodes: [
                            { episode: 1, title: 'To You, in 2000 Years', video_url: 'https://www.youtube.com/embed/MGRm4IzadSg', duration: '24min' },
                            { episode: 2, title: 'That Day', video_url: '', duration: '24min' }
                        ]
                    }
                ],
                created_at: '2024-01-03'
            },
            {
                id: 'demo_4',
                title: 'SpongeBob SquarePants',
                type: 'cartoon',
                year: 1999,
                rating: 8.2,
                quality: 'HD',
                genre: ['Comedy', 'Animation', 'Family'],
                description: 'The misadventures of a talking sea sponge who works at a fast food restaurant, attends a boating school, and lives in a pineapple under the sea.',
                poster: 'https://image.tmdb.org/t/p/w500/amvtZgiTty0GHIgD56gpouBWrcy.jpg',
                backdrop: 'https://image.tmdb.org/t/p/original/qZMYrg82bw1cV1yxJAKiinhWvjn.jpg',
                featured: false,
                views: 18700,
                seasons: [
                    {
                        season: 1,
                        episodes: [
                            { episode: 1, title: 'Help Wanted', video_url: '', duration: '11min' },
                            { episode: 2, title: 'Reef Blower', video_url: '', duration: '11min' }
                        ]
                    }
                ],
                created_at: '2024-01-04'
            },
            {
                id: 'demo_5',
                title: 'The Dark Knight',
                type: 'movie',
                year: 2008,
                rating: 9.0,
                quality: '4K',
                duration: '2h 32min',
                genre: ['Action', 'Crime', 'Drama'],
                description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
                poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911BTUgMe1nS1Cb.jpg',
                backdrop: 'https://image.tmdb.org/t/p/original/nMKdUUepR0i5zn0y1T4CsSB5ez.jpg',
                video_url: 'https://www.youtube.com/embed/EXeTwQWrcwY',
                featured: true,
                views: 28300,
                created_at: '2024-01-05'
            },
            {
                id: 'demo_6',
                title: 'Death Note',
                type: 'anime',
                year: 2006,
                rating: 9.0,
                quality: 'HD',
                genre: ['Thriller', 'Mystery', 'Supernatural'],
                description: 'An intelligent high school student goes on a secret crusade to eliminate criminals from the world after discovering a notebook capable of killing anyone whose name is written into it.',
                poster: 'https://image.tmdb.org/t/p/w500/g8hKycOVJjMHNiFoUkdqJykRQHB.jpg',
                backdrop: 'https://image.tmdb.org/t/p/original/qDOFkEOiSxFmwKIyRXLEjhz6ZPh.jpg',
                featured: false,
                views: 25400,
                seasons: [
                    {
                        season: 1,
                        episodes: [
                            { episode: 1, title: 'Rebirth', video_url: '', duration: '23min' },
                            { episode: 2, title: 'Confrontation', video_url: '', duration: '23min' }
                        ]
                    }
                ],
                created_at: '2024-01-06'
            },
            {
                id: 'demo_7',
                title: 'Stranger Things',
                type: 'series',
                year: 2016,
                rating: 8.7,
                quality: '4K',
                genre: ['Drama', 'Fantasy', 'Horror'],
                description: 'When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.',
                poster: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
                backdrop: 'https://image.tmdb.org/t/p/original/56v2KjBlYj9yE07MIm3cYJRIqkE.jpg',
                featured: true,
                views: 32100,
                seasons: [
                    {
                        season: 1,
                        episodes: [
                            { episode: 1, title: 'The Vanishing of Will Byers', video_url: '', duration: '48min' },
                            { episode: 2, title: 'The Weirdo on Maple Street', video_url: '', duration: '55min' }
                        ]
                    }
                ],
                created_at: '2024-01-07'
            },
            {
                id: 'demo_8',
                title: 'Avatar: The Last Airbender',
                type: 'cartoon',
                year: 2005,
                rating: 9.3,
                quality: 'HD',
                genre: ['Animation', 'Action', 'Adventure', 'Fantasy'],
                description: 'In a war-torn world of elemental magic, a young boy reawakens to undertake a dangerous mystic quest to fulfill his destiny as the Avatar.',
                poster: 'https://image.tmdb.org/t/p/w500/cHFZA0GKpVcjCUEAkBIHx5UijTy.jpg',
                backdrop: 'https://image.tmdb.org/t/p/original/6oaL4DP75yABrd5EbC4H2zq5ghc.jpg',
                featured: false,
                views: 19800,
                seasons: [
                    {
                        season: 1,
                        episodes: [
                            { episode: 1, title: 'The Boy in the Iceberg', video_url: '', duration: '23min' },
                            { episode: 2, title: 'The Avatar Returns', video_url: '', duration: '23min' }
                        ]
                    }
                ],
                created_at: '2024-01-08'
            }
        ];
    }
}

// Initialize database
const db = new LocalDB();

/*
============================================
SUPABASE SQL SCHEMA (Run in Supabase SQL Editor)
============================================

-- Create contents table
CREATE TABLE IF NOT EXISTS contents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('movie', 'series', 'anime', 'cartoon')),
    year INTEGER,
    rating DECIMAL(3,1),
    quality TEXT DEFAULT 'HD',
    duration TEXT,
    genre TEXT[] DEFAULT '{}',
    description TEXT,
    poster TEXT,
    backdrop TEXT,
    video_url TEXT,
    featured BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    seasons JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_contents_type ON contents(type);
CREATE INDEX idx_contents_featured ON contents(featured);
CREATE INDEX idx_contents_created ON contents(created_at DESC);

-- Enable Row Level Security
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read
CREATE POLICY "Public read access" ON contents FOR SELECT USING (true);

-- Only authenticated users (admin) can insert/update/delete
CREATE POLICY "Admin insert" ON contents FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update" ON contents FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete" ON contents FOR DELETE USING (auth.role() = 'authenticated');

*/
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
    import { getFirestore, doc, getDoc, getDocs, setDoc, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, deleteDoc, updateDoc, arrayUnion, arrayRemove, increment } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
    if(window.lucide) lucide.createIcons();
    const firebaseConfig = {
        apiKey: "AIzaSyCK6bbGtKyuLphYGtxqnAvvnGtMyh2ejV4",
        authDomain: "nexuspost-a00b1.firebaseapp.com",
        projectId: "nexuspost-a00b1",
        storageBucket: "nexuspost-a00b1.firebasestorage.app",
        messagingSenderId: "124843068065",
        appId: "1:124843068065:web:035b15d01910dc6b8d7ee0"
    };
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const provider = new GoogleAuthProvider();
    const imgbbKey = "1cb3871dd6829d7133f3285c289ffc0a";
    const adminEmail = "boxenjob5@gmail.com";
    const verifiedIcon = "https://lh3.googleusercontent.com/d/1OqVoJrTHfr_EXG520w5ES9ugrgQPzHNa";
    const REACTIONS = ['\u{1f44d}','\u2764\ufe0f','\u{1f602}','\u{1f62e}','\u{1f622}','\u{1f621}','\u{1f525}','\u{1f44f}','\u{1f64c}','\u{1f389}','\u{1f4af}','\u2728','\u{1f60d}','\u{1f970}','\u{1f60e}','\u{1f914}','\u{1f92e}','\u{1f494}','\u{1f92b}','\u{1f644}','\u{1f924}','\u{1f974}','\u{1f973}','\u{1f92f}','\u{1f917}','\u{1f4a9}','\u{1f480}','\u{1f47d}','\u{1f440}','\u{1f9e0}'];
    const MAX_CHARS = 500;

    /* \u2500\u2500 IMAGE COMPRESSION \u2500\u2500 */
    function compressImage(file, maxDim = 1600, quality = 0.82) {
        return new Promise((resolve, reject) => {
            if (!file.type.startsWith('image/') || file.type === 'image/gif') { resolve(file); return; }
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.onload = () => {
                URL.revokeObjectURL(url);
                let { width, height } = img;
                if (width > maxDim || height > maxDim) {
                    if (width > height) { height = Math.round(height * (maxDim / width)); width = maxDim; }
                    else { width = Math.round(width * (maxDim / height)); height = maxDim; }
                }
                const canvas = document.createElement('canvas');
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    if (!blob) { resolve(file); return; }
                    resolve(new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }));
                }, 'image/jpeg', quality);
            };
            img.onerror = () => resolve(file);
            img.src = url;
        });
    }
    function closeAllNestedOverlays() {
        // Prevents secondary modals (music picker, mini-player, poll, alert) from being
        // left invisibly open/blocking clicks after their parent screen was dismissed.
        stopMusicPreview();
        const ids = ['music-modal', 'music-player-modal', 'poll-modal', 'alert-modal'];
        ids.forEach(id => {
            const elmt = document.getElementById(id);
            if (elmt) elmt.style.display = 'none';
        });
    }

    /* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 GENERIC SWIPE SCREEN TRANSITION \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
    // direction: 'forward' (going deeper, e.g. Feed -> Settings) slides the new screen in from the
    // right and pushes the old one slightly left. 'back' reverses it (new screen from the left,
    // old one exits to the right) - mirrors standard iOS-style navigation.
    function swipeToScreen(hideEl, showEl, direction = 'forward') {
        if (!hideEl || !showEl || hideEl === showEl) {
            if (showEl) showEl.classList.remove('hidden');
            if (hideEl) hideEl.classList.add('hidden');
            return;
        }
        // The feed's music autoplay is purely geometry-based (IntersectionObserver), which can't
        // tell that a fixed-position screen is visually covering it - so explicitly pause/resume
        // tracking whenever navigating away from / back to the main feed.
        if (hideEl.id === 'main-content') pauseFeedAutoplayObserver();
        if (showEl.id === 'main-content') scheduleFeedObserverRescan();
        showEl.classList.remove('hidden');
        showEl.classList.add('screen-transitioning', direction === 'forward' ? 'screen-slide-in-right' : 'screen-slide-in-left');
        hideEl.classList.add('screen-transitioning');
        hideEl.classList.remove('screen-slide-settled');
        // Force reflow so the initial transform is applied before we animate to the settled state.
        void showEl.offsetWidth;
        requestAnimationFrame(() => {
            showEl.classList.remove('screen-slide-in-right', 'screen-slide-in-left');
            showEl.classList.add('screen-slide-settled');
            hideEl.classList.add(direction === 'forward' ? 'screen-slide-out-left' : 'screen-slide-out-right');
        });
        setTimeout(() => {
            hideEl.classList.add('hidden');
            hideEl.classList.remove('screen-transitioning', 'screen-slide-out-left', 'screen-slide-out-right', 'screen-slide-settled');
            showEl.classList.remove('screen-transitioning', 'screen-slide-settled');
        }, 340);
    }

    function setBnProcessing(active, label = 'Wird komprimiert\u2026') {
        const shell = document.getElementById('bn-shell');
        if (!shell) return;
        shell.classList.toggle('processing', active);
        let lbl = document.getElementById('bn-processing-label');
        if (active) {
            if (!lbl) {
                lbl = document.createElement('div');
                lbl.id = 'bn-processing-label';
                lbl.className = 'bn-processing-label';
                shell.appendChild(lbl);
            }
            lbl.innerHTML = `<span class="dot"></span> ${label}`;
        } else if (lbl) {
            lbl.remove();
        }
    }

    /* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 MUSIC FEATURE \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
    // Rotating pool of viral-sound seed queries (based on recurring TikTok-trend archetypes).
    // A handful are picked at random each time the picker opens, so suggestions vary.
    const VIRAL_SEED_POOL = [
        'Espresso Sabrina Carpenter', 'Die With A Smile', 'Good Luck Babe Chappell Roan',
        'Beautiful Things Benson Boone', 'APT Ros\u00e9 Bruno Mars', 'Birds of a Feather Billie Eilish',
        'Not Like Us Kendrick Lamar', 'Padam Padam Kylie Minogue', 'Houdini Dua Lipa',
        'Flowers Miley Cyrus', 'Paint The Town Red Doja Cat', 'Cruel Summer Taylor Swift',
        'Feather Sabrina Carpenter', 'Say My Name ODESZA', 'Levitating Dua Lipa',
        'Blinding Lights The Weeknd', 'As It Was Harry Styles', 'Vampire Olivia Rodrigo',
        'Snooze SZA', 'Standing Next To You Jungkook', 'Lose Control Teddy Swims',
        'Gata Only FloyyMenor', 'Million Dollar Baby Tommy Richman', 'I Had Some Help Morgan Wallen',
        'Please Please Please Sabrina Carpenter', 'Espresso Remix', 'Chihiro Billie Eilish'
    ];
    function pickRandomViralSeeds(n = 5) {
        const pool = [...VIRAL_SEED_POOL];
        const picked = [];
        while (picked.length < n && pool.length) {
            picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
        }
        return picked;
    }
    let musicPreviewAudio = new Audio();
    let musicPreviewPlayingId = null;
    let musicPickerTarget = 'post'; // 'post' or 'story'
    let selectedMusicForPost = null;
    let selectedMusicForStory = null;
    let globalSoundEnabled = false;

    /* ══════════════ SHARED "CURRENTLY VISIBLE" MUSIC AUTOPLAY ENGINE ══════════════ */
    /* Used identically by the main Feed (post currently centered in the scroll viewport),
       the classic single-Story viewer, and the Status Feed (TikTok-style swipe) - whichever
       item is "current" gets its music auto-played, kept separate from musicPreviewAudio
       (used by the search picker / mini-player) so opening the info modal never fights with
       the auto-play loop for the same <audio> element. `key` is any unique string identifying
       the currently-playing item (e.g. 'post:ID', 'story:ID', 'status:3'). */
    let apAudio = null;
    let apKey = null;
    let apPaused = false;

    function stopAutoplay() {
        if (apAudio) { apAudio.pause(); apAudio.src = ''; apAudio = null; }
        const prevKey = apKey;
        apKey = null;
        apPaused = false;
        if (prevKey) updateAutoplayIcon(prevKey);
    }
    function updateAutoplayIcon(key) {
        const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
        document.querySelectorAll(`.autoplay-toggle-btn[data-key="${safeKey}"]`).forEach(btn => {
            const isPlayingHere = apKey === key && apAudio && !apPaused;
            swapIcon(btn, isPlayingHere ? 'pause' : 'play');
        });
    }
    function playAutoplayFor(key, previewUrl) {
        if (apKey === key) return; // already the current item, don't restart/interrupt it
        const prevKey = apKey;
        stopAutoplay();
        if (prevKey) updateAutoplayIcon(prevKey);
        if (!previewUrl) return;
        apAudio = new Audio(previewUrl);
        apAudio.loop = true;
        apKey = key;
        apPaused = false;
        apAudio.play().catch((err) => {
            console.error('Autoplay konnte nicht gestartet werden:', err);
            apPaused = true;
            updateAutoplayIcon(key);
        });
        updateAutoplayIcon(key);
    }
    window.toggleAutoplayPause = (key, event) => {
        if (event) event.stopPropagation();
        if (apKey !== key) {
            // This item isn't the one automatic detection currently thinks is "active" - the user's
            // direct tap is a clearer signal of intent, so just start playing it right now instead
            // of silently doing nothing (previously this button only worked when detection agreed).
            const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
            const btn = document.querySelector(`.autoplay-toggle-btn[data-key="${safeKey}"]`);
            const previewUrl = btn?.dataset.previewUrl;
            if (previewUrl) playAutoplayFor(key, previewUrl);
            return;
        }
        if (!apAudio) return;
        if (apPaused) { apAudio.play().catch(() => {}); apPaused = false; }
        else { apAudio.pause(); apPaused = true; }
        updateAutoplayIcon(key);
    };
    function autoplayToggleBtnHTML(key, previewUrl, variantClass = '') {
        if (!previewUrl) return '';
        const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
        const isPlayingHere = apKey === key && apAudio && !apPaused;
        const safePreviewUrl = previewUrl.replace(/"/g, '');
        return `<button class="autoplay-toggle-btn ${variantClass}" data-key="${safeKey}" data-preview-url="${safePreviewUrl}" onclick="toggleAutoplayPause('${key}', event)"><i data-lucide="${isPlayingHere?'pause':'play'}" style="width:13px;"></i></button>`;
    }

    /* ── Main-feed autoplay tracking: whichever post-with-music is closest to the vertical center
       of the viewport (among those with a meaningful chunk actually visible) gets its music
       played. Uses whole post CARDS as the observation target (not the small music chip inside),
       since a tiny chip's own visibility ratio doesn't reliably reflect how prominently its
       parent post is actually displayed on screen when posts vary a lot in height. */
    let feedAutoplayObserver = null;
    let feedVisibleCandidates = new Map(); // key -> element, currently intersecting at all
    let feedObserverRescanTimer = null;
    function scheduleFeedObserverRescan() {
        clearTimeout(feedObserverRescanTimer);
        feedObserverRescanTimer = setTimeout(setupFeedAutoplayObserver, 150);
    }
    function pickBestFeedAutoplayCandidate() {
        const viewportCenter = window.innerHeight / 2;
        let bestKey = null, bestEl = null, bestDist = Infinity;
        feedVisibleCandidates.forEach((el, key) => {
            const rect = el.getBoundingClientRect();
            const visibleTop = Math.max(rect.top, 0);
            const visibleBottom = Math.min(rect.bottom, window.innerHeight);
            const visibleHeight = visibleBottom - visibleTop;
            if (visibleHeight < 80) return; // needs a meaningful chunk on screen to be a real candidate
            const elCenter = rect.top + rect.height / 2;
            const dist = Math.abs(elCenter - viewportCenter);
            if (dist < bestDist) { bestDist = dist; bestKey = key; bestEl = el; }
        });
        if (bestKey) {
            playAutoplayFor(bestKey, bestEl.dataset.previewUrl || null);
        } else if (apKey && apKey.startsWith('post:') && !feedVisibleCandidates.has(apKey)) {
            stopAutoplay();
        }
    }
    function setupFeedAutoplayObserver() {
        if (feedAutoplayObserver) feedAutoplayObserver.disconnect();
        feedVisibleCandidates = new Map();
        feedAutoplayObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const key = entry.target.dataset.autoplayKey;
                if (!key) return;
                if (entry.isIntersecting) feedVisibleCandidates.set(key, entry.target);
                else feedVisibleCandidates.delete(key);
            });
            pickBestFeedAutoplayCandidate();
        }, { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] });
        document.querySelectorAll('.card[data-autoplay-key]').forEach(el => feedAutoplayObserver.observe(el));
        // Also react to resize/orientation change, since "closest to center" depends on viewport size.
        if (!window.__feedAutoplayResizeWired) {
            window.__feedAutoplayResizeWired = true;
            window.addEventListener('resize', () => { if (feedVisibleCandidates.size) pickBestFeedAutoplayCandidate(); });
        }
    }
    function pauseFeedAutoplayObserver() {
        if (feedAutoplayObserver) { feedAutoplayObserver.disconnect(); }
        feedVisibleCandidates = new Map();
        clearTimeout(feedObserverRescanTimer);
    }

    function setPreviewBtnIcon(btn, iconName) {
        if (!btn) return;
        // Works whether the icon is still <i data-lucide> or already replaced by lucide with <svg>.
        const existingIcon = btn.querySelector('i, svg');
        const wrap = document.createElement('span');
        wrap.style.cssText = 'display:flex;align-items:center;justify-content:center;';
        wrap.innerHTML = `<i data-lucide="${iconName}" style="width:14px;"></i>`;
        if (existingIcon) existingIcon.replaceWith(wrap.firstElementChild);
        else btn.appendChild(wrap.firstElementChild);
        if (window.lucide) lucide.createIcons({root: btn});
    }
    function stopMusicPreview() {
        musicPreviewAudio.pause();
        musicPreviewAudio.currentTime = 0;
        document.querySelectorAll('.music-preview-btn').forEach(btn => setPreviewBtnIcon(btn, 'play'));
        musicPreviewPlayingId = null;
    }
    window.toggleMusicPreview = (btn, previewUrl, id) => {
        if (!previewUrl) { showToast('Keine Vorschau verf\u00fcgbar'); return; }
        if (musicPreviewPlayingId === id) { stopMusicPreview(); return; }
        stopMusicPreview();
        musicPreviewAudio.src = previewUrl;
        musicPreviewAudio.play().catch(() => showToast('Vorschau konnte nicht geladen werden'));
        musicPreviewPlayingId = id;
        setPreviewBtnIcon(btn, 'square');
        musicPreviewAudio.onended = () => stopMusicPreview();
    };

    function itunesSearchJsonp(term) {
        return new Promise((resolve) => {
            const cbName = 'itunesCb_' + Math.random().toString(36).slice(2);
            const script = document.createElement('script');
            let settled = false;
            const cleanup = () => {
                delete window[cbName];
                script.remove();
                clearTimeout(timer);
            };
            const timer = setTimeout(() => {
                if (!settled) { settled = true; cleanup(); resolve([]); }
            }, 6000);
            window[cbName] = (data) => {
                if (settled) return;
                settled = true;
                cleanup();
                resolve((data && data.results) ? data.results.filter(r => r.previewUrl) : []);
            };
            script.src = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=8&callback=${cbName}`;
            script.onerror = () => { if (!settled) { settled = true; cleanup(); resolve([]); } };
            document.body.appendChild(script);
        });
    }
    async function itunesSearch(term) {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&entity=song&limit=8`;
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('bad status');
            const j = await res.json();
            const results = (j.results || []).filter(r => r.previewUrl);
            if (results.length) return results;
            // Empty result could also mean a silently-blocked/opaque response; try JSONP as a safety net.
            return await itunesSearchJsonp(term);
        } catch (e) {
            // fetch failed outright (often CORS) - fall back to JSONP, which bypasses CORS entirely.
            return await itunesSearchJsonp(term);
        }
    }
    async function loadViralSuggestions() {
        const list = document.getElementById('music-results-list');
        list.innerHTML = '<div class="music-loading">Lade virale Sounds\u2026</div>';
        const seeds = pickRandomViralSeeds(5);
        const batches = await Promise.all(seeds.map(s => itunesSearch(s)));
        const results = [];
        const seenIds = new Set();
        batches.forEach(batch => {
            if (batch[0] && !seenIds.has(batch[0].trackId)) { results.push(batch[0]); seenIds.add(batch[0].trackId); }
        });
        renderMusicResults(results, true);
    }
    function renderMusicResults(results, isViral) {
        const list = document.getElementById('music-results-list');
        const label = document.getElementById('music-results-label');
        label.innerHTML = isViral
            ? `<i data-lucide="flame" style="width:13px;color:var(--warning);"></i> Viral gerade`
            : `<i data-lucide="search" style="width:13px;"></i> Suchergebnisse`;
        if (!results.length) {
            list.innerHTML = '<div class="music-loading">Keine Songs gefunden.</div>';
            if(window.lucide) lucide.createIcons({root: label});
            return;
        }
        list.innerHTML = results.map(r => {
            const rid = 'mres-' + r.trackId;
            const trackData = {
                trackId: r.trackId, title: r.trackName, artist: r.artistName,
                artworkUrl: (r.artworkUrl100||'').replace('100x100','300x300'),
                previewUrl: r.previewUrl, trackViewUrl: r.trackViewUrl
            };
            return `<div class="music-result-item" onclick="selectMusicTrackEncoded('${safeJsonAttr(trackData)}')">
                <img src="${r.artworkUrl100}" onerror="this.style.display='none'">
                <div class="music-result-info">
                    <div class="music-result-title">${escapeHtml(r.trackName)}</div>
                    <div class="music-result-artist">${escapeHtml(r.artistName)}</div>
                </div>
                <button class="music-preview-btn" onclick="event.stopPropagation();toggleMusicPreview(this,'${(r.previewUrl||'').replace(/'/g,'')}','${rid}')"><i data-lucide="play" style="width:14px;"></i></button>
            </div>`;
        }).join('');
        if(window.lucide) lucide.createIcons({root: list});
    }
    function escapeHtml(str) {
        return (str || '').toString()
            .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }
    window.openMusicModal = (target) => {
        musicPickerTarget = target;
        document.getElementById('music-modal').style.display = 'flex';
        document.getElementById('music-search-input').value = '';
        if(window.lucide) lucide.createIcons();
        loadViralSuggestions();
    };
    window.closeMusicModal = () => {
        stopMusicPreview();
        document.getElementById('music-modal').style.display = 'none';
    };
    let musicSearchDebounce;
    document.addEventListener('DOMContentLoaded', () => {
        const input = document.getElementById('music-search-input');
        if (input) input.addEventListener('input', () => {
            clearTimeout(musicSearchDebounce);
            const term = input.value.trim();
            if (!term) { loadViralSuggestions(); return; }
            musicSearchDebounce = setTimeout(async () => {
                document.getElementById('music-results-list').innerHTML = '<div class="music-loading">Suche\u2026</div>';
                const results = await itunesSearch(term);
                renderMusicResults(results, false);
            }, 400);
        });
    });
    window.selectMusicTrackEncoded = (encoded) => {
        let data;
        try {
            data = JSON.parse(decodeURIComponent(escape(atob(encoded))));
        } catch (e) {
            console.error('Konnte ausgew\u00e4hlten Song nicht lesen:', e);
            showToast('Song konnte nicht ausgew\u00e4hlt werden.');
            return;
        }
        if (musicPickerTarget === 'post') {
            selectedMusicForPost = data;
            renderComposerMusicChip();
        } else {
            selectedMusicForStory = data;
            renderStoryConfirmMusicChip();
        }
        stopMusicPreview();
        closeMusicModal();
        showToast(`\u{1f3b5} "${data.title}" ausgew\u00e4hlt`);
    };
    function renderComposerMusicChip() {
        const wrap = document.getElementById('composer-music-chip-wrap');
        const btn = document.getElementById('composer-music-add-btn');
        if (!selectedMusicForPost) { wrap.innerHTML = ''; btn?.classList.remove('has-music'); return; }
        btn?.classList.add('has-music');
        wrap.innerHTML = `<div class="composer-music-chip">
            <img src="${selectedMusicForPost.artworkUrl}">
            <span>${selectedMusicForPost.title} \u00b7 ${selectedMusicForPost.artist}</span>
            <button onclick="removeComposerMusic()"><i data-lucide="x" style="width:13px;"></i></button>
        </div>`;
        if(window.lucide) lucide.createIcons({root: wrap});
    }
    window.removeComposerMusic = () => {
        selectedMusicForPost = null;
        renderComposerMusicChip();
    };
    function safeJsonAttr(obj) {
        // Encode as base64 so quotes/ampersands/apostrophes in titles can never break the HTML attribute.
        try {
            return btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
        } catch (e) { return ''; }
    }
    function musicBadgeHTML(music, sizeClass) {
        if (!music || typeof music !== 'object' || !music.artworkUrl) return '';
        const safeTitle = (music.title || 'Unbekannter Song').toString().slice(0, 60);
        return `<div class="${sizeClass}" onclick="event.stopPropagation();openMusicPlayerModalEncoded('${safeJsonAttr(music)}')">
            <img src="${music.artworkUrl}" onerror="this.style.display='none'">
            ${sizeClass === 'post-music-badge' ? '<i data-lucide="music-4"></i>' : `<span>${safeTitle}</span>`}
        </div>`;
    }
    function postMusicChipHTML(music, postId) {
        if (!music || typeof music !== 'object') return '';
        const safeTitle = (music.title || 'Unbekannter Song').toString().slice(0, 40);
        const safeArtist = (music.artist || '').toString().slice(0, 40);
        const key = `post:${postId}`;
        return `<div class="post-music-chip" onclick="event.stopPropagation();openMusicPlayerModalEncoded('${safeJsonAttr(music)}')">
            ${music.artworkUrl ? `<img src="${music.artworkUrl}" onerror="this.style.display='none'">` : `<div class="post-music-chip-fallback-icon"><i data-lucide="music-4" style="width:14px;"></i></div>`}
            <span>${safeTitle}${safeArtist ? ' \u00b7 ' + safeArtist : ''}</span>
            ${autoplayToggleBtnHTML(key, music.previewUrl, 'on-light')}
        </div>`;
    }
    window.openMusicPlayerModalEncoded = (encoded) => {
        try {
            const music = JSON.parse(decodeURIComponent(escape(atob(encoded))));
            openMusicPlayerModal(music);
        } catch (e) {
            console.error('Konnte Musikdaten nicht lesen:', e);
            showToast('Song konnte nicht geladen werden.');
        }
    };
    window.openMusicPlayerModal = (music) => {
        if (typeof music === 'string') {
            try { music = JSON.parse(music.replace(/&quot;/g, '"')); }
            catch (e) { console.error('Musikdaten ung\u00fcltig:', e); return; }
        }
        if (!music || typeof music !== 'object') return;
        // Avoid two audio streams playing at once if this was opened while something is auto-playing.
        if (apAudio && !apPaused) { apAudio.pause(); apPaused = true; if (apKey !== null) updateAutoplayIcon(apKey); }
        document.getElementById('mp-cover').src = music.artworkUrl || '';
        document.getElementById('mp-title').textContent = music.title || 'Unbekannter Song';
        document.getElementById('mp-artist').textContent = music.artist || '';
        document.getElementById('mp-spotify-link').href = `https://open.spotify.com/search/${encodeURIComponent((music.title||'') + ' ' + (music.artist||''))}`;
        document.getElementById('mp-apple-link').href = music.trackViewUrl || `https://music.apple.com/search?term=${encodeURIComponent((music.title||'') + ' ' + (music.artist||''))}`;
        const playBtn = document.getElementById('mp-play-btn');
        playBtn.dataset.previewUrl = music.previewUrl || '';
        setMpPlayIcon('play', 'Vorschau abspielen');
        document.getElementById('music-player-modal').style.display = 'flex';
        if(window.lucide) lucide.createIcons();
    };
    function setMpPlayIcon(iconName, labelText) {
        const wrap = document.getElementById('mp-play-icon-wrap');
        const label = document.getElementById('mp-play-label');
        if (wrap) wrap.innerHTML = `<i data-lucide="${iconName}" style="width:16px;"></i>`;
        if (label) label.textContent = labelText;
        if (window.lucide) lucide.createIcons({root: wrap || document});
    }
    window.closeMusicPlayerModal = () => {
        stopMusicPreview();
        document.getElementById('music-player-modal').style.display = 'none';
        setMpPlayIcon('play', 'Vorschau abspielen');
    };
    window.toggleMpPreview = () => {
        const btn = document.getElementById('mp-play-btn');
        const url = btn.dataset.previewUrl;
        if (!url) { showToast('Keine Vorschau f\u00fcr diesen Song verf\u00fcgbar'); return; }
        if (musicPreviewPlayingId === 'mp') {
            stopMusicPreview();
            setMpPlayIcon('play', 'Vorschau abspielen');
            return;
        }
        stopMusicPreview();
        musicPreviewAudio.src = url;
        musicPreviewAudio.play().catch(() => showToast('Vorschau konnte nicht geladen werden'));
        musicPreviewPlayingId = 'mp';
        setMpPlayIcon('square', 'Wird abgespielt\u2026');
        musicPreviewAudio.onended = () => {
            musicPreviewPlayingId = null;
            setMpPlayIcon('play', 'Vorschau abspielen');
        };
    };
    function swapIcon(container, iconName) {
        if (!container) return;
        const existingIcon = container.querySelector('i, svg');
        const span = document.createElement('span');
        span.innerHTML = `<i data-lucide="${iconName}"></i>`;
        const fresh = span.firstElementChild;
        if (existingIcon) {
            // Preserve size/style attributes if the old node had them
            if (existingIcon.getAttribute('style')) fresh.setAttribute('style', existingIcon.getAttribute('style'));
            existingIcon.replaceWith(fresh);
        } else {
            container.appendChild(fresh);
        }
        if (window.lucide) lucide.createIcons({root: container});
    }
    window.toggleGlobalSound = () => {
        globalSoundEnabled = !globalSoundEnabled;
        localStorage.setItem('cliq_sound_enabled', globalSoundEnabled ? '1' : '0');
        const btn = document.getElementById('global-sound-toggle');
        if (!btn) return;
        btn.classList.toggle('on', globalSoundEnabled);
        swapIcon(btn, globalSoundEnabled ? 'volume-2' : 'volume-x');
        if (!globalSoundEnabled) stopMusicPreview();
        showToast(globalSoundEnabled ? 'Musik-Vorschau aktiviert \u{1f50a}' : 'Musik-Vorschau deaktiviert \u{1f507}');
    };
    let userData = null;
    let allPosts = [];
    let bookmarkedIds = JSON.parse(localStorage.getItem('nexus_bookmarks') || '[]');
    let allUsersCache = {}; // uid -> user data, populated lazily for follow lists
    window.onPostInput = () => {
        const txt = document.getElementById('post-input').innerText;
        const len = txt.length;
        const counter = document.getElementById('char-counter');
        counter.classList.remove('hidden');
        counter.textContent = `${len} / ${MAX_CHARS}`;
        counter.className = 'char-counter' + (len > MAX_CHARS ? ' limit' : len > 400 ? ' warn' : '');
    };
    window.showToast = (msg) => {
        const t = document.getElementById('toast');
        t.textContent = msg; t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2800);
    };
    document.addEventListener('contextmenu', event => {
        if (event.target.tagName === 'IMG') {
            event.preventDefault();
        }
    });
    function timeAgo(ts) {
        if (!ts) return "Gerade eben";
        const s = Math.floor((new Date() - ts.toDate()) / 1000);
        if (s < 60) return "Gerade eben";
        if (s < 3600) return Math.floor(s/60) + " Min.";
        if (s < 86400) return Math.floor(s/3600) + " Std.";
        if (s < 2592000) return Math.floor(s/86400) + " Tg.";
        if (s < 31536000) return Math.floor(s/2592000) + " Mon.";
        return Math.floor(s/31536000) + " J.";
    }
    function parseText(text) {
        if (!text) return '';
        return text
            .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
            .replace(/_([^_]+)_/g, '<em>$1</em>')
            .replace(/#(\w+)/g, '<span class="hashtag" onclick="searchHashtag(\'#$1\')">#$1</span>')
            .replace(/@(\w+)/g, '<span class="mention">@$1</span>');
    }
    window.searchHashtag = (tag) => {
        switchTab('feed');
        document.getElementById('search-input').value = tag;
        document.querySelectorAll('#feed .card').forEach(c => c.style.display = c.innerText.toLowerCase().includes(tag.toLowerCase()) ? '' : 'none');
        expandSearch();
        showToast(`Zeige Posts mit ${tag}`);
    };
    window.switchTab = (tab) => {
        const wasTrending = document.getElementById('tab-trending').classList.contains('active');
        const goingForward = tab === 'trending' && !wasTrending;
        document.getElementById('tab-feed').classList.toggle('active', tab === 'feed');
        document.getElementById('tab-trending').classList.toggle('active', tab === 'trending');
        document.getElementById('feed').classList.toggle('hidden', tab !== 'feed');
        document.getElementById('trending-section').classList.toggle('hidden', tab !== 'trending');
        const activeEl = document.getElementById(tab === 'feed' ? 'feed' : 'trending-section');
        activeEl.classList.remove('tab-slide-in-right', 'tab-slide-in-left');
        void activeEl.offsetWidth;
        activeEl.classList.add(goingForward ? 'tab-slide-in-right' : 'tab-slide-in-left');
        if (tab === 'trending') renderTrending();
    };
    function renderTrending() {
        const hashMap = {};
        allPosts.forEach(p => {
            if (!p.text) return;
            const tags = p.text.match(/#(\w+)/g) || [];
            tags.forEach(t => { hashMap[t] = (hashMap[t] || 0) + 1; });
        });
        const sorted = Object.entries(hashMap).sort((a,b) => b[1]-a[1]).slice(0, 10);
        const sec = document.getElementById('trending-section');
        if (!sorted.length) {
            sec.innerHTML = '<div style="text-align:center;padding:40px;color:var(--sub);">Noch keine Hashtags gefunden.</div>';
            return;
        }
        sec.innerHTML = `<div class="trending-card">
            <div class="trending-title"><i data-lucide="trending-up" style="width:18px;color:var(--nexus);"></i> Trending Hashtags</div>
            ${sorted.map(([tag, count], i) => `
                <div class="trending-item" onclick="searchHashtag('${tag}')">
                    <div style="font-size:13px;font-weight:700;color:var(--sub);min-width:22px;">#${i+1}</div>
                    <div>
                        <div class="trending-tag">${tag}</div>
                        <div class="trending-count">${count} Post${count !== 1 ? 's' : ''}</div>
                    </div>
                    <i data-lucide="chevron-right" style="width:16px;color:var(--sub);margin-left:auto;"></i>
                </div>`).join('')}
        </div>`;
        if(window.lucide) lucide.createIcons({root: sec});
    }
    window.expandSearch = () => {
        document.getElementById('nav-logo').classList.add('hidden');
        document.getElementById('nav-actions-items').style.display = 'none';
        document.getElementById('nav-more-btn').style.display = 'none';
        document.getElementById('search-wrapper').classList.add('active');
        document.getElementById('btn-close-search').classList.remove('hidden');
        document.getElementById('search-input').focus();
    };
    window.collapseSearch = () => {
        document.getElementById('search-wrapper').classList.remove('active');
        document.getElementById('nav-logo').classList.remove('hidden');
        document.getElementById('nav-actions-items').style.display = 'flex';
        document.getElementById('btn-close-search').classList.add('hidden');
        document.getElementById('search-input').value = '';
        document.querySelectorAll('.card').forEach(p => p.style.display = '');
        adaptNavbar();
    };
    document.getElementById('search-input').oninput = (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('#feed .card').forEach(c => c.style.display = c.innerText.toLowerCase().includes(term) ? '' : 'none');
    };
    window.toggleDarkMode = () => {
        const isDark = document.body.classList.toggle('dark');
        document.body.classList.toggle('light', !isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        const bnThemeBtn = document.getElementById('bn-theme-btn');
        swapIcon(bnThemeBtn, isDark ? 'sun' : 'moon');
        const dt = document.getElementById('dark-toggle');
        if (dt) dt.classList.toggle('on', isDark);
    };
    window.toggleDarkModeSettings = () => toggleDarkMode();
    window.setTheme = (theme, el) => {
        ['theme-purple','theme-green','theme-rose','theme-orange'].forEach(c => document.body.classList.remove(c));
        if (theme !== 'default') document.body.classList.add('theme-'+theme);
        document.querySelectorAll('.theme-dot').forEach(d => d.classList.remove('selected'));
        el.classList.add('selected');
        localStorage.setItem('accentTheme', theme);
    };
    window.openSettings = () => {
        if (userData) {
            document.getElementById('settings-avatar').src = userData.photoURL || '';
            const verifiedHtml = userData.verified ? `<img src="${verifiedIcon}" class="verified-badge">` : '';
            document.getElementById('settings-preview-name').innerHTML = (userData.displayname || '\u2013') + verifiedHtml;
            document.getElementById('settings-preview-user').textContent = '@' + (userData.username || '\u2013');
        }
        document.getElementById('dark-toggle').classList.toggle('on', document.body.classList.contains('dark'));
        swipeToScreen(document.getElementById('main-content'), document.getElementById('settings-screen'), 'forward');
        setActiveBnTab(null);
        if(window.lucide) lucide.createIcons();
    };
    window.closeSettings = () => {
        swipeToScreen(document.getElementById('settings-screen'), document.getElementById('main-content'), 'back');
        setActiveBnTab('bn-home');
    };
    function formatCooldownHint(changedAt, cooldownDays) {
        if (!changedAt) return null;
        const DAY_MS = 24 * 60 * 60 * 1000;
        const elapsed = Date.now() - changedAt;
        const remainingMs = cooldownDays * DAY_MS - elapsed;
        if (remainingMs <= 0) return null;
        const daysLeft = Math.ceil(remainingMs / DAY_MS);
        return `\u00c4nderbar in ${daysLeft} Tag${daysLeft !== 1 ? 'en' : ''}`;
    }
    window.showEditProfile = () => {
        document.getElementById('edit-displayname').value = userData.displayname || '';
        document.getElementById('edit-username').value = userData.username || '';
        document.getElementById('edit-bio').value = userData.bio || '';
        const dnHint = document.getElementById('displayname-cooldown-hint');
        const unHint = document.getElementById('username-cooldown-hint');
        const dnMsg = formatCooldownHint(userData.displaynameChangedAt, 7);
        const unMsg = formatCooldownHint(userData.usernameChangedAt, 14);
        dnHint.textContent = dnMsg || '';
        dnHint.style.display = dnMsg ? 'block' : 'none';
        unHint.textContent = unMsg || '';
        unHint.style.display = unMsg ? 'block' : 'none';
        document.getElementById('edit-profile-modal').style.display = 'flex';
        if(window.lucide) lucide.createIcons();
    };
    window.saveProfile = async () => {
        const dn = document.getElementById('edit-displayname').value.trim();
        const un = document.getElementById('edit-username').value.replace('@','').trim();
        const bio = document.getElementById('edit-bio').value.trim();
        if (!dn) return showToast('Bitte Namen eingeben');
        if (!un) return showToast('Bitte Nutzername eingeben');

        const DAY_MS = 24 * 60 * 60 * 1000;
        const now = Date.now();
        const dnChanged = dn !== userData.displayname;
        const unChanged = un !== userData.username;

        if (dnChanged && userData.displaynameChangedAt) {
            const elapsed = now - userData.displaynameChangedAt;
            if (elapsed < 7 * DAY_MS) {
                const daysLeft = Math.ceil((7 * DAY_MS - elapsed) / DAY_MS);
                return showToast(`Anzeigename erst in ${daysLeft} Tag${daysLeft !== 1 ? 'en' : ''} wieder \u00e4nderbar`);
            }
        }
        if (unChanged && userData.usernameChangedAt) {
            const elapsed = now - userData.usernameChangedAt;
            if (elapsed < 14 * DAY_MS) {
                const daysLeft = Math.ceil((14 * DAY_MS - elapsed) / DAY_MS);
                return showToast(`Nutzername erst in ${daysLeft} Tag${daysLeft !== 1 ? 'en' : ''} wieder \u00e4nderbar`);
            }
        }
        if (unChanged) {
            const q = query(collection(db, "users"), where("username", "==", un));
            const snap = await getDocs(q);
            if (!snap.empty) return showToast('Nutzername bereits vergeben');
        }

        const updates = { displayname: dn, username: un, bio };
        if (dnChanged) updates.displaynameChangedAt = now;
        if (unChanged) updates.usernameChangedAt = now;

        await updateDoc(doc(db, "users", auth.currentUser.uid), updates);
        userData.displayname = dn; userData.username = un; userData.bio = bio;
        if (dnChanged) userData.displaynameChangedAt = now;
        if (unChanged) userData.usernameChangedAt = now;
        const verifiedHtml = userData.verified ? `<img src="${verifiedIcon}" class="verified-badge">` : '';
        document.getElementById('settings-preview-name').innerHTML = dn + verifiedHtml;
        document.getElementById('settings-preview-user').textContent = '@' + un;
        document.getElementById('edit-profile-modal').style.display = 'none';
        showToast('Profil gespeichert \u2713');
    };
    window.uploadProfileImage = async (e) => {
        const file = e.target.files[0]; if (!file) return;
        showToast('Profilbild wird komprimiert\u2026');
        try {
            const compressed = await compressImage(file, 800, 0.85);
            showToast('Profilbild wird hochgeladen\u2026');
            const fd = new FormData(); fd.append("image", compressed);
            const res = await fetch("https://api.imgbb.com/1/upload?key="+imgbbKey, { method:"POST", body:fd });
            const j = await res.json();
            if (!j?.data?.url) throw new Error('Upload fehlgeschlagen');
            const newUrl = j.data.url;
            await updateDoc(doc(db, "users", auth.currentUser.uid), { photoURL: newUrl });
            userData.photoURL = newUrl;
            document.getElementById('settings-avatar').src = newUrl;
            showToast('Profilbild aktualisiert \u2713');
        } catch (err) {
            showToast('Fehler beim Hochladen des Profilbilds.');
        } finally {
            e.target.value = '';
        }
    };
    window.openProfileModal = async (uid) => {
        const uSnap = await getDoc(doc(db, "users", uid));
        const u = uSnap.data() || {};
        allUsersCache[uid] = u;
        document.getElementById('pmodal-avatar').src = u.photoURL || '';
        document.getElementById('pmodal-name').innerHTML = (u.displayname || '\u2013') + (u.verified ? `<img src="${verifiedIcon}" style="width:18px;height:18px;">` : '');
        document.getElementById('pmodal-username').textContent = '@' + (u.username || '\u2013');
        document.getElementById('pmodal-bio').textContent = u.bio || '';
        const followingCount = Array.isArray(u.following) ? u.following.length : 0;
        document.getElementById('pmodal-following-count').textContent = followingCount;
        const statsWrap = document.getElementById('pmodal-stats-wrap');
        const followBtnWrap = document.getElementById('pmodal-follow-btn-wrap');
        if (uid === auth.currentUser?.uid) {
            followBtnWrap.innerHTML = '';
        } else {
            const following = Array.isArray(userData?.following) ? userData.following : [];
            const isFollowing = following.includes(uid);
            followBtnWrap.innerHTML = `<button class="follow-btn ${isFollowing?'following':''}" data-uid="${uid}" onclick="toggleFollow('${uid}', event)" style="margin:0;width:100%;padding:10px;font-size:14px;">${isFollowing?'Folge ich':'Folgen'}</button>`;
        }
        // Follower count via query, done async so it doesn't block the rest of the modal
        document.getElementById('pmodal-follower-count').textContent = '\u2026';
        getDocs(query(collection(db, "users"), where("following", "array-contains", uid)))
            .then(snap => { document.getElementById('pmodal-follower-count').textContent = snap.size; })
            .catch(() => { document.getElementById('pmodal-follower-count').textContent = '0'; });
        const grid = document.getElementById('pmodal-grid');
        grid.innerHTML = '';
        const userPosts = allPosts.filter(p => p.uid === uid);
        const imgPosts = userPosts.filter(p => p.imageUrl);
        if (imgPosts.length === 0) {
            grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:20px;color:var(--sub);font-size:13px;">Noch keine Bilder gepostet.</div>';
        } else {
            imgPosts.slice(0, 9).forEach(p => {
                grid.innerHTML += `<div class="profile-grid-item" onclick="closeProfileModal();openLightbox('${p.imageUrl}')"><img src="${p.imageUrl}" loading="lazy"></div>`;
            });
        }
        document.getElementById('profile-modal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };
    window.closeProfileModal = () => {
        document.getElementById('profile-modal').style.display = 'none';
        document.body.style.overflow = '';
    };
    window.toggleBookmark = (postId) => {
        const idx = bookmarkedIds.indexOf(postId);
        if (idx > -1) { bookmarkedIds.splice(idx, 1); showToast('Lesezeichen entfernt'); }
        else { bookmarkedIds.push(postId); showToast('Gespeichert \u{1f516}'); }
        localStorage.setItem('nexus_bookmarks', JSON.stringify(bookmarkedIds));
        const btn = document.querySelector(`#post-${postId} .bookmark-btn`);
        if (btn) btn.classList.toggle('bookmarked', bookmarkedIds.includes(postId));
    };
    window.openBookmarks = () => {
        swipeToScreen(document.getElementById('main-content'), document.getElementById('bookmarks-screen'), 'forward');
        if(window.lucide) lucide.createIcons();
        renderBookmarks();
    };
    window.closeBookmarks = () => {
        swipeToScreen(document.getElementById('bookmarks-screen'), document.getElementById('main-content'), 'back');
    };
    function renderBookmarks() {
        const feed = document.getElementById('bookmarks-feed');
        const empty = document.getElementById('bookmarks-empty');
        if (!bookmarkedIds.length) { feed.innerHTML = ''; empty.classList.remove('hidden'); return; }
        empty.classList.add('hidden');
        feed.innerHTML = '';
        const bookmarkedPosts = allPosts.filter(p => bookmarkedIds.includes(p.id));
        if (!bookmarkedPosts.length) { feed.innerHTML = ''; empty.classList.remove('hidden'); return; }
        bookmarkedPosts.forEach(p => {
            getDoc(doc(db, "users", p.uid)).then(uSnap => {
                const u = uSnap.data() || {};
                const div = document.createElement('div');
                div.className = 'card';
                div.innerHTML = renderPostHTML(p, u);
                feed.appendChild(div);
                if(window.lucide) lucide.createIcons({root: div});
            });
        });
    }
    let notifUnsubscribe = null;
    function loadNotifications() {
        const q = query(collection(db, "users", auth.currentUser.uid, "notifications"), orderBy("createdAt", "desc"));
        notifUnsubscribe = onSnapshot(q, (snap) => {
            const list = document.getElementById('notif-list');
            let unread = 0;
            let html = '';
            const icons = { like: '\u2764\ufe0f', comment: '\ud83d\udcac', repost: '\ud83d\udd01', follow: '\ud83d\udc65', new_content: '\ud83d\udce3' };
            const colors = { like: '#ff3b30', comment: '#34c759', repost: '#1877f2', follow: '#8b5cf6', new_content: '#f97316' };
            snap.forEach(d => {
                const n = d.data();
                if (!n.read) unread++;
                let text;
                if (n.type === 'like') text = 'hat deinen Post geliked';
                else if (n.type === 'comment') text = `hat kommentiert: \u201e${escapeHtml(n.preview || '')}\u201c`;
                else if (n.type === 'repost') text = 'hat deinen Post geteilt';
                else if (n.type === 'follow') text = 'folgt dir jetzt';
                else if (n.type === 'new_content') text = n.contentKind === 'story' ? 'hat eine neue Story gepostet' : 'hat einen neuen Beitrag gepostet';
                else text = 'hat etwas gemacht';
                html += `<div class="notif-item ${n.read ? '' : 'unread'}" onclick="markNotifRead('${d.id}')">
                    <div style="position:relative;">
                        <img src="${n.fromPhoto||''}" class="notif-avatar">
                        <div class="notif-icon-badge" style="background:${colors[n.type]||'#8e8e93'};">${icons[n.type]||'\ud83d\udd14'}</div>
                    </div>
                    <div style="flex:1;">
                        <div class="notif-text"><strong>${escapeHtml(n.fromName||'Jemand')}</strong> ${text}</div>
                        <div class="notif-time">${timeAgo(n.createdAt)}</div>
                    </div>
                </div>`;
            });
            if (!html) html = '<div class="notif-empty"><i data-lucide="bell-off" style="width:36px;height:36px;margin-bottom:10px;display:block;margin-left:auto;margin-right:auto;opacity:0.4;"></i>Noch keine Benachrichtigungen</div>';
            list.innerHTML = html;
            const badge = document.getElementById('notif-badge');
            if (unread > 0) { badge.textContent = unread > 9 ? '9+' : unread; badge.classList.remove('hidden'); }
            else badge.classList.add('hidden');
            if(window.lucide) lucide.createIcons({root: list});
        });
    }
    window.markNotifRead = async (id) => {
        await updateDoc(doc(db, "users", auth.currentUser.uid, "notifications", id), { read: true });
    };
    window.markAllNotifsRead = async () => {
        const snap = await getDocs(collection(db, "users", auth.currentUser.uid, "notifications"));
        snap.forEach(d => updateDoc(d.ref, { read: true }));
        showToast('Alle als gelesen markiert');
    };
    async function sendNotification(toUid, type, postId, preview='') {
        if (toUid === auth.currentUser.uid) return;
        await addDoc(collection(db, "users", toUid, "notifications"), {
            type, postId, preview,
            fromUid: auth.currentUser.uid,
            fromName: userData.displayname,
            fromPhoto: userData.photoURL,
            read: false,
            createdAt: serverTimestamp()
        });
    }

    /* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 FOLLOW SYSTEM \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
    window.toggleFollow = async (targetUid, event) => {
        if (event) event.stopPropagation();
        if (!auth.currentUser || targetUid === auth.currentUser.uid) return;
        const following = Array.isArray(userData.following) ? userData.following : [];
        const isFollowing = following.includes(targetUid);
        const newFollowing = isFollowing ? following.filter(u => u !== targetUid) : [...following, targetUid];
        userData.following = newFollowing;
        try {
            await updateDoc(doc(db, "users", auth.currentUser.uid), { following: newFollowing });
            if (!isFollowing) {
                await sendNotification(targetUid, 'follow', null);
                showToast('Du folgst diesem Profil jetzt \ud83d\udc4b');
            } else {
                showToast('Du folgst diesem Profil nicht mehr');
            }
        } catch (e) {
            // revert on failure
            userData.following = following;
            showToast('Aktion fehlgeschlagen, bitte erneut versuchen.');
            return;
        }
        document.querySelectorAll(`.follow-btn[data-uid="${targetUid}"]`).forEach(btn => {
            const nowFollowing = newFollowing.includes(targetUid);
            btn.textContent = nowFollowing ? 'Folge ich' : 'Folgen';
            btn.classList.toggle('following', nowFollowing);
        });
        updateFollowingBadgeVisibility();
    };
    function followButtonHTML(targetUid) {
        if (!targetUid || !auth.currentUser || targetUid === auth.currentUser.uid) return '';
        const following = Array.isArray(userData?.following) ? userData.following : [];
        const isFollowing = following.includes(targetUid);
        return `<button class="follow-btn ${isFollowing ? 'following' : ''}" data-uid="${targetUid}" onclick="toggleFollow('${targetUid}', event)">${isFollowing ? 'Folge ich' : 'Folgen'}</button>`;
    }
    async function getCachedUser(uid) {
        if (allUsersCache[uid]) return allUsersCache[uid];
        const uSnap = await getDoc(doc(db, "users", uid));
        const data = uSnap.exists() ? uSnap.data() : {};
        allUsersCache[uid] = data;
        return data;
    }
    async function notifyFollowersOfNewContent(contentId, kind) {
        // kind: 'post' | 'story'. Fires from the poster's client at creation time so every follower
        // gets exactly one notification, regardless of who else happens to be online.
        if (!auth.currentUser) return;
        try {
            const snap = await getDocs(query(collection(db, "users"), where("following", "array-contains", auth.currentUser.uid)));
            const notifyPromises = [];
            snap.forEach(followerDoc => {
                const followerUid = followerDoc.id;
                notifyPromises.push(
                    addDoc(collection(db, "users", followerUid, "notifications"), {
                        type: 'new_content',
                        contentKind: kind,
                        postId: kind === 'post' ? contentId : null,
                        fromUid: auth.currentUser.uid,
                        fromName: userData.displayname,
                        fromPhoto: userData.photoURL,
                        read: false,
                        createdAt: serverTimestamp()
                    }),
                    setDoc(doc(db, "users", followerUid, "meta", "followingFeed"), {
                        hasNew: true, lastNewAt: serverTimestamp()
                    }, { merge: true })
                );
            });
            await Promise.all(notifyPromises);
        } catch (e) {
            console.error('Konnte Follower nicht benachrichtigen:', e);
        }
    }
    let followingHasNew = false;
    function updateFollowingBadgeVisibility() {
        document.getElementById('following-red-dot')?.classList.toggle('hidden', !followingHasNew);
    }
    function listenFollowingFeedFlag() {
        if (!auth.currentUser) return;
        onSnapshot(doc(db, "users", auth.currentUser.uid, "meta", "followingFeed"), (snap) => {
            followingHasNew = !!(snap.exists() && snap.data().hasNew);
            updateFollowingBadgeVisibility();
        }, () => {});
    }
    window.openFollowingList = async () => {
        followingHasNew = false;
        updateFollowingBadgeVisibility();
        if (auth.currentUser) {
            try { await setDoc(doc(db, "users", auth.currentUser.uid, "meta", "followingFeed"), { hasNew: false }, { merge: true }); } catch(e) {}
        }
        swipeToScreen(document.getElementById('settings-screen'), document.getElementById('following-screen'), 'forward');
        const list = document.getElementById('following-list');
        const following = Array.isArray(userData.following) ? userData.following : [];
        if (!following.length) {
            list.innerHTML = `<div style="text-align:center;padding:50px 20px;color:var(--sub);">
                <i data-lucide="users" style="width:38px;height:38px;opacity:0.4;margin-bottom:10px;"></i>
                <div>Du folgst noch niemandem.</div>
            </div>`;
            if(window.lucide) lucide.createIcons({root: list});
            return;
        }
        list.innerHTML = '<div class="music-loading">L\u00e4dt\u2026</div>';
        const users = await Promise.all(following.map(async uid => ({ uid, data: await getCachedUser(uid) })));
        list.innerHTML = users.map(({uid, data}) => {
            const lastPost = allPosts.filter(p => p.uid === uid).sort((a,b) => (b.timestamp?.toMillis?.()||0) - (a.timestamp?.toMillis?.()||0))[0];
            return `<div class="following-row" onclick="closeFollowingList();openProfileModal('${uid}')">
                <img src="${data.photoURL||''}" class="following-row-avatar">
                <div class="following-row-info">
                    <div class="following-row-name">${data.displayname||'\u2013'} ${data.verified?`<img src="${verifiedIcon}" style="width:14px;height:14px;">`:''}</div>
                    <div class="following-row-sub">${lastPost ? 'Zuletzt gepostet ' + timeAgo(lastPost.timestamp) : 'Noch nichts gepostet'}</div>
                </div>
                <button class="follow-btn following" data-uid="${uid}" onclick="toggleFollow('${uid}', event)">Folge ich</button>
            </div>`;
        }).join('');
        if(window.lucide) lucide.createIcons({root: list});
    };
    window.closeFollowingList = () => {
        swipeToScreen(document.getElementById('following-screen'), document.getElementById('settings-screen'), 'back');
    };

    window.toggleNotifPanel = () => {
        document.getElementById('notif-panel').classList.toggle('open');
    };
    window.toggleAiAssistant = () => {
        const o = document.getElementById('ai-overlay');
        const vis = o.style.display !== 'none' && o.style.display !== '';
        o.style.display = vis ? 'none' : 'flex';
        document.body.style.overflow = vis ? '' : 'hidden';
        if(window.lucide) lucide.createIcons();
    };
    window.logoutUser = async () => {
        if (confirm('Wirklich abmelden?')) { await signOut(auth); location.reload(); }
    };
    document.getElementById('btn-login').onclick = async () => {
        const btn = document.getElementById('btn-login');
        if (btn.classList.contains('is-loading')) return;
        console.log('[cliq] Login-Button geklickt, starte Google-Anmeldung...');
        showToast('Google-Anmeldung wird gestartet...');
        btn.classList.add('is-loading');
        try {
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject({ code: 'cliq/timeout', message: 'Zeit\u00fcberschreitung - keine Antwort von Google nach 20 Sekunden. M\u00f6glicherweise wurde das Popup blockiert.' }), 20000));
            await Promise.race([signInWithPopup(auth, provider), timeoutPromise]);
        } catch (e) {
            console.error('Login-Fehler:', e);
            if (e && (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request')) {
                // User closed the popup themselves - not a real error, no need to alarm them.
            } else {
                showToast(`Anmeldung fehlgeschlagen: ${e?.code || e?.message || 'Unbekannter Fehler'}`);
            }
        } finally {
            btn.classList.remove('is-loading');
        }
    };
    onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
            document.getElementById('login-screen').classList.add('hidden');
            document.getElementById('navbar').classList.remove('hidden');
            document.getElementById('bottom-nav').classList.remove('hidden');
            document.getElementById('bottom-fade').classList.remove('hidden');
            document.getElementById('main-content').classList.remove('hidden');
            const uDoc = await getDoc(doc(db, "users", user.uid));
            if (uDoc.exists()) { userData = uDoc.data(); }
            else {
                userData = { username: "user_"+Math.floor(Math.random()*9999), displayname: user.displayName, photoURL: user.photoURL, email: user.email, verified: (user.email === adminEmail), bio: '' };
                await setDoc(doc(db, "users", user.uid), userData);
            }
            if (user.email === adminEmail) document.getElementById('admin-alert-btn').classList.remove('hidden');
            if (localStorage.getItem('theme') === 'dark') {
                document.body.classList.add('dark'); document.body.classList.remove('light');
                swapIcon(document.getElementById('bn-theme-btn'), 'sun');
            }
            const accent = localStorage.getItem('accentTheme');
            if (accent && accent !== 'default') { document.body.classList.add('theme-'+accent); document.querySelector(`.theme-dot[data-theme="${accent}"]`)?.classList.add('selected'); }
            const soundBtn = document.getElementById('global-sound-toggle');
            soundBtn.classList.remove('hidden');
            globalSoundEnabled = localStorage.getItem('cliq_sound_enabled') === '1';
            soundBtn.classList.toggle('on', globalSoundEnabled);
            swapIcon(soundBtn, globalSoundEnabled ? 'volume-2' : 'volume-x');
            loadFeed();
            loadAlerts(); loadStories(); loadNotifications();
            listenFollowingFeedFlag();
            if(window.lucide) lucide.createIcons();
            setTimeout(adaptNavbar, 300);
        } else {
            ['navbar','bottom-nav','bottom-fade','main-content','settings-screen','bookmarks-screen','following-screen'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.add('hidden');
            });
            document.getElementById('global-sound-toggle')?.classList.add('hidden');
            document.getElementById('login-screen').classList.remove('hidden');
        }
      } catch (err) {
        console.error('Fehler beim Verarbeiten des Login-Status:', err);
        showToast(`Anmeldung fehlgeschlagen: ${err?.code || err?.message || 'Unbekannter Fehler'}`);
        // Don't leave the app stuck in a half-transitioned broken state - fall back to the login screen.
        ['navbar','bottom-nav','bottom-fade','main-content'].forEach(id => {
            document.getElementById(id)?.classList.add('hidden');
        });
        document.getElementById('login-screen')?.classList.remove('hidden');
      }
    });
    window.openAlertModal = () => { document.getElementById('alert-modal').style.display = 'flex'; if(window.lucide) lucide.createIcons(); };
    window.closeAlertModal = () => document.getElementById('alert-modal').style.display = 'none';
    document.getElementById('save-alert-btn').onclick = async () => {
        const text = document.getElementById('alert-text').value.trim();
        const type = document.getElementById('alert-type').value;
        const duration = parseInt(document.getElementById('alert-duration').value);
        if (!text) return;
        let expiresAt = null;
        if (duration > 0) { expiresAt = new Date(); expiresAt.setHours(expiresAt.getHours() + duration); }
        await addDoc(collection(db, "alerts"), { text, type, expiresAt, createdAt: serverTimestamp() });
        document.getElementById('alert-text').value = ''; closeAlertModal(); showToast('Meldung erstellt \u2713');
    };
    function loadAlerts() {
        onSnapshot(collection(db, "alerts"), (snap) => {
            const c = document.getElementById('global-alerts'); c.innerHTML = '';
            const icons = { warning: 'alert-circle', info: 'info', success: 'check-circle' };
            const isAdmin = auth.currentUser?.email === adminEmail;
            snap.forEach(d => {
                const a = d.data();
                if (a.expiresAt && a.expiresAt.toDate && a.expiresAt.toDate() < new Date()) { if(isAdmin) deleteDoc(doc(db,"alerts",d.id)); return; }
                c.innerHTML += `<div class="alert-banner alert-${a.type}"><i data-lucide="${icons[a.type]||'info'}" style="width:18px;flex-shrink:0;"></i><div style="flex:1;font-size:14.5px;">${a.text}</div>${isAdmin?`<button onclick="deleteAlert('${d.id}')" style="background:none;border:none;color:inherit;cursor:pointer;"><i data-lucide="x" style="width:14px;"></i></button>`:''}</div>`;
            });
            if(window.lucide) lucide.createIcons();
        });
    }
    window.deleteAlert = (id) => deleteDoc(doc(db,"alerts",id));
    let globalStories = {};
    let currentStoryUser = null;
    let currentStoryIndex = 0;
    let storyTimer = null;
    let storyStartTime = 0;
    let storyRemainingTime = 5050;
    let isStoryPaused = false;
    function loadStories() {
        onSnapshot(query(collection(db,"stories"), orderBy("createdAt","asc")), (snap) => {
            const bar = document.getElementById('stories-bar');
            bar.innerHTML = `<div class="story-item" onclick="addStoryPrompt()">
                <div style="width:58px;height:58px;border-radius:50%;background:var(--ios-input);display:flex;align-items:center;justify-content:center;border:2px dashed var(--border);transition:transform 0.2s;">
                    <i data-lucide="plus" style="width:22px;color:var(--sub);"></i>
                </div>
                <span class="story-label">Deine Story</span>
            </div>`;
            globalStories = {};
            const now = new Date();
            const TWENTY_FOUR_HOURS = 24*60*60*1000;
            snap.forEach(d => {
                const s = d.data(); s.id = d.id;
                const createdAt = s.createdAt ? s.createdAt.toDate() : now;
                if (now - createdAt > TWENTY_FOUR_HOURS) { if(s.uid === auth.currentUser?.uid) deleteDoc(doc(db,"stories",d.id)); return; }
                if (!globalStories[s.uid]) globalStories[s.uid] = [];
                globalStories[s.uid].push(s);
            });
            const sortedUIDs = Object.keys(globalStories).sort((a,b) => {
                const aU = globalStories[a].some(s => !(s.seenBy||[]).includes(auth.currentUser?.uid));
                const bU = globalStories[b].some(s => !(s.seenBy||[]).includes(auth.currentUser?.uid));
                if (aU && !bU) return -1; if (!aU && bU) return 1;
                const aL = globalStories[a][globalStories[a].length-1].createdAt?.toDate() || 0;
                const bL = globalStories[b][globalStories[b].length-1].createdAt?.toDate() || 0;
                return bL - aL;
            });
            sortedUIDs.forEach(uid => {
                const us = globalStories[uid];
                const last = us[us.length-1];
                const allSeen = us.every(s => (s.seenBy||[]).includes(auth.currentUser?.uid));
                bar.innerHTML += `<div class="story-item" onclick="openStoryGroup('${uid}')">
                    <div class="story-ring ${allSeen?'seen':'unseen'}"><div class="story-ring-inner"><img src="${last.photoURL}" alt=""></div></div>
                    <span class="story-label">${last.displayname}</span>
                </div>`;
            });
            if(window.lucide) lucide.createIcons();
        });
    }
    let storyFileInput = document.createElement('input');
    storyFileInput.type='file'; storyFileInput.accept='image/*';
    let storyPendingFile = null;
    let storyPendingCompressed = null;
    storyFileInput.onchange = async (e) => {
        const file = e.target.files[0]; if (!file) return;
        storyPendingFile = file;
        storyPendingCompressed = null;
        selectedMusicForStory = null;
        const url = URL.createObjectURL(file);
        document.getElementById('story-confirm-preview').src = url;
        renderStoryConfirmMusicChip();
        document.getElementById('story-confirm-modal').style.display = 'flex';
        if(window.lucide) lucide.createIcons();
        setBnProcessing(true, 'Story wird komprimiert\u2026');
        try {
            storyPendingCompressed = await compressImage(file, 1600, 0.85);
        } finally {
            setBnProcessing(false);
        }
    };
    window.addStoryPrompt = () => { storyFileInput.value = ''; storyFileInput.click(); };
    window.closeStoryConfirmModal = () => {
        document.getElementById('story-confirm-modal').style.display = 'none';
        storyPendingFile = null; storyPendingCompressed = null; selectedMusicForStory = null;
        closeAllNestedOverlays();
    };
    function renderStoryConfirmMusicChip() {
        const wrap = document.getElementById('story-confirm-music-chip-wrap');
        const btnLabel = document.querySelector('#story-confirm-music-btn span');
        if (!selectedMusicForStory) {
            wrap.innerHTML = '';
            if (btnLabel) btnLabel.textContent = 'Musik hinzuf\u00fcgen';
            return;
        }
        if (btnLabel) btnLabel.textContent = 'Musik \u00e4ndern';
        wrap.innerHTML = `<div class="composer-music-chip" style="max-width:none;width:100%;margin-bottom:10px;">
            <img src="${selectedMusicForStory.artworkUrl}">
            <span style="max-width:none;flex:1;">${selectedMusicForStory.title} \u00b7 ${selectedMusicForStory.artist}</span>
            <button onclick="event.stopPropagation();selectedMusicForStory=null;renderStoryConfirmMusicChip()"><i data-lucide="x" style="width:13px;"></i></button>
        </div>`;
        if(window.lucide) lucide.createIcons({root: wrap});
    }
    window.publishStory = async () => {
        if (!storyPendingFile) return;
        const uploadFile = storyPendingCompressed || storyPendingFile;
        showToast('Story wird hochgeladen\u2026');
        try {
            const fd = new FormData(); fd.append("image", uploadFile);
            const res = await fetch("https://api.imgbb.com/1/upload?key="+imgbbKey, { method:"POST", body:fd });
            const j = await res.json();
            if (!j?.data?.url) throw new Error('Upload fehlgeschlagen');
            const newStoryRef = await addDoc(collection(db,"stories"), {
                imageUrl: j.data.url, uid: auth.currentUser.uid, displayname: userData.displayname,
                photoURL: userData.photoURL||'', createdAt: serverTimestamp(), seenBy: [],
                music: selectedMusicForStory || null
            });
            notifyFollowersOfNewContent(newStoryRef.id, 'story');
            showToast('Story gepostet! \u{1f389}');
        } catch (err) {
            showToast('Fehler beim Hochladen der Story.');
        } finally {
            closeStoryConfirmModal();
        }
    };
    window.openStoryGroup = (uid) => {
        currentStoryUser = uid;
        const us = globalStories[uid];
        let startIdx = us.findIndex(s => !(s.seenBy||[]).includes(auth.currentUser?.uid));
        if (startIdx === -1) startIdx = 0;
        currentStoryIndex = startIdx;
        document.getElementById('story-lightbox').style.display = 'flex';
        document.body.style.overflow = 'hidden';
        pauseFeedAutoplayObserver();
        renderCurrentStory();
    };
    window.renderCurrentStory = async () => {
        clearTimeout(storyTimer);
        isStoryPaused = false;
        storyRemainingTime = 5050;
        const us = globalStories[currentStoryUser];
        if (!us || currentStoryIndex >= us.length) { closeStoryViewer(); return; }
        const s = us[currentStoryIndex];
        document.getElementById('story-img').src = s.imageUrl;
        document.getElementById('story-name').textContent = s.displayname;
        document.getElementById('story-avi').src = s.photoURL;
        document.getElementById('story-time').textContent = s.createdAt ? timeAgo(s.createdAt) : "Gerade eben";
        const followWrap = document.getElementById('story-follow-btn-wrap');
        if (s.uid === auth.currentUser.uid) {
            followWrap.innerHTML = '';
        } else {
            const following = Array.isArray(userData?.following) ? userData.following : [];
            const isFollowing = following.includes(s.uid);
            followWrap.innerHTML = `<button class="follow-btn follow-btn-story ${isFollowing?'following':''}" data-uid="${s.uid}" onclick="toggleFollow('${s.uid}', event)">${isFollowing?'Folge ich':'Folgen'}</button>`;
        }
        const musicWrap = document.getElementById('story-music-badge-wrap');
        musicWrap.innerHTML = (s.music && s.music.artworkUrl) ? `<div class="sf-music-badge" style="top:64px;">
            <div class="sf-music-badge-tap" onclick="event.stopPropagation();openMusicPlayerModalEncoded('${safeJsonAttr(s.music)}')">
                <img src="${s.music.artworkUrl}" onerror="this.style.display='none'"><span>${(s.music.title||'Unbekannt').toString().slice(0,60)}</span>
            </div>
            ${autoplayToggleBtnHTML(`story:${s.id}`, s.music.previewUrl)}
        </div>` : '';
        playAutoplayFor(`story:${s.id}`, s.music?.previewUrl);
        const createdAtTime = s.createdAt ? s.createdAt.toDate() : new Date();
        const diffMs = (24*60*60*1000) - (new Date() - createdAtTime);
        const timeLeftEl = document.getElementById('story-time-left');
        if (diffMs > 0) {
            const dh = Math.floor(diffMs/(1000*60*60));
            const dm = Math.floor((diffMs%(1000*60*60))/(1000*60));
            timeLeftEl.textContent = `Noch ${dh}h ${dm}min`;
        } else { timeLeftEl.textContent = "L\u00e4uft ab..."; }
        const prog = document.getElementById('story-progress');
        prog.innerHTML = '';
        for (let i = 0; i < us.length; i++) {
            let fillWidth = (i < currentStoryIndex) ? '100%' : '0%';
            prog.innerHTML += `<div class="story-prog-bar"><div class="story-prog-fill" id="spf-${i}" style="width:${fillWidth};"></div></div>`;
        }
        const delBtn = document.getElementById('story-del-btn');
        if (s.uid === auth.currentUser.uid || auth.currentUser.email === adminEmail) {
            delBtn.classList.remove('hidden');
            delBtn.onclick = (e) => { e.stopPropagation(); deleteStory(s.id); };
        } else { delBtn.classList.add('hidden'); }
        if(window.lucide) lucide.createIcons();
        setTimeout(() => { const f = document.getElementById(`spf-${currentStoryIndex}`); if(f) { f.style.transition = `width ${storyRemainingTime}ms linear`; f.style.width='100%'; } }, 50);
        if (!(s.seenBy||[]).includes(auth.currentUser.uid)) {
            await updateDoc(doc(db,"stories",s.id), { seenBy: arrayUnion(auth.currentUser.uid) });
        }
        storyStartTime = Date.now();
        storyTimer = setTimeout(() => nextStory(), storyRemainingTime);
    };
    window.pauseStory = () => {
        if (isStoryPaused) return;
        isStoryPaused = true;
        clearTimeout(storyTimer);
        storyRemainingTime -= (Date.now() - storyStartTime);
        const bar = document.getElementById(`spf-${currentStoryIndex}`);
        if (bar) { const w = window.getComputedStyle(bar).width; bar.style.transition = 'none'; bar.style.width = w; }
    };
    window.resumeStory = () => {
        if (!isStoryPaused) return;
        isStoryPaused = false;
        storyStartTime = Date.now();
        storyTimer = setTimeout(() => nextStory(), storyRemainingTime);
        const bar = document.getElementById(`spf-${currentStoryIndex}`);
        if (bar) { bar.style.transition = `width ${storyRemainingTime}ms linear`; setTimeout(() => { if(!isStoryPaused) bar.style.width = '100%'; }, 50); }
    };
    window.nextStory = (e) => { if(e) e.stopPropagation(); currentStoryIndex++; renderCurrentStory(); };
    window.prevStory = (e) => { if(e) e.stopPropagation(); if(currentStoryIndex > 0) { currentStoryIndex--; renderCurrentStory(); } };
    window.closeStoryViewer = () => { clearTimeout(storyTimer); document.getElementById('story-lightbox').style.display='none'; document.body.style.overflow=''; stopAutoplay(); closeAllNestedOverlays(); scheduleFeedObserverRescan(); };
    window.deleteStory = async (id) => { if(confirm("Story l\u00f6schen?")) { await deleteDoc(doc(db,"stories",id)); showToast('Story gel\u00f6scht'); nextStory(); } };
    window.openPollModal = () => { document.getElementById('poll-modal').style.display='flex'; if(window.lucide) lucide.createIcons(); };
    window.closePollModal = () => document.getElementById('poll-modal').style.display='none';
    window.addPollOption = () => {
        const container = document.getElementById('poll-options-container');
        if (container.children.length >= 4) return showToast('Max. 4 Optionen');
        const div = document.createElement('div'); div.className = 'poll-option-input';
        div.innerHTML = `<input type="text" class="poll-opt" placeholder="Option ${container.children.length+1}" maxlength="50"><button onclick="removePollOpt(this)" style="background:none;border:none;color:var(--sub);cursor:pointer;font-size:18px;">\u00d7</button>`;
        container.appendChild(div);
    };
    window.removePollOpt = (btn) => {
        const container = document.getElementById('poll-options-container');
        if (container.children.length <= 2) return showToast('Mindestens 2 Optionen ben\u00f6tigt');
        btn.parentElement.remove();
    };
    window.submitPoll = async () => {
        const question = document.getElementById('poll-question').value.trim();
        if (!question) return showToast('Bitte eine Frage eingeben');
        const opts = [...document.querySelectorAll('.poll-opt')].map(i => i.value.trim()).filter(Boolean);
        if (opts.length < 2) return showToast('Mindestens 2 Optionen ben\u00f6tigt');
        const pollData = { question, options: opts.map(o => ({ text: o, votes: [] })) };
        await addDoc(collection(db,"posts"), { text: question, poll: pollData, uid: auth.currentUser.uid, timestamp: serverTimestamp(), likes: [], reactions: {}, isPinned: false });
        closePollModal();
        document.getElementById('poll-question').value = '';
        showToast('Umfrage gepostet \u2713');
    };
    window.votePoll = async (postId, optionIndex) => {
        const ref = doc(db,"posts",postId);
        const snap = await getDoc(ref);
        const poll = snap.data().poll;
        const uid = auth.currentUser.uid;
        poll.options.forEach(o => { o.votes = (o.votes||[]).filter(u => u !== uid); });
        if (!(poll.options[optionIndex].votes||[]).includes(uid)) {
            poll.options[optionIndex].votes.push(uid);
        }
        await updateDoc(ref, { poll });
    };
    window.repostPost = async (postId) => {
        const snap = await getDoc(doc(db,"posts",postId));
        const p = snap.data();
        if (p.uid === auth.currentUser.uid) return showToast('Du kannst deinen eigenen Post nicht reposten');
        await addDoc(collection(db,"posts"), {
            text: p.text, imageUrl: p.imageUrl||null, uid: auth.currentUser.uid,
            timestamp: serverTimestamp(), likes: [], reactions: {}, isPinned: false,
            repostOf: { originalUid: p.uid, originalPostId: postId, originalDisplayname: '' }
        });
        const uSnap = await getDoc(doc(db,"users",p.uid));
        sendNotification(p.uid, 'repost', postId);
        showToast('Repostet! \u{1f501}');
    };
    window.startEditPost = (postId, encodedText) => {
        const postCard = document.getElementById('post-'+postId);
        const textDiv = postCard.querySelector('.post-text');
        const origText = decodeURIComponent(encodedText);
        textDiv.innerHTML = `<textarea class="edit-post-area" id="edit-area-${postId}">${origText}</textarea>
            <div style="display:flex;gap:8px;margin-top:6px;">
                <button onclick="saveEditPost('${postId}')" class="btn-primary" style="padding:8px;font-size:13px;">Speichern</button>
                <button onclick="cancelEditPost('${postId}','${encodedText}')" class="btn-ghost" style="padding:8px;font-size:13px;color:var(--sub);">Abbrechen</button>
            </div>`;
        const menu = document.getElementById('menu-'+postId);
        if(menu) { menu.classList.add('hidden'); const card = menu.closest('.card'); if(card) card.style.zIndex = ''; }
    };
    window.saveEditPost = async (postId) => {
        const newText = document.getElementById('edit-area-'+postId)?.value.trim();
        if (!newText) return showToast('Text darf nicht leer sein');
        await updateDoc(doc(db,"posts",postId), { text: newText, edited: true });
        showToast('Post bearbeitet \u2713');
    };
    window.cancelEditPost = (postId, encodedText) => {
        const postCard = document.getElementById('post-'+postId);
        const textDiv = postCard.querySelector('.post-text');
        textDiv.innerHTML = parseText(decodeURIComponent(encodedText));
    };
    function encodeEmoji(e) { return e.codePointAt(0).toString(16); }
    function renderPostHTML(p, u) {
        const likes = Array.isArray(p.likes) ? p.likes : [];
        const hasLiked = likes.includes(auth.currentUser?.uid);
        const isAdmin = auth.currentUser?.email === adminEmail;
        const isOwner = auth.currentUser?.uid === p.uid;
        const isBookmarked = bookmarkedIds.includes(p.id);
        const reactions = p.reactions || {};
        const uid = p.uid;
        let reactionHTML = '';
        REACTIONS.forEach(emoji => {
            const users = reactions[encodeEmoji(emoji)] || [];
            if (users.length > 0) {
                const myReact = users.includes(auth.currentUser?.uid);
                reactionHTML += `<span class="emoji-count" onclick="toggleReaction('${p.id}','${encodeEmoji(emoji)}')" style="${myReact?'border:1.5px solid var(--nexus);':''}">${emoji} <span>${users.length}</span></span>`;
            }
        });
        let pollHTML = '';
        if (p.poll) {
            const totalVotes = p.poll.options.reduce((sum, o) => sum + (o.votes||[]).length, 0);
            const myVoteIdx = p.poll.options.findIndex(o => (o.votes||[]).includes(auth.currentUser?.uid));
            pollHTML = `<div class="poll-container">
                ${p.poll.options.map((opt, i) => {
                    const pct = totalVotes ? Math.round((opt.votes||[]).length / totalVotes * 100) : 0;
                    const isMyVote = myVoteIdx === i;
                    return `<div class="poll-option ${isMyVote?'voted-this':''}" onclick="votePoll('${p.id}',${i})">
                        <div class="poll-fill" style="width:${myVoteIdx > -1 ? pct : 0}%"></div>
                        <div class="poll-label"><span>${opt.text} ${isMyVote?'\u2713':''}</span>${myVoteIdx > -1 ? `<span class="poll-pct">${pct}%</span>` : ''}</div>
                    </div>`;
                }).join('')}
                <div class="poll-total">${totalVotes} Stimme${totalVotes !== 1 ? 'n' : ''}</div>
            </div>`;
        }
        const repostLabelHTML = p.repostOf ? `<div class="repost-label"><i data-lucide="repeat-2" style="width:14px;"></i> Repost</div>` : '';
        const editedHTML = p.edited ? `<span style="font-size:11px;color:var(--sub);"> (bearbeitet)</span>` : '';
        const viewsCount = p.views || 0;
        return `
            ${p.isPinned ? `<div class="pinned-label"><i data-lucide="pin" style="width:13px;"></i> Von cliq. fixiert</div>` : ''}
            ${repostLabelHTML}
            <div class="post-header">
                <img src="${u.photoURL||''}" class="user-img" onclick="openProfileModal('${uid}')">
                <div style="flex-grow:1;">
                    <div class="display-name" onclick="openProfileModal('${uid}')">${u.displayname||'\u2013'} ${u.verified?`<img src="${verifiedIcon}" class="verified-badge">`:''}${editedHTML}</div>
                    <div style="font-size:12px;color:var(--sub);">@${u.username||'\u2013'} \u00b7 <span class="post-time">${timeAgo(p.timestamp)}</span></div>
                </div>
                ${followButtonHTML(uid)}
                <button onclick="toggleAdminMenu('${p.id}')" style="background:none;border:none;color:var(--sub);cursor:pointer;padding:4px;border-radius:50%;"><i data-lucide="more-horizontal" style="width:18px;"></i></button>
                <div id="menu-${p.id}" class="admin-menu hidden">
                    <button onclick="sharePost('${p.id}')"><i data-lucide="share-2" style="width:15px;"></i> Teilen</button>
                    <button onclick="copyPostText('${p.id}','${encodeURIComponent(p.text||'')}')"><i data-lucide="copy" style="width:15px;"></i> Text kopieren</button>
                    ${isOwner ? `<button onclick="startEditPost('${p.id}','${encodeURIComponent(p.text||'')}')"><i data-lucide="pen-line" style="width:15px;"></i> Bearbeiten</button>` : ''}
                    ${isAdmin ? `
                    <button onclick="togglePin('${p.id}',${p.isPinned||false})"><i data-lucide="pin" style="width:15px;"></i> ${p.isPinned?'L\u00f6sen':'Anpinnen'}</button>
                    <button onclick="toggleVerify('${uid}',${u.verified||false})"><i data-lucide="shield-check" style="width:15px;"></i> ${u.verified?'Ent-verifizieren':'Verifizieren'}</button>` : ''}
                    ${isAdmin||isOwner ? `<button onclick="deletePost('${p.id}')" style="color:var(--danger);"><i data-lucide="trash-2" style="width:15px;"></i> L\u00f6schen</button>` : ''}
                </div>
            </div>
            ${!p.poll ? `<div class="post-text">${parseText(p.text||'')}</div>` : ''}
            ${pollHTML}
            ${postMusicChipHTML(p.music, p.id)}
            ${p.imageUrl ? `<div class="post-img-wrap"><img src="${p.imageUrl}" class="post-img" onclick="openLightbox('${p.imageUrl}')"></div>` : ''}
            ${p.videoUrl ? `<div class="post-img-wrap"><video src="${p.videoUrl}" class="post-video" controls playsinline></video></div>` : ''}
            <div class="emoji-reaction-wrapper">${reactionHTML ? `<div class="emoji-reaction-bar" style="margin-top:10px;">${reactionHTML}</div>` : ''}</div>
            ${viewsCount > 0 ? `<div class="post-views"><i data-lucide="eye" style="width:13px;"></i> ${viewsCount.toLocaleString('de')} Aufrufe</div>` : ''}
            <div class="reaction-bar">
                <button onclick="toggleLike('${p.id}','${uid}')" class="react-btn like-btn ${hasLiked?'liked':''}">
                    <i data-lucide="heart" style="width:17px;${hasLiked?'fill:currentColor;':''}"></i> <span>${likes.length}</span>
                </button>
                <button onclick="showComments('${p.id}')" class="react-btn"><i data-lucide="message-circle" style="width:17px;"></i></button>
                <button onclick="repostPost('${p.id}')" class="react-btn" title="Reposten"><i data-lucide="repeat-2" style="width:17px;"></i></button>
                <div style="position:relative;display:flex;align-items:center;">
                    <button onclick="toggleEmojiPicker(event,'${p.id}')" class="react-btn"><i data-lucide="smile-plus" style="width:17px;"></i></button>
                </div>
                <button onclick="toggleBookmark('${p.id}')" class="react-btn bookmark-btn ${isBookmarked?'bookmarked':''}" style="margin-left:auto;">
                    <i data-lucide="bookmark" style="width:17px;${isBookmarked?'fill:currentColor;':''}"></i>
                </button>
                <button onclick="sharePost('${p.id}')" class="react-btn"><i data-lucide="share-2" style="width:17px;"></i></button>
            </div>
            <div id="comments-section-${p.id}" class="hidden" style="margin-top:12px;"></div>`;
    }
    function loadFeed() {
        onSnapshot(query(collection(db,"posts"), orderBy("timestamp","desc")), (snap) => {
            try {
                let posts = [];
                snap.forEach(d => posts.push({ id: d.id, ...d.data() }));
                posts.sort((a,b) => (b.isPinned||0) - (a.isPinned||0));
                allPosts = posts;
                const feed = document.getElementById('feed');
                const existingIds = new Set([...feed.children].map(c => c.id));
                const newIds = new Set(posts.map(p => 'post-'+p.id));
                existingIds.forEach(id => { if(!newIds.has(id)) document.getElementById(id)?.remove(); });
                posts.forEach((p, idx) => {
                    getDoc(doc(db,"users",p.uid)).then(uSnap => {
                        try {
                            const u = uSnap.data() || {};
                            const pid = 'post-'+p.id;
                            const likes = Array.isArray(p.likes) ? p.likes : [];
                            const hasLiked = likes.includes(auth.currentUser?.uid);
                            const isBookmarked = bookmarkedIds.includes(p.id);
                            const reactions = p.reactions || {};
                            let div = document.getElementById(pid);
                            const isNew = !div;
                            if (isNew) {
                                div = document.createElement('div');
                                div.id = pid; div.className = 'card post-new-anim';
                            }
                            const cards = [...feed.children];
                            if (cards[idx] !== div) {
                                if (idx >= cards.length) feed.appendChild(div);
                                else feed.insertBefore(div, cards[idx]);
                            }
                            if (p.music && p.music.previewUrl) {
                                div.dataset.autoplayKey = `post:${p.id}`;
                                div.dataset.previewUrl = p.music.previewUrl;
                            } else {
                                delete div.dataset.autoplayKey;
                                delete div.dataset.previewUrl;
                            }
                            let reactionHTML = '';
                            REACTIONS.forEach(emoji => {
                                const users = reactions[encodeEmoji(emoji)] || [];
                                if (users.length > 0) {
                                    const myReact = users.includes(auth.currentUser?.uid);
                                    reactionHTML += `<span class="emoji-count" onclick="toggleReaction('${p.id}','${encodeEmoji(emoji)}')" style="${myReact?'border:1.5px solid var(--nexus);':''}">${emoji} <span>${users.length}</span></span>`;
                                }
                            });
                            if (isNew) {
                                div.innerHTML = renderPostHTML(p, u);
                                if(window.lucide) lucide.createIcons({root: div});
                                trackView(p.id);
                            } else {
                                const likeBtn = div.querySelector('.like-btn');
                                if(likeBtn) {
                                    likeBtn.className = `react-btn like-btn ${hasLiked?'liked':''}`;
                                    likeBtn.innerHTML = `<i data-lucide="heart" style="width:17px;${hasLiked?'fill:currentColor;':''}"></i> <span>${likes.length}</span>`;
                                    if(window.lucide) lucide.createIcons({root: likeBtn});
                                }
                                const bkmBtn = div.querySelector('.bookmark-btn');
                                if(bkmBtn) {
                                    bkmBtn.className = `react-btn bookmark-btn ${isBookmarked?'bookmarked':''}`;
                                    bkmBtn.innerHTML = `<i data-lucide="bookmark" style="width:17px;${isBookmarked?'fill:currentColor;':''}"></i>`;
                                    if(window.lucide) lucide.createIcons({root: bkmBtn});
                                }
                                const emojiWrap = div.querySelector('.emoji-reaction-wrapper');
                                if(emojiWrap) emojiWrap.innerHTML = reactionHTML ? `<div class="emoji-reaction-bar" style="margin-top:10px;">${reactionHTML}</div>` : '';
                                const timeSpan = div.querySelector('.post-time');
                                if(timeSpan) timeSpan.textContent = timeAgo(p.timestamp);
                                if (p.poll) {
                                    const pollContainer = div.querySelector('.poll-container');
                                    if (pollContainer) {
                                        const totalVotes = p.poll.options.reduce((sum, o) => sum + (o.votes||[]).length, 0);
                                        const myVoteIdx = p.poll.options.findIndex(o => (o.votes||[]).includes(auth.currentUser?.uid));
                                        pollContainer.innerHTML = p.poll.options.map((opt, i) => {
                                            const pct = totalVotes ? Math.round((opt.votes||[]).length / totalVotes * 100) : 0;
                                            const isMyVote = myVoteIdx === i;
                                            return `<div class="poll-option ${isMyVote?'voted-this':''}" onclick="votePoll('${p.id}',${i})">
                                                <div class="poll-fill" style="width:${myVoteIdx > -1 ? pct : 0}%"></div>
                                                <div class="poll-label"><span>${opt.text} ${isMyVote?'\u2713':''}</span>${myVoteIdx > -1 ? `<span class="poll-pct">${pct}%</span>` : ''}</div>
                                            </div>`;
                                        }).join('') + `<div class="poll-total">${totalVotes} Stimme${totalVotes !== 1 ? 'n' : ''}</div>`;
                                    }
                                }
                            }
                            scheduleFeedObserverRescan();
                        } catch (renderErr) {
                            console.error('Fehler beim Rendern von Post', p.id, renderErr);
                        }
                    }).catch(userErr => console.error('Fehler beim Laden des Nutzers f\u00fcr Post', p.id, userErr));
                });
            } catch (snapErr) {
                console.error('Fehler beim Verarbeiten des Feed-Snapshots:', snapErr);
                showToast('Feed konnte nicht geladen werden. Bitte neu laden.');
            }
        }, (err) => {
            console.error('Firestore onSnapshot Fehler (posts):', err);
            showToast('Verbindung zum Feed fehlgeschlagen: ' + (err.message || err.code || 'Unbekannter Fehler'));
        });
    }
    const viewedPosts = new Set(JSON.parse(sessionStorage.getItem('nexus_viewed') || '[]'));
    async function trackView(postId) {
        if (viewedPosts.has(postId)) return;
        viewedPosts.add(postId);
        sessionStorage.setItem('nexus_viewed', JSON.stringify([...viewedPosts]));
        try { await updateDoc(doc(db,"posts",postId), { views: increment(1) }); } catch(e) {}
    }
    window.toggleEmojiPicker = (e, id) => {
        e.stopPropagation();
        document.querySelectorAll('.emoji-picker-popup').forEach(p => p.remove());
        const btn = e.currentTarget;
        const rect = btn.getBoundingClientRect();
        const picker = document.createElement('div');
        picker.className = 'emoji-picker-popup';
        picker.id = 'emoji-picker-'+id;
        picker.innerHTML = REACTIONS.map(em => `<button class="emoji-btn-pick" onclick="toggleReaction('${id}','${encodeEmoji(em)}'); this.closest('.emoji-picker-popup').remove();">${em}</button>`).join('');
        document.body.appendChild(picker);
        const pickerRect = picker.getBoundingClientRect();
        let top = rect.top - pickerRect.height - 10;
        let left = rect.left + rect.width/2 - pickerRect.width/2;
        if (top < 60) top = rect.bottom + 10;
        if (left < 8) left = 8;
        if (left + 260 > window.innerWidth) left = window.innerWidth - 268;
        picker.style.top = top + 'px';
        picker.style.left = left + 'px';
        if(window.lucide) lucide.createIcons({root: picker});
    };
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.emoji-picker-popup') && !e.target.closest('[onclick*="toggleEmojiPicker"]')) {
            document.querySelectorAll('.emoji-picker-popup').forEach(p => p.remove());
        }
        if (!e.target.closest('.admin-menu') && !e.target.closest('[onclick^="toggleAdminMenu"]') && !e.target.closest('#nav-more-btn')) {
            document.querySelectorAll('.admin-menu').forEach(m => m.classList.add('hidden'));
            document.querySelectorAll('.card').forEach(c => c.style.zIndex = '');
        }
        if (!e.target.closest('#notif-panel') && !e.target.closest('#notif-btn') && !e.target.closest('#notif-btn-clone')) {
            document.getElementById('notif-panel')?.classList.remove('open');
        }
        if (!e.target.closest('#nav-dropdown') && !e.target.closest('#nav-more-btn')) {
            document.getElementById('nav-dropdown')?.classList.add('hidden');
        }
    });
    window.toggleReaction = async (postId, emojiCode) => {
        const ref = doc(db,"posts",postId);
        const uid = auth.currentUser.uid;
        const snap = await getDoc(ref);
        const reactions = snap.data().reactions || {};
        const users = reactions[emojiCode] || [];
        const newUsers = users.includes(uid) ? users.filter(u => u !== uid) : [...users, uid];
        await updateDoc(ref, { [`reactions.${emojiCode}`]: newUsers });
    };
    window.copyPostText = (id, encodedText) => {
        navigator.clipboard?.writeText(decodeURIComponent(encodedText));
        showToast('Text kopiert \u{1f4cb}');
        const menu = document.getElementById('menu-'+id);
        if(menu) { menu.classList.add('hidden'); const card = menu.closest('.card'); if(card) card.style.zIndex = ''; }
    };
    window.sharePost = async (id) => {
        const url = location.href.split('#')[0]+'#post-'+id;
        if (navigator.share) navigator.share({ title: 'cliq.', url });
        else { navigator.clipboard?.writeText(url); showToast('Link kopiert \u{1f517}'); }
    };
    window.showComments = async (postId) => {
        const container = document.getElementById('comments-section-'+postId);
        if (!container.classList.contains('hidden')) { container.classList.add('hidden'); return; }
        container.classList.remove('hidden');
        container.innerHTML = '<div style="font-size:12px;color:var(--sub);padding:8px;">Lade...</div>';
        const q = query(collection(db,"posts",postId,"comments"), orderBy("timestamp","asc"));
        onSnapshot(q, (snap) => {
            if (container.classList.contains('hidden')) return;
            const inputEl = document.getElementById('input-'+postId);
            const savedVal = inputEl?.value || '';
            container.innerHTML = `<div id="list-${postId}"></div>
                <div class="comment-input-area">
                    <img src="${userData?.photoURL}" style="width:26px;height:26px;border-radius:50%;object-fit:cover;flex-shrink:0;">
                    <input type="text" id="input-${postId}" placeholder="Kommentieren\u2026" value="${savedVal}" style="flex:1;border:none;background:none;color:var(--text);font-size:14px;outline:none;font-family:inherit;">
                    <button onclick="addComment('${postId}')" class="send-btn" style="width:28px;height:28px;"><i data-lucide="arrow-up" style="width:14px;stroke-width:3;"></i></button>
                </div>`;
            const list = document.getElementById('list-'+postId);
            if (snap.empty) { list.innerHTML = '<div style="font-size:12px;color:var(--sub);text-align:center;padding:10px 0;">Noch keine Kommentare.</div>'; }
            else {
                list.innerHTML = '';
                snap.forEach(dDoc => {
                    const c = dDoc.data();
                    const isCOwner = auth.currentUser?.uid === c.uid;
                    const isAdmin = auth.currentUser?.email === adminEmail;
                    list.innerHTML += `<div class="comment-card">
                        <div class="comment-header">
                            <img src="${c.photoURL||''}" class="comment-user-img">
                            <span class="comment-display-name">${c.displayname||'\u2013'} ${c.verified?`<img src="${verifiedIcon}" style="width:13px;height:13px;">`:''}</span>
                            <span class="comment-time">${timeAgo(c.timestamp)}</span>
                            ${(isAdmin||isCOwner)?`<button class="comment-delete-btn" onclick="deleteComment('${postId}','${dDoc.id}')"><i data-luci
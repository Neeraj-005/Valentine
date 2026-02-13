/* ========================================
   MOBILE-FIRST ROMANTIC WEBSITE JAVASCRIPT  
   ======================================== */

// === MUSIC PLAYER WITH PERSISTENT STATE (GLOBAL ACROSS PAGES) ===
let currentTrackIndex = 0;
let isMuted = false;

// Save music state to localStorage
function saveMusicState() {
    const player = document.getElementById('musicPlayer');
    if (player) {
        localStorage.setItem('musicState', JSON.stringify({
            trackIndex: currentTrackIndex,
            currentTime: player.currentTime,
            isPlaying: !player.paused && !isMuted,
            volume: player.volume
        }));
    }
}

// Restore music state from localStorage
function restoreMusicState() {
    const savedState = localStorage.getItem('musicState');
    if (savedState) {
        try {
            return JSON.parse(savedState);
        } catch (e) {
            return null;
        }
    }
    return null;
}

function toggleMusic() {
    const player = document.getElementById('musicPlayer');
    const icon = document.getElementById('musicIcon');

    if (!player) return;

    if (isMuted || player.paused) {
        player.play().catch(e => console.log('Autoplay prevented:', e));
        icon.textContent = '🔊';
        isMuted = false;
    } else {
        player.pause();
        icon.textContent = '🔇';
        isMuted = true;
    }
    saveMusicState();
}

function playNextTrack() {
    if (typeof playlist === 'undefined' || playlist.length === 0) return;

    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    const player = document.getElementById('musicPlayer');

    if (player) {
        player.src = playlist[currentTrackIndex];
        if (!isMuted) {
            player.play().catch(e => console.log('Playback error:', e));
        }
        saveMusicState();
    }
}

// Initialize music player when DOM is ready
function initMusicPlayer() {
    const player = document.getElementById('musicPlayer');

    if (!player) return;

    // Restore previous state
    const savedState = restoreMusicState();

    if (savedState) {
        currentTrackIndex = savedState.trackIndex || 0;
        isMuted = !savedState.isPlaying;

        // Set the correct track
        if (typeof playlist !== 'undefined' && playlist.length > 0) {
            player.src = playlist[currentTrackIndex];
        }

        // Restore volume
        if (savedState.volume !== undefined) {
            player.volume = savedState.volume;
        }

        // Wait for metadata to load before seeking
        player.addEventListener('loadedmetadata', function seekToSavedTime() {
            if (savedState.currentTime && savedState.currentTime > 0) {
                player.currentTime = savedState.currentTime;
            }

            // Resume playback if it was playing before
            if (savedState.isPlaying) {
                player.play().catch(e => {
                    console.log('Autoplay prevented - user interaction needed');
                    const icon = document.getElementById('musicIcon');
                    if (icon) icon.textContent = '🔇';
                    isMuted = true;
                });
            }

            // Remove this listener after first use
            player.removeEventListener('loadedmetadata', seekToSavedTime);
        });

        // Update icon based on state
        const icon = document.getElementById('musicIcon');
        if (icon) {
            icon.textContent = savedState.isPlaying ? '🔊' : '🔇';
        }
    } else {
        // No saved state - first time loading
        player.volume = 0.5;
        setTimeout(() => {
            player.play().catch(e => {
                console.log('Autoplay prevented - user interaction needed');
                const icon = document.getElementById('musicIcon');
                if (icon) icon.textContent = '🔇';
                isMuted = true;
            });
        }, 500);
    }

    // Play next track when current one ends
    player.addEventListener('ended', playNextTrack);

    // Save state periodically (every 2 seconds while playing)
    setInterval(() => {
        if (player && !player.paused) {
            saveMusicState();
        }
    }, 2000);
}

// Save state before page unloads
window.addEventListener('beforeunload', saveMusicState);

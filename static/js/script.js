/* ========================================
   MOBILE-FIRST ROMANTIC WEBSITE JAVASCRIPT  
   ======================================== */

// === MUSIC PLAYER (AUTO-PLAY WITH POSITION PERSISTENCE) ===
let currentTrackIndex = 0;
let isMuted = false;

// Save current position
function saveMusicPosition() {
    const player = document.getElementById('musicPlayer');
    if (player && !player.paused) {
        localStorage.setItem('musicPosition', JSON.stringify({
            trackIndex: currentTrackIndex,
            currentTime: player.currentTime
        }));
    }
}

// Get saved position
function getSavedPosition() {
    const saved = localStorage.getItem('musicPosition');
    return saved ? JSON.parse(saved) : null;
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
    }
}

// Initialize music player - auto-play with position restore
function initMusicPlayer() {
    const player = document.getElementById('musicPlayer');
    const icon = document.getElementById('musicIcon');

    if (!player) return;

    // Set initial icon
    if (icon) icon.textContent = '🔊';

    // Get saved position
    const saved = getSavedPosition();

    if (saved && typeof playlist !== 'undefined' && playlist.length > 0) {
        // Restore track and position
        currentTrackIndex = saved.trackIndex || 0;
        player.src = playlist[currentTrackIndex];

        // Wait for metadata before seeking
        player.addEventListener('loadedmetadata', function restorePosition() {
            if (saved.currentTime > 0 && saved.currentTime < player.duration) {
                player.currentTime = saved.currentTime;
            }
            player.removeEventListener('loadedmetadata', restorePosition);
        });
    }

    // Set volume
    player.volume = 0.5;

    // Auto-play
    const playPromise = player.play();

    if (playPromise !== undefined) {
        playPromise.then(() => {
            console.log('Music playing from:', saved ? `${Math.floor(saved.currentTime)}s` : 'start');
            if (icon) icon.textContent = '🔊';
        }).catch(e => {
            console.log('Autoplay prevented - click music button to play');
            if (icon) icon.textContent = '🔇';
            isMuted = true;
        });
    }

    // Play next track when current one ends
    player.addEventListener('ended', playNextTrack);

    // Save position every 2 seconds
    setInterval(saveMusicPosition, 2000);
}

// Save position before leaving page
window.addEventListener('beforeunload', saveMusicPosition);



// === TYPING ANIMATION FOR LOVE LETTER ===
function typeWriter(text, elementId, speed = 30) {
    const element = document.getElementById(elementId);
    if (!element) return;

    let i = 0;
    element.innerHTML = '';

    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

// === SURPRISE MODAL WITH CONFETTI ===
function showSurprise() {
    const modal = document.getElementById('surpriseModal');
    if (modal) {
        modal.classList.add('show');
        createConfetti();

        // Play a little vibration on mobile if supported
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
    }
}

function closeSurprise() {
    const modal = document.getElementById('surpriseModal');
    if (modal) {
        modal.classList.remove('show');
        clearConfetti();
    }
}

// === CONFETTI ANIMATION ===
let confettiInterval;
const confettiColors = ['#ff9a9e', '#fad0c4', '#fbc2eb', '#a18cd1', '#ff6b9d', '#c2e9fb'];

function createConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const confettiPieces = [];
    const confettiCount = 100;

    // Create confetti pieces
    for (let i = 0; i < confettiCount; i++) {
        confettiPieces.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            w: Math.random() * 10 + 5,
            h: Math.random() * 5 + 5,
            color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 5 - 2.5,
            velocityY: Math.random() * 3 + 2,
            velocityX: Math.random() * 2 - 1
        });
    }

    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        confettiPieces.forEach((piece, index) => {
            piece.y += piece.velocityY;
            piece.x += piece.velocityX;
            piece.rotation += piece.rotationSpeed;

            ctx.save();
            ctx.translate(piece.x, piece.y);
            ctx.rotate((piece.rotation * Math.PI) / 180);
            ctx.fillStyle = piece.color;
            ctx.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
            ctx.restore();

            // Reset confetti that falls off screen
            if (piece.y > canvas.height) {
                piece.y = -20;
                piece.x = Math.random() * canvas.width;
            }
        });

        confettiInterval = requestAnimationFrame(animateConfetti);
    }

    animateConfetti();
}

function clearConfetti() {
    if (confettiInterval) {
        cancelAnimationFrame(confettiInterval);
    }
    const canvas = document.getElementById('confettiCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// === PHOTO MODAL ===
let currentPhotoLabel = '';
let currentPhotoIndex = 0;
let allPhotos = [];

function openPhotoModal(photoFilename, photoLabel) {
    const modal = document.getElementById('photoModal');
    const modalImg = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');

    if (modal && modalImg) {
        // Build photos array from the gallery if not already done
        if (allPhotos.length === 0) {
            const photoCards = document.querySelectorAll('.photo-card');
            photoCards.forEach(card => {
                const img = card.querySelector('.photo-img');
                const label = card.querySelector('.photo-label');
                if (img && label) {
                    allPhotos.push({
                        filename: img.src.split('/').pop(),
                        label: label.textContent
                    });
                }
            });
            console.log('Built photos array:', allPhotos);
        }

        // Find current photo index
        currentPhotoIndex = allPhotos.findIndex(photo => photo.label === photoLabel);
        if (currentPhotoIndex === -1) currentPhotoIndex = 0;
        console.log('Opening photo index:', currentPhotoIndex, 'Label:', photoLabel);

        modal.classList.add('show');
        modalImg.src = `/static/photos/${photoFilename}`;

        if (modalCaption) {
            modalCaption.innerHTML = `${photoLabel} ❤️`;
        }

        currentPhotoLabel = photoLabel;

        // Prevent body scrolling when modal is open
        document.body.style.overflow = 'hidden';
    }
}

function closePhotoModal() {
    const modal = document.getElementById('photoModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

function navigatePhoto(direction) {
    console.log('navigatePhoto called with direction:', direction);
    console.log('Current photos array:', allPhotos);

    if (allPhotos.length === 0) {
        console.error('No photos in array!');
        return;
    }

    currentPhotoIndex = (currentPhotoIndex + direction + allPhotos.length) % allPhotos.length;
    const photo = allPhotos[currentPhotoIndex];
    console.log('Navigating to photo index:', currentPhotoIndex, 'Photo:', photo);

    const modalImg = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');

    if (modalImg) {
        modalImg.src = `/static/photos/${photo.filename}`;
    }

    if (modalCaption) {
        modalCaption.innerHTML = `${photo.label} ❤️`;
    }

    currentPhotoLabel = photo.label;
}

// === SCROLL FADE-IN ANIMATIONS ===
function observeElements() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.photo-card, .letter-card');
    fadeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// === SMOOTH SCROLL ===
function smoothScrollTo(element) {
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// === CLOSE MODALS ON OUTSIDE CLICK ===
function setupModalClicks() {
    const modals = document.querySelectorAll('.modal');

    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                clearConfetti();
                document.body.style.overflow = 'auto';
            }
        });
    });
}

// === TOUCH FEEDBACK FOR BUTTONS ===
function addTouchFeedback() {
    const buttons = document.querySelectorAll('.primary-button, .surprise-button, .close-modal');

    buttons.forEach(button => {
        button.addEventListener('touchstart', () => {
            button.style.transform = 'scale(0.95)';
        });

        button.addEventListener('touchend', () => {
            button.style.transform = 'scale(1)';
        });
    });
}

// === KEYBOARD NAVIGATION FOR ACCESSIBILITY ===
document.addEventListener('keydown', (e) => {
    // Close modals with Escape key
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
            if (openModal.id === 'photoModal') {
                closePhotoModal();
            } else {
                openModal.classList.remove('show');
                clearConfetti();
                document.body.style.overflow = 'auto';
            }
        }
    }

    // Navigate photos with arrow keys
    const photoModal = document.getElementById('photoModal');
    if (photoModal && photoModal.classList.contains('show')) {
        if (e.key === 'ArrowLeft') {
            navigatePhoto(-1);
        } else if (e.key === 'ArrowRight') {
            navigatePhoto(1);
        }
    }
});

// === RESIZE HANDLER FOR CONFETTI CANVAS ===
window.addEventListener('resize', () => {
    const canvas = document.getElementById('confettiCanvas');
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
});

// === PAGE LOAD ANIMATIONS ===
window.addEventListener('DOMContentLoaded', () => {
    // Initialize music player
    initMusicPlayer();

    // Add fade-in observer for elements
    observeElements();

    // Setup modal outside clicks
    setupModalClicks();

    // Add touch feedback
    addTouchFeedback();

    // Animate entrance elements
    setTimeout(() => {
        const fadeElements = document.querySelectorAll('.fade-in, .fade-in-delay');
        fadeElements.forEach((el, index) => {
            setTimeout(() => {
                el.style.opacity = '1';
            }, index * 200);
        });
    }, 100);
});

// === PREVENT ACCIDENTAL ZOOM ON DOUBLE TAP (iOS Safari) ===
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);

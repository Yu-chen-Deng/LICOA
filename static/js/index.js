window.HELP_IMPROVE_VIDEOJS = false;

// More Works Dropdown Functionality
function toggleMoreWorks() {
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    } else {
        const rect = button.getBoundingClientRect();
        dropdown.style.maxHeight = Math.max(80, window.innerHeight - rect.bottom - 24) + 'px';
        dropdown.style.right = Math.min(0, rect.right - dropdown.offsetWidth - 16) + 'px';
        dropdown.classList.add('show');
        button.classList.add('active');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const container = document.querySelector('.more-works-container');
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (container && !container.contains(event.target)) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Close dropdown on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const dropdown = document.getElementById('moreWorksDropdown');
        const button = document.querySelector('.more-works-btn');
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Copy BibTeX to clipboard
function copyBibTeX() {
    const bibtexElement = document.getElementById('bibtex-code');
    const button = document.querySelector('.copy-bibtex-btn');
    const copyText = button.querySelector('.copy-text');
    
    if (bibtexElement) {
        navigator.clipboard.writeText(bibtexElement.textContent).then(function() {
            // Success feedback
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        }).catch(function(err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = bibtexElement.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        });
    }
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
    } else {
        scrollButton.classList.remove('visible');
    }
});

// Video carousel autoplay when in view
function setupVideoCarouselAutoplay() {
    const carouselVideos = document.querySelectorAll('.results-carousel video');
    
    if (carouselVideos.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                // Video is in view, play it
                video.play().catch(e => {
                    // Autoplay failed, probably due to browser policy
                    console.log('Autoplay prevented:', e);
                });
            } else {
                // Video is out of view, pause it
                video.pause();
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the video is visible
    });
    
    carouselVideos.forEach(video => {
        observer.observe(video);
    });
}

$(document).ready(function() {
    // Check for click events on the navbar burger icon

    var options = {
		slidesToScroll: 1,
		slidesToShow: 1,
		loop: true,
		infinite: false,
        // Keep one full-width slide at every viewport; library defaults show 2–3.
        breakpoints: [],
		autoplay: true,
		autoplaySpeed: 5000,
    }

	// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);
    // This Bulma version recalculates widths only when the slide count changes.
    // Refresh dimensions as the container resizes, even with one slide throughout.
    const carouselResizeObserver = new ResizeObserver(() => {
        carousels.forEach(carousel => carousel._breakpoint.apply());
    });
    document.querySelectorAll('.results-carousel').forEach(element => {
        carouselResizeObserver.observe(element);
    });
	
    bulmaSlider.attach();
    
    // Setup video autoplay for carousel
    setupVideoCarouselAutoplay();

})


// Autoplay the background unless the user prefers reduced motion.
document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('hero-video');
    if (!video) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPlayback = () => {
        if (motion.matches) video.pause();
        else video.play().catch(() => {});
    };
    motion.addEventListener('change', syncPlayback);
    syncPlayback();
});


// Move the same More Works control from the opening corner into the sticky bar.
document.addEventListener('DOMContentLoaded', () => {
    const hero = document.querySelector('.poster-hero');
    const topbar = document.querySelector('.project-topbar');
    const slot = document.querySelector('.more-works-slot');
    const works = document.querySelector('.more-works-container');
    if (!hero || !topbar || !slot || !works) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const article = document.querySelector('#abstract .content');
    let frame;
    let lastLayoutKey;
    const syncTopbar = () => {
        frame = null;
        const heroRect = hero.getBoundingClientRect();
        const dockDistance = heroRect.height - topbar.offsetHeight;
        const stuck = heroRect.bottom <= topbar.offsetHeight + 1;
        const travel = Math.min(dockDistance, Math.max(0, -heroRect.top));
        const articleWidth = article ? article.getBoundingClientRect().width : 900;
        const layoutKey = [travel, heroRect.height, window.innerWidth, articleWidth, motion.matches].join(':');
        // After docking, scrolling the article requires no animation or layout writes.
        if (layoutKey === lastLayoutKey) return;
        lastLayoutKey = layoutKey;
        const blend = Math.min(1, Math.max(0, (travel - dockDistance + 180) / 180));
        topbar.style.setProperty('--nav-solid', blend * blend * (3 - 2 * blend));
        topbar.classList.toggle('is-stuck', stuck);
        works.classList.toggle('is-docked', stuck);
        topbar.style.setProperty('--article-width', articleWidth + 'px');
        const mobile = window.matchMedia('(max-width: 768px)').matches;
        const startY = mobile ? 12 : 32;
        const progress = motion.matches ? Number(stuck) : Math.min(1, Math.max(0, -heroRect.top / Math.max(1, dockDistance)));
        const eased = progress * progress * (3 - 2 * progress);
        const collapseProgress = Math.min(1, Math.max(0, (progress - .55) / .35));
        const collapse = collapseProgress * collapseProgress * (3 - 2 * collapseProgress);
        works.style.setProperty('--works-collapse', collapse);
        const startX = window.innerWidth - works.offsetWidth - (mobile ? 16 : 32);
        // Reserve space gradually as the floating button joins the navigation.
        slot.style.width = works.offsetWidth * eased + 'px';
        const slotRect = slot.getBoundingClientRect();
        const barRect = topbar.getBoundingClientRect();
        const endY = slotRect.top - barRect.top;
        works.style.setProperty('--works-x', (startX + (slotRect.left - startX) * eased) + 'px');
        works.style.setProperty('--works-y', (startY + (endY - startY) * eased) + 'px');
        const dropdown = document.getElementById('moreWorksDropdown');
        if (dropdown.classList.contains('show')) {
            const worksRect = works.getBoundingClientRect();
            dropdown.style.maxHeight = Math.max(80, window.innerHeight - worksRect.bottom - 24) + 'px';
            dropdown.style.right = Math.min(0, worksRect.right - dropdown.offsetWidth - 16) + 'px';
        }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(syncTopbar); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    motion.addEventListener('change', schedule);
    const layoutObserver = new ResizeObserver(schedule);
    layoutObserver.observe(works.querySelector('.more-works-btn'));
    if (article) layoutObserver.observe(article);
    syncTopbar();
});

// Give the opening poster a deliberate two-step wheel pause before the article.
// Touch, keyboard navigation, and section links retain normal browser scrolling.
document.addEventListener('DOMContentLoaded', () => {
    const hero = document.querySelector('.poster-hero');
    const topbar = document.querySelector('.project-topbar');
    if (!hero || !topbar) return;
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let holding = false;
    let released = false;
    let remaining = 2;
    let lastStep = 0;
    const boundary = () => hero.offsetTop + hero.offsetHeight - topbar.offsetHeight;
    window.addEventListener('scroll', () => {
        if (window.scrollY < boundary() - 100) {
            holding = false;
            released = false;
            remaining = 2;
        }
    }, { passive: true });
    window.addEventListener('wheel', event => {
        if (!pointer.matches || event.ctrlKey || event.metaKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
        if (event.target instanceof Element && event.target.closest('.more-works-dropdown, iframe, pre')) return;
        if (event.deltaY <= 0) {
            holding = false;
            released = false;
            remaining = 2;
            return;
        }
        const edge = boundary();
        if (released || window.scrollY > edge + 2) return;
        const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
        if (!holding && window.scrollY + delta >= edge && window.scrollY <= edge) {
            event.preventDefault();
            window.scrollTo({ top: edge, behavior: 'instant' });
            holding = true;
            remaining = 2;
            lastStep = performance.now();
            return;
        }
        if (!holding) return;
        const now = performance.now();
        // Treat a burst of touchpad inertia as one step, rather than many wheel ticks.
        if (now - lastStep >= 120) {
            if (remaining === 0) {
                holding = false;
                released = true;
                return;
            }
            remaining -= 1;
        }
        lastStep = now;
        event.preventDefault();
    }, { passive: false });
});

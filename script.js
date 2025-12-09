/* ========================================
   TS.Lab - Unified JavaScript
   All pages functionality + GTM events
   ======================================== */

// Initialize dataLayer
window.dataLayer = window.dataLayer || [];

// ==========================================
// UTILITY FUNCTIONS
// ==========================================
function getTime() {
  return new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ==========================================
// PARTICLE SYSTEM
// ==========================================
function createParticles() {
  const particlesContainer = document.getElementById('particles');
  if (!particlesContainer) return;
  
  const count = 50;
  for (let i = 0; i < count; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100 + 100}%`;
    particle.style.animationDelay = `${Math.random() * 20}s`;
    particle.style.animationDuration = `${15 + Math.random() * 10}s`;
    particlesContainer.appendChild(particle);
  }
}

// ==========================================
// PROGRESS BAR
// ==========================================
function updateProgressBar() {
  const progressFill = document.getElementById('progressFill');
  if (!progressFill) return;
  
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPosition = window.scrollY;
  const progress = scrollHeight > 0 ? (scrollPosition / scrollHeight) * 100 : 0;
  progressFill.style.width = `${progress}%`;
}

// ==========================================
// SCROLL ANIMATIONS
// ==========================================
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('[data-animate], .card, .tool-card, .playlist-card, .about-card, .about-content');
  
  const observerOptions = {
    root: null,
    rootMargin: '-10% 0px -10% 0px',
    threshold: 0.2
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 100);
      }
    });
  }, observerOptions);
  
  animatedElements.forEach(el => observer.observe(el));
}

// ==========================================
// NAVIGATION TRACKING
// ==========================================
function initNavTracking() {
  // Track nav link clicks
  document.querySelectorAll('.nav-link, .nav-logo').forEach(link => {
    link.addEventListener('click', () => {
      const navTarget = link.dataset.nav || 'home';
      dataLayer.push({
        event: 'navigation_click',
        nav_target: navTarget
      });
    });
  });
}

// ==========================================
// BUTTON TRACKING (HOMEPAGE)
// ==========================================
function initButtonTracking() {
  // Track all buttons and links with data-btn
  document.querySelectorAll('[data-btn]').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      dataLayer.push({
        event: 'hover_button',
        button_name: btn.dataset.btn
      });
    });
    
    btn.addEventListener('click', () => {
      dataLayer.push({
        event: 'button_click',
        button_name: btn.dataset.btn
      });
    });
  });
  
  // Track tool cards
  document.querySelectorAll('.tool-card[data-tool]').forEach(card => {
    card.addEventListener('mouseenter', () => {
      dataLayer.push({
        event: 'hover_card',
        card_name: card.dataset.tool
      });
    });
    
    card.addEventListener('click', () => {
      dataLayer.push({
        event: 'card_click',
        card_name: card.dataset.tool
      });
    });
  });
}

// ==========================================
// DEMO CONSOLE (HOMEPAGE)
// ==========================================
function initDemoConsole() {
  const consoleOutput = document.getElementById('consoleOutput');
  const demoButtons = document.querySelectorAll('.demo-btn');
  
  if (!consoleOutput || !demoButtons.length) return;
  
  demoButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const demoId = btn.dataset.demo;
      const eventData = {
        event: 'button_click',
        button_name: demoId,
        timestamp: new Date().toISOString()
      };
      
      // Push to actual dataLayer
      dataLayer.push(eventData);
      
      // Display in console
      addConsoleLine(eventData);
    });
  });
  
  function addConsoleLine(data) {
    const line = document.createElement('div');
    line.className = 'console-line';
    line.innerHTML = `
      <span class="console-time">${getTime()}</span>
      <span class="console-event">${data.event}</span>
      <span class="console-text">→ ${data.button_name}</span>
    `;
    
    // Remove placeholder if exists
    const placeholder = consoleOutput.querySelector('.muted');
    if (placeholder) placeholder.parentElement.remove();
    
    consoleOutput.appendChild(line);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
    
    // Keep only last 10 lines
    while (consoleOutput.children.length > 10) {
      consoleOutput.removeChild(consoleOutput.firstChild);
    }
  }
}

// ==========================================
// IMAGE HOVER TRACKING (HOMEPAGE)
// ==========================================
function initImageTracking() {
  const heroImage = document.getElementById('img-hero');
  if (heroImage) {
    heroImage.addEventListener('mouseenter', () => {
      dataLayer.push({
        event: 'hover_immagine',
        element_id: 'img-hero'
      });
    });
  }
}

// ==========================================
// SOUNDCLOUD TRACKING (PLAYLIST)
// ==========================================
function initSoundCloudTracking() {
  if (typeof SC === 'undefined') return;
  
  const players = document.querySelectorAll('iframe.soundcloud-player');
  const nowPlayingTrack = document.getElementById('nowPlayingTrack');
  const playingStatus = document.getElementById('playingStatus');
  
  players.forEach((iframe, index) => {
    const card = iframe.closest('.playlist-card');
    const trackName = card?.dataset.name || `Track ${index + 1}`;
    
    try {
      const widget = SC.Widget(iframe);
      let hasPlayed = false;
      
      widget.bind(SC.Widget.Events.READY, function() {
        widget.bind(SC.Widget.Events.PLAY, function() {
          if (!hasPlayed) {
            widget.getPosition(function(position) {
              dataLayer.push({
                event: 'soundcloud_play',
                track_name: trackName,
                timestamp: Math.floor(position / 1000)
              });
            });
            hasPlayed = true;
          }
          
          // Update Now Playing
          if (nowPlayingTrack) nowPlayingTrack.textContent = trackName;
          if (playingStatus) {
            playingStatus.classList.add('playing');
            playingStatus.querySelector('span:last-child').textContent = 'In riproduzione';
          }
        });
        
        widget.bind(SC.Widget.Events.PAUSE, function() {
          widget.getPosition(function(position) {
            dataLayer.push({
              event: 'soundcloud_pause',
              track_name: trackName,
              timestamp: Math.floor(position / 1000)
            });
          });
          hasPlayed = false;
          
          // Update Now Playing
          if (playingStatus) {
            playingStatus.classList.remove('playing');
            playingStatus.querySelector('span:last-child').textContent = 'In pausa';
          }
        });
        
        widget.bind(SC.Widget.Events.FINISH, function() {
          dataLayer.push({
            event: 'soundcloud_finish',
            track_name: trackName,
            timestamp: 'end'
          });
          hasPlayed = false;
          
          // Update Now Playing
          if (playingStatus) {
            playingStatus.classList.remove('playing');
            playingStatus.querySelector('span:last-child').textContent = 'Completato';
          }
        });
      });
    } catch (e) {
      console.log('SoundCloud widget error:', e);
    }
  });
}

// Playlist card tracking
function initPlaylistCardTracking() {
  document.querySelectorAll('.playlist-card').forEach(card => {
    const name = card.dataset.name;
    
    card.addEventListener('mouseenter', () => {
      dataLayer.push({
        event: 'hover_card',
        card_name: name
      });
    });
  });
}

// ==========================================
// UTM BUILDER FUNCTIONALITY
// ==========================================
const utmTaxonomy = {
  social: {
    label: 'Social',
    mediums: [
      { value: 'facebook', label: 'Facebook', icon: '📘' },
      { value: 'instagram', label: 'Instagram', icon: '📸' },
      { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
      { value: 'twitter', label: 'Twitter/X', icon: '🐦' },
      { value: 'youtube', label: 'YouTube', icon: '▶️' },
      { value: 'tiktok', label: 'TikTok', icon: '🎵' },
      { value: 'pinterest', label: 'Pinterest', icon: '📌' },
      { value: 'threads', label: 'Threads', icon: '🧵' }
    ]
  },
  email: {
    label: 'Email',
    mediums: [
      { value: 'newsletter', label: 'Newsletter', icon: '📬' },
      { value: 'dem', label: 'DEM', icon: '📧' },
      { value: 'transactional', label: 'Transactional', icon: '🧾' },
      { value: 'automated', label: 'Automated', icon: '🤖' },
      { value: 'welcome_series', label: 'Welcome Series', icon: '👋' },
      { value: 'retention', label: 'Retention', icon: '🔄' }
    ]
  },
  paid: {
    label: 'Paid Ads',
    mediums: [
      { value: 'cpc', label: 'CPC', icon: '💰' },
      { value: 'cpm', label: 'CPM', icon: '👁️' },
      { value: 'display', label: 'Display', icon: '🖼️' },
      { value: 'retargeting', label: 'Retargeting', icon: '🎯' },
      { value: 'native', label: 'Native', icon: '📰' },
      { value: 'video', label: 'Video', icon: '🎬' },
      { value: 'shopping', label: 'Shopping', icon: '🛒' },
      { value: 'pmax', label: 'Performance Max', icon: '🚀' }
    ]
  },
  referral: {
    label: 'Referral',
    mediums: [
      { value: 'partner', label: 'Partner', icon: '🤝' },
      { value: 'blog', label: 'Blog', icon: '✍️' },
      { value: 'pr', label: 'PR', icon: '📣' },
      { value: 'press', label: 'Press', icon: '🗞️' },
      { value: 'guest_post', label: 'Guest Post', icon: '📝' },
      { value: 'forum', label: 'Forum', icon: '💬' }
    ]
  },
  affiliate: {
    label: 'Affiliate',
    mediums: [
      { value: 'affiliate', label: 'Affiliate Link', icon: '🔗' },
      { value: 'influencer', label: 'Influencer', icon: '⭐' },
      { value: 'ambassador', label: 'Ambassador', icon: '🏆' },
      { value: 'ugc', label: 'UGC', icon: '👥' },
      { value: 'review', label: 'Review', icon: '⭐' }
    ]
  },
  display: {
    label: 'Display',
    mediums: [
      { value: 'banner', label: 'Banner', icon: '🪧' },
      { value: 'native', label: 'Native', icon: '📰' },
      { value: 'programmatic', label: 'Programmatic', icon: '🤖' },
      { value: 'rich_media', label: 'Rich Media', icon: '✨' },
      { value: 'interstitial', label: 'Interstitial', icon: '📱' }
    ]
  }
};

// UTM State
const utmState = {
  baseUrl: '',
  source: '',
  medium: '',
  campaign: '',
  content: '',
  term: '',
  hasStartedTyping: false,
  hasCopied: false
};

function initUtmBuilder() {
  const page = document.body.dataset.page;
  if (page !== 'utm-builder') return;
  
  const elements = {
    baseUrl: document.getElementById('baseUrl'),
    utmCampaign: document.getElementById('utmCampaign'),
    utmContent: document.getElementById('utmContent'),
    utmTerm: document.getElementById('utmTerm'),
    urlStatus: document.getElementById('urlStatus'),
    sourceValue: document.getElementById('sourceValue'),
    mediumValue: document.getElementById('mediumValue'),
    sourceGrid: document.getElementById('sourceGrid'),
    mediumGrid: document.getElementById('mediumGrid'),
    mediumPlaceholder: document.getElementById('mediumPlaceholder'),
    resultUrl: document.getElementById('resultUrl'),
    breakdownItems: document.getElementById('breakdownItems'),
    utmBreakdown: document.getElementById('utmBreakdown'),
    copyBtn: document.getElementById('copyBtn'),
    resetBtn: document.getElementById('resetBtn')
  };
  
  if (!elements.baseUrl) return;
  
  // URL Validation
  function isValidUrl(string) {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }
  
  function validateUrl() {
    const url = elements.baseUrl.value.trim();
    if (!url) {
      elements.urlStatus.className = 'input-status';
      return false;
    }
    if (isValidUrl(url)) {
      elements.urlStatus.className = 'input-status valid';
      return true;
    } else {
      elements.urlStatus.className = 'input-status invalid';
      return false;
    }
  }
  
  // Track generation start
  function trackGenerationStart() {
    if (!utmState.hasStartedTyping) {
      utmState.hasStartedTyping = true;
      dataLayer.push({
        event: 'utmgeneration_start',
        timestamp: new Date().toISOString()
      });
      console.log('📊 dataLayer push: utmgeneration_start');
    }
  }
  
  // Source selection
  function initSourceButtons() {
    const buttons = elements.sourceGrid.querySelectorAll('.source-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const source = btn.dataset.source;
        utmState.source = source;
        utmState.medium = '';
        
        elements.sourceValue.textContent = utmTaxonomy[source].label;
        elements.mediumValue.textContent = '—';
        
        renderMediumOptions(source);
        updateGeneratedUrl();
        
        dataLayer.push({
          event: 'utm_source_selected',
          utm_source: source
        });
      });
    });
  }
  
  // Medium selection
  function renderMediumOptions(source) {
    const taxonomy = utmTaxonomy[source];
    if (!taxonomy) {
      elements.mediumPlaceholder.classList.remove('hidden');
      elements.mediumGrid.classList.add('hidden');
      return;
    }
    
    elements.mediumPlaceholder.classList.add('hidden');
    elements.mediumGrid.classList.remove('hidden');
    elements.mediumGrid.innerHTML = '';
    
    taxonomy.mediums.forEach(medium => {
      const btn = document.createElement('button');
      btn.className = 'medium-btn';
      btn.dataset.medium = medium.value;
      btn.innerHTML = `
        <span class="medium-icon">${medium.icon}</span>
        <span>${medium.label}</span>
      `;
      btn.addEventListener('click', () => selectMedium(medium.value, medium.label));
      elements.mediumGrid.appendChild(btn);
    });
    
    // Animate buttons
    const buttons = elements.mediumGrid.querySelectorAll('.medium-btn');
    buttons.forEach((btn, index) => {
      btn.style.opacity = '0';
      btn.style.transform = 'translateY(10px)';
      setTimeout(() => {
        btn.style.transition = 'all 0.3s ease';
        btn.style.opacity = '1';
        btn.style.transform = 'translateY(0)';
      }, index * 50);
    });
  }
  
  function selectMedium(value, label) {
    const buttons = elements.mediumGrid.querySelectorAll('.medium-btn');
    buttons.forEach(b => b.classList.remove('active'));
    
    const activeBtn = elements.mediumGrid.querySelector(`[data-medium="${value}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    
    utmState.medium = value;
    elements.mediumValue.textContent = label;
    updateGeneratedUrl();
    
    dataLayer.push({
      event: 'utm_medium_selected',
      utm_medium: value
    });
  }
  
  // URL generation
  function sanitizeUtmValue(value) {
    return value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_-]/g, '');
  }
  
  function updateGeneratedUrl() {
    const baseUrl = utmState.baseUrl || elements.baseUrl.value.trim();
    
    if (!baseUrl || !isValidUrl(baseUrl)) {
      elements.resultUrl.innerHTML = '<span class="url-placeholder">Compila i campi per generare il link</span>';
      elements.copyBtn.disabled = true;
      elements.utmBreakdown.classList.remove('visible');
      return;
    }
    
    const params = new URLSearchParams();
    const breakdown = [];
    
    if (utmState.source) {
      params.append('utm_source', utmState.source);
      breakdown.push({ key: 'utm_source', value: utmState.source });
    }
    
    if (utmState.medium) {
      params.append('utm_medium', utmState.medium);
      breakdown.push({ key: 'utm_medium', value: utmState.medium });
    }
    
    const campaign = elements.utmCampaign.value.trim();
    if (campaign) {
      params.append('utm_campaign', sanitizeUtmValue(campaign));
      breakdown.push({ key: 'utm_campaign', value: sanitizeUtmValue(campaign) });
    }
    
    const content = elements.utmContent.value.trim();
    if (content) {
      params.append('utm_content', sanitizeUtmValue(content));
      breakdown.push({ key: 'utm_content', value: sanitizeUtmValue(content) });
    }
    
    const term = elements.utmTerm.value.trim();
    if (term) {
      params.append('utm_term', sanitizeUtmValue(term));
      breakdown.push({ key: 'utm_term', value: sanitizeUtmValue(term) });
    }
    
    const separator = baseUrl.includes('?') ? '&' : '?';
    const paramsString = params.toString();
    
    if (paramsString) {
      const fullUrl = `${baseUrl}${separator}${paramsString}`;
      const formattedUrl = formatUrlForDisplay(baseUrl, params);
      elements.resultUrl.innerHTML = `<span class="url-generated">${formattedUrl}</span>`;
      elements.copyBtn.disabled = false;
      elements.copyBtn.dataset.url = fullUrl;
      renderBreakdown(breakdown);
      elements.utmBreakdown.classList.add('visible');
    } else {
      elements.resultUrl.innerHTML = `<span class="url-generated"><span class="url-base">${escapeHtml(baseUrl)}</span></span>`;
      elements.copyBtn.disabled = true;
      elements.copyBtn.dataset.url = baseUrl;
      elements.utmBreakdown.classList.remove('visible');
    }
  }
  
  function formatUrlForDisplay(baseUrl, params) {
    let html = `<span class="url-base">${escapeHtml(baseUrl)}</span>`;
    const separator = baseUrl.includes('?') ? '&' : '?';
    const entries = [...params.entries()];
    entries.forEach((entry, index) => {
      const [key, value] = entry;
      const prefix = index === 0 ? separator : '&';
      html += `${prefix}<span class="url-param">${key}</span>=<span class="url-value">${escapeHtml(value)}</span>`;
    });
    return html;
  }
  
  function renderBreakdown(breakdown) {
    elements.breakdownItems.innerHTML = breakdown.map(item => `
      <div class="breakdown-item">
        <span class="breakdown-key">${item.key}</span>
        <span class="breakdown-value">${escapeHtml(item.value)}</span>
      </div>
    `).join('');
  }
  
  // Copy functionality
  function copyToClipboard() {
    const url = elements.copyBtn.dataset.url;
    if (!url) return;
    
    navigator.clipboard.writeText(url).then(() => {
      elements.copyBtn.classList.add('copied');
      setTimeout(() => {
        elements.copyBtn.classList.remove('copied');
      }, 2000);
      
      if (!utmState.hasCopied) {
        dataLayer.push({
          event: 'utmgeneration_completed',
          generated_url: url,
          utm_source: utmState.source,
          utm_medium: utmState.medium,
          utm_campaign: elements.utmCampaign.value.trim() || null,
          utm_content: elements.utmContent.value.trim() || null,
          utm_term: elements.utmTerm.value.trim() || null,
          timestamp: new Date().toISOString()
        });
        console.log('📊 dataLayer push: utmgeneration_completed');
        utmState.hasCopied = true;
      }
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }
  
  // Reset functionality
  function resetForm() {
    utmState.baseUrl = '';
    utmState.source = '';
    utmState.medium = '';
    utmState.hasStartedTyping = false;
    utmState.hasCopied = false;
    
    elements.baseUrl.value = '';
    elements.utmCampaign.value = '';
    elements.utmContent.value = '';
    elements.utmTerm.value = '';
    
    elements.urlStatus.className = 'input-status';
    elements.sourceValue.textContent = '—';
    elements.mediumValue.textContent = '—';
    
    const sourceButtons = elements.sourceGrid.querySelectorAll('.source-btn');
    sourceButtons.forEach(btn => btn.classList.remove('active'));
    
    elements.mediumPlaceholder.classList.remove('hidden');
    elements.mediumGrid.classList.add('hidden');
    elements.mediumGrid.innerHTML = '';
    
    elements.resultUrl.innerHTML = '<span class="url-placeholder">Compila i campi per generare il link</span>';
    elements.copyBtn.disabled = true;
    elements.utmBreakdown.classList.remove('visible');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    dataLayer.push({
      event: 'utm_builder_reset',
      timestamp: new Date().toISOString()
    });
  }
  
  // Event listeners
  elements.baseUrl.addEventListener('input', (e) => {
    utmState.baseUrl = e.target.value.trim();
    validateUrl();
    updateGeneratedUrl();
    trackGenerationStart();
  });
  
  elements.utmCampaign.addEventListener('input', updateGeneratedUrl);
  elements.utmContent.addEventListener('input', updateGeneratedUrl);
  elements.utmTerm.addEventListener('input', updateGeneratedUrl);
  
  elements.copyBtn.addEventListener('click', copyToClipboard);
  elements.resetBtn.addEventListener('click', resetForm);
  
  // Initialize source buttons
  initSourceButtons();
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
      const activeElement = document.activeElement;
      if (activeElement === elements.copyBtn || activeElement.closest('.final-card')) {
        copyToClipboard();
      }
    }
    if (e.key === 'Escape') {
      const confirmReset = confirm('Vuoi ricominciare da capo?');
      if (confirmReset) resetForm();
    }
  });
  
  // Initial dataLayer event
  dataLayer.push({
    event: 'utm_builder_loaded',
    timestamp: new Date().toISOString()
  });
  
  console.log('🔗 UTM Builder initialized');
}

// ==========================================
// PAGE-SPECIFIC INITIALIZATION
// ==========================================
function initPage() {
  const page = document.body.dataset.page;
  
  // Common initializations
  createParticles();
  initScrollAnimations();
  initNavTracking();
  updateProgressBar();
  window.addEventListener('scroll', updateProgressBar);
  
  // Page-specific initializations
  switch (page) {
    case 'home':
      initButtonTracking();
      initDemoConsole();
      initImageTracking();
      dataLayer.push({ event: 'page_view', page_name: 'home' });
      console.log('🏠 Homepage initialized');
      break;
      
    case 'playlist':
      initPlaylistCardTracking();
      // Wait for SoundCloud API to load
      setTimeout(initSoundCloudTracking, 1000);
      dataLayer.push({ event: 'page_view', page_name: 'playlist' });
      console.log('🎵 Playlist page initialized');
      break;
      
    case 'utm-builder':
      initUtmBuilder();
      console.log('🔗 UTM Builder page initialized');
      break;
      
    default:
      console.log('📄 Page initialized');
  }
}

// ==========================================
// INITIALIZATION
// ==========================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPage);
} else {
  initPage();
}

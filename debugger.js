/* ========================================
   GA4 Event Debugger - JavaScript
   Demo Mode with Event Simulation
   ======================================== */

// Initialize dataLayer
window.dataLayer = window.dataLayer || [];

// ==========================================
// STATE MANAGEMENT
// ==========================================
const debuggerState = {
  events: [],
  cartItems: [],
  cartCount: 0,
  currentPage: 'home',
  currentFilter: 'all',
  stats: {
    total: 0,
    pageViews: 0,
    ecommerce: 0
  }
};

// ==========================================
// DOM ELEMENTS
// ==========================================
const elements = {
  demoWebsite: document.getElementById('demoWebsite'),
  eventsList: document.getElementById('eventsList'),
  eventDetail: document.getElementById('eventDetail'),
  detailContent: document.getElementById('detailContent'),
  cartCount: document.getElementById('cartCount'),
  totalEvents: document.getElementById('totalEvents'),
  pageViews: document.getElementById('pageViews'),
  ecomEvents: document.getElementById('ecomEvents'),
  clearEvents: document.getElementById('clearEvents'),
  exportEvents: document.getElementById('exportEvents'),
  closeDetail: document.getElementById('closeDetail'),
  refreshDemo: document.getElementById('refreshDemo')
};

// ==========================================
// EVENT CLASSIFICATION
// ==========================================
const eventTypes = {
  page: ['page_view', 'virtual_pageview'],
  ecommerce: ['view_item', 'add_to_cart', 'remove_from_cart', 'begin_checkout', 'purchase', 'view_item_list', 'select_item'],
  engagement: ['click', 'scroll', 'video_start', 'video_complete', 'file_download', 'form_start', 'form_submit', 'newsletter_signup', 'social_click']
};

function classifyEvent(eventName) {
  for (const [type, events] of Object.entries(eventTypes)) {
    if (events.some(e => eventName.toLowerCase().includes(e.toLowerCase()))) {
      return type;
    }
  }
  return 'custom';
}

// ==========================================
// TIME FORMATTING
// ==========================================
function getTime() {
  return new Date().toLocaleTimeString('it-IT', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    fractionalSecondDigits: 3
  }).slice(0, -1);
}

function getTimestamp() {
  return new Date().toISOString();
}

// ==========================================
// EVENT TRACKING
// ==========================================
function trackEvent(eventName, eventParams = {}) {
  const event = {
    id: Date.now() + Math.random(),
    timestamp: getTimestamp(),
    time: getTime(),
    event: eventName,
    type: classifyEvent(eventName),
    params: eventParams
  };
  
  // Add to state
  debuggerState.events.unshift(event);
  debuggerState.stats.total++;
  
  if (event.type === 'page') debuggerState.stats.pageViews++;
  if (event.type === 'ecommerce') debuggerState.stats.ecommerce++;
  
  // Push to actual dataLayer
  dataLayer.push({
    event: eventName,
    ...eventParams
  });
  
  // Update UI
  updateStats();
  renderEvent(event);
  
  console.log('📊 Event tracked:', eventName, eventParams);
}

// ==========================================
// RENDER FUNCTIONS
// ==========================================
function renderEvent(event) {
  // Remove empty state if present
  const emptyState = elements.eventsList.querySelector('.events-empty');
  if (emptyState) emptyState.remove();
  
  // Check filter
  if (debuggerState.currentFilter !== 'all' && event.type !== debuggerState.currentFilter) {
    return;
  }
  
  // Create event element
  const eventEl = document.createElement('div');
  eventEl.className = 'event-item';
  eventEl.dataset.eventId = event.id;
  
  // Build params preview
  const paramsPreview = Object.entries(event.params)
    .slice(0, 3)
    .map(([key, value]) => `
      <span class="event-param">
        <span class="param-key">${key}:</span>
        <span class="param-value">${truncate(String(value), 15)}</span>
      </span>
    `).join('');
  
  eventEl.innerHTML = `
    <div class="event-indicator ${event.type}"></div>
    <div class="event-content">
      <div class="event-header">
        <span class="event-name">${event.event}</span>
        <span class="event-time">${event.time}</span>
      </div>
      <div class="event-params">
        ${paramsPreview}
      </div>
    </div>
  `;
  
  // Add click handler
  eventEl.addEventListener('click', () => showEventDetail(event));
  
  // Insert at top
  elements.eventsList.insertBefore(eventEl, elements.eventsList.firstChild);
  
  // Keep only last 100 events in DOM
  while (elements.eventsList.children.length > 100) {
    elements.eventsList.removeChild(elements.eventsList.lastChild);
  }
}

function showEventDetail(event) {
  const json = formatJSON(event);
  elements.detailContent.innerHTML = `<pre class="detail-json">${json}</pre>`;
  elements.eventDetail.classList.add('open');
}

function formatJSON(obj) {
  const json = JSON.stringify(obj, null, 2);
  return json
    .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
    .replace(/: "([^"]+)"/g, ': <span class="json-string">"$1"</span>')
    .replace(/: (\d+\.?\d*)/g, ': <span class="json-number">$1</span>')
    .replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>');
}

function truncate(str, len) {
  return str.length > len ? str.slice(0, len) + '...' : str;
}

function updateStats() {
  elements.totalEvents.textContent = debuggerState.stats.total;
  elements.pageViews.textContent = debuggerState.stats.pageViews;
  elements.ecomEvents.textContent = debuggerState.stats.ecommerce;
}

function renderAllEvents() {
  // Clear list
  elements.eventsList.innerHTML = '';
  
  // Filter events
  const filteredEvents = debuggerState.currentFilter === 'all'
    ? debuggerState.events
    : debuggerState.events.filter(e => e.type === debuggerState.currentFilter);
  
  if (filteredEvents.length === 0) {
    elements.eventsList.innerHTML = `
      <div class="events-empty">
        <div class="empty-icon">📡</div>
        <p>Nessun evento</p>
        <span>Interagisci con il sito demo</span>
      </div>
    `;
    return;
  }
  
  // Render events (newest first, but reverse for DOM insertion)
  filteredEvents.slice(0, 100).reverse().forEach(event => {
    renderEvent(event);
  });
}

// ==========================================
// DEMO SITE INTERACTIONS
// ==========================================
function initDemoSite() {
  const website = elements.demoWebsite;
  
  // Track initial page view
  setTimeout(() => {
    trackEvent('page_view', {
      page_title: 'Home - DemoShop',
      page_location: 'https://demo-ecommerce.shop/',
      page_path: '/'
    });
  }, 500);
  
  // Navigation
  website.querySelectorAll('.demo-nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      switchPage(page);
    });
  });
  
  // Hero CTA
  website.querySelectorAll('[data-action="hero_cta"]').forEach(btn => {
    btn.addEventListener('click', () => {
      trackEvent('click', {
        click_element: 'hero_cta',
        click_text: btn.textContent.trim()
      });
      switchPage('products');
    });
  });
  
  // Promo Banner
  website.querySelectorAll('[data-action="promo_banner"]').forEach(banner => {
    banner.addEventListener('click', () => {
      trackEvent('select_promotion', {
        promotion_id: 'DEMO20',
        promotion_name: 'Sconto 20%',
        creative_slot: 'homepage_banner'
      });
    });
  });
  
  // Product Cards - View
  website.querySelectorAll('.demo-product-card').forEach(card => {
    // Track view on hover
    card.addEventListener('mouseenter', () => {
      const product = getProductData(card);
      trackEvent('view_item', {
        currency: 'EUR',
        value: product.price,
        items: [{
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          price: product.price,
          quantity: 1
        }]
      });
    });
  });
  
  // Add to Cart buttons
  website.querySelectorAll('[data-action="add_to_cart"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.demo-product-card');
      const product = getProductData(card);
      
      // Update cart
      debuggerState.cartCount++;
      debuggerState.cartItems.push(product);
      elements.cartCount.textContent = debuggerState.cartCount;
      
      // Track event
      trackEvent('add_to_cart', {
        currency: 'EUR',
        value: product.price,
        items: [{
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          price: product.price,
          quantity: 1
        }]
      });
      
      // Visual feedback
      btn.textContent = '✓ Aggiunto!';
      btn.style.background = '#10b981';
      setTimeout(() => {
        btn.textContent = 'Aggiungi al Carrello';
        btn.style.background = '';
      }, 1500);
    });
  });
  
  // Cart click
  document.getElementById('demoCart').addEventListener('click', () => {
    if (debuggerState.cartCount > 0) {
      trackEvent('begin_checkout', {
        currency: 'EUR',
        value: debuggerState.cartItems.reduce((sum, item) => sum + item.price, 0),
        items: debuggerState.cartItems.map((item, index) => ({
          item_id: item.id,
          item_name: item.name,
          item_category: item.category,
          price: item.price,
          quantity: 1,
          index: index
        }))
      });
    } else {
      trackEvent('click', {
        click_element: 'cart_icon',
        cart_status: 'empty'
      });
    }
  });
  
  // Newsletter
  website.querySelectorAll('[data-action="newsletter_signup"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const email = document.getElementById('newsletterEmail').value;
      trackEvent('newsletter_signup', {
        method: 'homepage_form',
        email_provided: email.length > 0
      });
      
      // Visual feedback
      btn.textContent = '✓ Iscritto!';
      btn.style.background = '#10b981';
    });
  });
  
  // Filter buttons
  website.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      website.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      trackEvent('click', {
        click_element: 'product_filter',
        filter_value: btn.dataset.filter
      });
    });
  });
  
  // About CTA
  website.querySelectorAll('[data-action="about_cta"]').forEach(btn => {
    btn.addEventListener('click', () => {
      trackEvent('click', {
        click_element: 'about_cta',
        click_text: btn.textContent.trim()
      });
    });
  });
  
  // Video Play
  website.querySelectorAll('[data-action="video_play"]').forEach(el => {
    el.addEventListener('click', () => {
      trackEvent('video_start', {
        video_title: 'Video Aziendale',
        video_provider: 'demo',
        video_url: 'https://demo-ecommerce.shop/video'
      });
    });
  });
  
  // Contact Form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    // Track form start
    contactForm.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('focus', function onFocus() {
        trackEvent('form_start', {
          form_name: 'contact_form',
          form_destination: 'contact_page'
        });
        // Only track once
        field.removeEventListener('focus', onFocus);
      });
    });
    
    // Track form submit
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      trackEvent('form_submit', {
        form_name: 'contact_form',
        form_destination: 'contact_page',
        form_submit_text: 'Invia Messaggio'
      });
      
      // Visual feedback
      const btn = contactForm.querySelector('[data-action="form_submit"]');
      btn.textContent = '✓ Inviato!';
      btn.style.background = '#10b981';
    });
  }
  
  // Footer Links
  website.querySelectorAll('[data-action="footer_link"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      trackEvent('click', {
        click_element: 'footer_link',
        link_text: link.textContent,
        link_url: link.dataset.link
      });
    });
  });
  
  // Social Buttons
  website.querySelectorAll('[data-action="social_click"]').forEach(btn => {
    btn.addEventListener('click', () => {
      trackEvent('social_click', {
        social_network: btn.dataset.social,
        click_location: 'footer'
      });
    });
  });
}

function switchPage(pageName) {
  // Update nav
  elements.demoWebsite.querySelectorAll('.demo-nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === pageName);
  });
  
  // Switch page
  elements.demoWebsite.querySelectorAll('.demo-page').forEach(page => {
    page.classList.toggle('active', page.dataset.page === pageName);
  });
  
  debuggerState.currentPage = pageName;
  
  // Track page view
  const pageTitles = {
    home: 'Home - DemoShop',
    products: 'Prodotti - DemoShop',
    about: 'Chi Siamo - DemoShop',
    contact: 'Contatti - DemoShop'
  };
  
  trackEvent('page_view', {
    page_title: pageTitles[pageName],
    page_location: `https://demo-ecommerce.shop/${pageName === 'home' ? '' : pageName}`,
    page_path: `/${pageName === 'home' ? '' : pageName}`
  });
  
  // Track view_item_list on products page
  if (pageName === 'products') {
    setTimeout(() => {
      trackEvent('view_item_list', {
        item_list_id: 'all_products',
        item_list_name: 'Tutti i Prodotti',
        items: [
          { item_id: 'SKU001', item_name: 'Sneakers Pro', price: 129.99 },
          { item_id: 'SKU002', item_name: 'T-Shirt Basic', price: 29.99 },
          { item_id: 'SKU003', item_name: 'Zaino Urban', price: 79.99 },
          { item_id: 'SKU004', item_name: 'Running Shoes', price: 149.99 },
          { item_id: 'SKU005', item_name: 'Felpa Hoodie', price: 59.99 },
          { item_id: 'SKU006', item_name: 'Cappello Logo', price: 24.99 }
        ]
      });
    }, 300);
  }
}

function getProductData(card) {
  return {
    id: card.dataset.productId,
    name: card.dataset.productName,
    price: parseFloat(card.dataset.productPrice),
    category: card.dataset.productCategory
  };
}

// ==========================================
// SIDEBAR CONTROLS
// ==========================================
function initSidebarControls() {
  // Filter tabs
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      debuggerState.currentFilter = tab.dataset.filter;
      renderAllEvents();
    });
  });
  
  // Clear events
  elements.clearEvents.addEventListener('click', () => {
    debuggerState.events = [];
    debuggerState.stats = { total: 0, pageViews: 0, ecommerce: 0 };
    updateStats();
    elements.eventsList.innerHTML = `
      <div class="events-empty">
        <div class="empty-icon">📡</div>
        <p>In attesa di eventi...</p>
        <span>Interagisci con il sito demo</span>
      </div>
    `;
  });
  
  // Export events
  elements.exportEvents.addEventListener('click', () => {
    const data = JSON.stringify(debuggerState.events, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ga4-events-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
  
  // Close detail
  elements.closeDetail.addEventListener('click', () => {
    elements.eventDetail.classList.remove('open');
  });
  
  // Refresh demo
  elements.refreshDemo.addEventListener('click', () => {
    // Reset cart
    debuggerState.cartCount = 0;
    debuggerState.cartItems = [];
    elements.cartCount.textContent = '0';
    
    // Reset forms
    document.getElementById('newsletterEmail').value = '';
    document.getElementById('contactForm')?.reset();
    
    // Reset buttons
    elements.demoWebsite.querySelectorAll('.product-add-cart').forEach(btn => {
      btn.textContent = 'Aggiungi al Carrello';
      btn.style.background = '';
    });
    
    // Go to home
    switchPage('home');
    
    // Track refresh
    trackEvent('page_view', {
      page_title: 'Home - DemoShop (Refresh)',
      page_location: 'https://demo-ecommerce.shop/',
      page_path: '/',
      is_refresh: true
    });
  });
}

// ==========================================
// INITIALIZATION
// ==========================================
function init() {
  initDemoSite();
  initSidebarControls();
  
  // Initial dataLayer push
  dataLayer.push({
    event: 'debugger_loaded',
    timestamp: getTimestamp()
  });
  
  console.log('🔍 GA4 Event Debugger initialized');
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

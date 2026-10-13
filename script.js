/**
 * ANSHFINDS — Interactive E-Commerce & Dropshipping Engine
 * Features: Live search, instant category filtering, smart sorting,
 * quick view modal, copy link toast, and theme switching.
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initSearchAndFilter();
  initQuickViewModal();
  initShareButtons();
});

/* ========================================================
   1. Theme Toggle (Dark / Light Mode)
======================================================== */
function initThemeToggle() {
  const themeBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const themeText = document.getElementById('theme-text');
  
  const savedTheme = localStorage.getItem('anshfinds_theme') || 'dark';
  setTheme(savedTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      setTheme(nextTheme);
      localStorage.setItem('anshfinds_theme', nextTheme);
    });
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeIcon && themeText) {
      if (theme === 'light') {
        themeIcon.textContent = '🌙';
        themeText.textContent = 'Dark';
      } else {
        themeIcon.textContent = '☀️';
        themeText.textContent = 'Light';
      }
    }
  }
}

/* ========================================================
   2. Search, Filter, & Sort Logic
======================================================== */
function initSearchAndFilter() {
  const searchInput = document.getElementById('product-search');
  const clearBtn = document.getElementById('search-clear');
  const pills = document.querySelectorAll('.pill-btn');
  const sortSelect = document.getElementById('product-sort');
  const grid = document.getElementById('product-grid');
  const cards = Array.from(document.querySelectorAll('.product-card'));
  const countDisplay = document.getElementById('showing-count');
  const noResults = document.getElementById('no-results');
  const resetBtn = document.getElementById('reset-filters');

  let activeCategory = 'all';
  let searchQuery = '';

  // Calculate & set category counts in pills
  pills.forEach(pill => {
    const cat = pill.getAttribute('data-category');
    const countSpan = pill.querySelector('.pill-count');
    if (countSpan) {
      if (cat === 'all') {
        countSpan.textContent = cards.length;
      } else {
        const count = cards.filter(c => c.getAttribute('data-category') === cat).length;
        countSpan.textContent = count;
      }
    }

    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = cat;
      applyFilters();
    });
  });

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      if (clearBtn) {
        clearBtn.style.display = searchQuery.length > 0 ? 'block' : 'none';
      }
      applyFilters();
    });
  }

  // Clear search
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchQuery = '';
        clearBtn.style.display = 'none';
        applyFilters();
        searchInput.focus();
      }
    });
  }

  // Sort dropdown
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      sortCards();
    });
  }

  // Reset button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchQuery = '';
        if (clearBtn) clearBtn.style.display = 'none';
      }
      activeCategory = 'all';
      pills.forEach(p => {
        if (p.getAttribute('data-category') === 'all') p.classList.add('active');
        else p.classList.remove('active');
      });
      if (sortSelect) sortSelect.value = 'featured';
      applyFilters();
    });
  }

  function applyFilters() {
    let visibleCount = 0;

    cards.forEach(card => {
      const cardCat = card.getAttribute('data-category') || '';
      const cardTitle = (card.querySelector('.card-title')?.textContent || '').toLowerCase();
      const cardDesc = (card.querySelector('.card-desc')?.textContent || '').toLowerCase();
      const cardTags = (card.getAttribute('data-keywords') || '').toLowerCase();

      const matchesCat = activeCategory === 'all' || cardCat === activeCategory;
      const matchesSearch = !searchQuery || 
        cardTitle.includes(searchQuery) || 
        cardDesc.includes(searchQuery) || 
        cardTags.includes(searchQuery);

      if (matchesCat && matchesSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (countDisplay) {
      countDisplay.textContent = visibleCount;
    }

    if (noResults) {
      noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    sortCards();
  }

  function sortCards() {
    if (!grid) return;
    const sortVal = sortSelect ? sortSelect.value : 'featured';

    const visibleCards = cards.filter(c => c.style.display !== 'none');

    visibleCards.sort((a, b) => {
      if (sortVal === 'rating') {
        const rA = parseFloat(a.getAttribute('data-rating') || '0');
        const rB = parseFloat(b.getAttribute('data-rating') || '0');
        return rB - rA;
      } else if (sortVal === 'reviews') {
        const revA = parseInt(a.getAttribute('data-reviews') || '0', 10);
        const revB = parseInt(b.getAttribute('data-reviews') || '0', 10);
        return revB - revA;
      } else if (sortVal === 'alpha') {
        const tA = (a.querySelector('.card-title')?.textContent || '').trim();
        const tB = (b.querySelector('.card-title')?.textContent || '').trim();
        return tA.localeCompare(tB);
      } else {
        // default: original DOM order
        const iA = parseInt(a.getAttribute('data-index') || '0', 10);
        const iB = parseInt(b.getAttribute('data-index') || '0', 10);
        return iA - iB;
      }
    });

    visibleCards.forEach(card => grid.appendChild(card));
  }

  // Initial apply
  applyFilters();
}

/* ========================================================
   3. Quick View Modal
======================================================== */
function initQuickViewModal() {
  const backdrop = document.getElementById('quick-modal');
  const closeBtn = document.getElementById('modal-close');
  if (!backdrop) return;

  const modalImg = document.getElementById('modal-img');
  const modalCat = document.getElementById('modal-cat');
  const modalTitle = document.getElementById('modal-title');
  const modalRating = document.getElementById('modal-rating');
  const modalReviews = document.getElementById('modal-reviews');
  const modalDesc = document.getElementById('modal-desc');
  const modalBuyBtn = document.getElementById('modal-buy-btn');
  const modalShareBtn = document.getElementById('modal-share-btn');

  let currentLink = '';

  document.querySelectorAll('.quick-view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.product-card');
      if (!card) return;

      const img = card.querySelector('.card-media img')?.src || '';
      const title = card.querySelector('.card-title')?.textContent || '';
      const desc = card.querySelector('.card-desc')?.textContent || '';
      const cat = card.querySelector('.card-category')?.textContent || '';
      const rating = card.getAttribute('data-rating') || '4.8';
      const reviews = card.getAttribute('data-reviews') || '150';
      const buyLink = card.querySelector('.btn-buy')?.href || '#';

      currentLink = buyLink;

      if (modalImg) modalImg.src = img;
      if (modalCat) modalCat.textContent = cat;
      if (modalTitle) modalTitle.textContent = title;
      if (modalRating) modalRating.textContent = `★ ${rating}`;
      if (modalReviews) modalReviews.textContent = `(${reviews}+ reviews on Daraz)`;
      if (modalDesc) modalDesc.textContent = desc;
      if (modalBuyBtn) modalBuyBtn.href = buyLink;

      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('active')) {
      closeModal();
    }
  });

  if (modalShareBtn) {
    modalShareBtn.addEventListener('click', () => {
      if (currentLink) copyToClipboard(currentLink);
    });
  }
}

/* ========================================================
   4. Copy Link / Share Toast Notification
======================================================== */
function initShareButtons() {
  document.querySelectorAll('.btn-share').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.product-card');
      const link = card?.querySelector('.btn-buy')?.href;
      if (link) {
        copyToClipboard(link);
      }
    });
  });
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('⚡ Deal link copied to clipboard!');
  }).catch(() => {
    // Fallback
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    showToast('⚡ Deal link copied to clipboard!');
  });
}

function showToast(message) {
  let toast = document.getElementById('toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notice';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

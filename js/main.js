document.addEventListener('DOMContentLoaded', () => {

  // ── HERO SLIDER ──────────────────────────────────────
  const track      = document.getElementById('sliderTrack');
  const slides     = track ? track.querySelectorAll('.slide') : [];
  const dots       = document.querySelectorAll('.dot');
  const prevBtn    = document.getElementById('sliderPrev');
  const nextBtn    = document.getElementById('sliderNext');
  const TOTAL      = slides.length;
  const INTERVAL   = 4500;
  let   current    = 0;
  let   timer      = null;

  // Add progress bar
  let progressBar = null;
  if (track) {
    progressBar = document.createElement('div');
    progressBar.className = 'slider-progress';
    track.closest('.hero-slider').appendChild(progressBar);
  }

  function goTo(index) {
    if (!track || TOTAL === 0) return;
    slides[current].classList.remove('is-active');
    dots[current]?.classList.remove('active');
    current = (index + TOTAL) % TOTAL;
    track.style.transform = `translateX(-${current * 100}%)`;
    slides[current].classList.add('is-active');
    dots[current]?.classList.add('active');
    // Reset & restart progress bar
    if (progressBar) {
      progressBar.style.transition = 'none';
      progressBar.style.width = '0%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          progressBar.style.transition = `width ${INTERVAL}ms linear`;
          progressBar.style.width = '100%';
        });
      });
    }
  }

  function startAuto() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), INTERVAL);
  }

  if (track && TOTAL > 0) {
    // Init first slide
    slides[0].classList.add('is-active');
    if (progressBar) {
      requestAnimationFrame(() => {
        progressBar.style.transition = `width ${INTERVAL}ms linear`;
        progressBar.style.width = '100%';
      });
    }
    startAuto();

    prevBtn?.addEventListener('click', () => { goTo(current - 1); startAuto(); });
    nextBtn?.addEventListener('click', () => { goTo(current + 1); startAuto(); });

    dots.forEach(dot => {
      dot.addEventListener('click', () => { goTo(+dot.dataset.index); startAuto(); });
    });

    // Touch / swipe
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) { goTo(diff > 0 ? current + 1 : current - 1); startAuto(); }
    });
  }


  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mainNav = document.getElementById('main-nav');
  if (mobileBtn && mainNav) {
    mobileBtn.addEventListener('click', () => mainNav.classList.toggle('active'));
  }

  // ── Cart Elements ─────────────────────────────────────
  const globalItemCountEl   = document.getElementById('global-item-count');
  const globalTotalEl       = document.getElementById('global-total-amount');
  const topItemCountEl      = document.getElementById('top-item-count');
  const topActualPriceEl    = document.getElementById('top-actual-price');
  const topDiscountPriceEl  = document.getElementById('top-discount-price');
  const navCartCountEl      = document.getElementById('nav-cart-count');

  // ── Calculate Cart ────────────────────────────────────
  function calculateCart() {
    let totalItems    = 0;
    let totalDiscount = 0;
    let totalActual   = 0;

    document.querySelectorAll('.product-row').forEach(row => {
      const discountPrice = parseFloat(row.getAttribute('data-price'))  || 0;
      const actualPrice   = parseFloat(row.getAttribute('data-actual')) || discountPrice;
      const qtyInput      = row.querySelector('.qty-input');
      const rowTotalEl    = row.querySelector('.row-total');

      if (!qtyInput || !rowTotalEl) return;

      const qty        = Math.max(0, parseInt(qtyInput.value) || 0);
      const rowTotal   = discountPrice * qty;

      rowTotalEl.textContent = '₹' + rowTotal.toLocaleString('en-IN');

      totalItems    += qty;
      totalDiscount += rowTotal;
      totalActual   += actualPrice * qty;
    });

    // Bottom bar
    if (globalItemCountEl) globalItemCountEl.textContent = totalItems;
    if (globalTotalEl)     globalTotalEl.textContent     = '₹' + totalDiscount.toLocaleString('en-IN');

    // Top sticky bar
    if (topItemCountEl)     topItemCountEl.textContent     = totalItems;
    if (topActualPriceEl)   topActualPriceEl.textContent   = '₹' + totalActual.toFixed(2);
    if (topDiscountPriceEl) topDiscountPriceEl.textContent = '₹' + totalDiscount.toFixed(2);

    // Nav cart badge
    if (navCartCountEl) navCartCountEl.textContent = totalItems;
  }

  // ── Attach Qty Button Events ──────────────────────────
  function attachQtyEvents() {
    document.querySelectorAll('.qty-selector').forEach(selector => {
      const minus = selector.querySelector('.minus');
      const plus  = selector.querySelector('.plus');
      const input = selector.querySelector('.qty-input');

      if (!minus || !plus || !input) return;

      minus.addEventListener('click', () => {
        const val = parseInt(input.value) || 0;
        if (val > 0) { input.value = val - 1; calculateCart(); }
      });

      plus.addEventListener('click', () => {
        input.value = (parseInt(input.value) || 0) + 1;
        calculateCart();
      });

      input.addEventListener('input', () => {
        if (parseInt(input.value) < 0) input.value = 0;
        calculateCart();
      });
    });
  }

  attachQtyEvents();
  calculateCart();

  // ── Product Search ────────────────────────────────────
  const searchInput = document.getElementById('product-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().trim();
      document.querySelectorAll('.product-row').forEach(row => {
        const nameEl = row.querySelector('.name-cell');
        if (!nameEl) return;
        const name = nameEl.textContent.toLowerCase();
        row.style.display = (query === '' || name.includes(query)) ? '' : 'none';
      });
    });
  }

  // ── Smooth Scroll ─────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      e.preventDefault();
      const target = document.querySelector(targetId);
      if (target) {
        window.scrollTo({ top: target.offsetTop - 120, behavior: 'smooth' });
        if (mainNav.classList.contains('active')) mainNav.classList.remove('active');
      }
    });
  });

  // ── WhatsApp Checkout ─────────────────────────────────
  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      let items = [];
      document.querySelectorAll('.product-row').forEach(row => {
        const qty = parseInt(row.querySelector('.qty-input')?.value) || 0;
        if (qty > 0) {
          const name  = row.querySelector('.name-cell')?.textContent.trim();
          const price = row.querySelector('.price-new')?.textContent.trim();
          items.push(`• ${name} x${qty} @ ${price}`);
        }
      });

      if (items.length === 0) {
        alert('Please add at least one product before submitting your order!');
        return;
      }

      const total   = document.getElementById('global-total-amount')?.textContent || '₹0';
      const message = `Hello! I'd like to place an order from Orca's Crackers:\n\n${items.join('\n')}\n\n*Total: ${total}*\n\nPlease confirm availability. Thank you!`;
      const url     = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    });
  }

});

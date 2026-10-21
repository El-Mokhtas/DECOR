/* Home Center Green — header interactions */
(() => {
  const body = document.body;
  const header = document.getElementById('header');

  // ---- Announcement ticker ----
  const msgs = document.querySelectorAll('.announce__msg');
  let current = 0;
  if (msgs.length > 1) {
    setInterval(() => {
      const prev = msgs[current];
      prev.classList.remove('is-active');
      prev.classList.add('is-leaving');
      setTimeout(() => prev.classList.remove('is-leaving'), 600);
      current = (current + 1) % msgs.length;
      msgs[current].classList.add('is-active');
    }, 4500);
  }

  // ---- Sticky header: shrink on scroll, hide when scrolling down ----
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    const megaOpen = header.querySelector('.has-mega:hover');
    header.classList.toggle('is-hidden', y > 400 && y > lastY && !megaOpen && !body.classList.contains('drawer-open'));
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Search overlay ----
  const search = document.getElementById('search');
  const searchInput = document.getElementById('searchInput');
  const openSearch = () => {
    search.classList.add('is-open');
    search.setAttribute('aria-hidden', 'false');
    body.classList.add('no-scroll');
    setTimeout(() => searchInput.focus(), 200);
  };
  const closeSearch = () => {
    search.classList.remove('is-open');
    search.setAttribute('aria-hidden', 'true');
    body.classList.remove('no-scroll');
  };
  document.getElementById('searchOpen').addEventListener('click', openSearch);
  document.getElementById('searchClose').addEventListener('click', closeSearch);

  // ---- Mobile drawer ----
  const drawer = document.getElementById('drawer');
  const menuOpen = document.getElementById('menuOpen');
  const openDrawer = () => {
    body.classList.add('drawer-open', 'no-scroll');
    drawer.setAttribute('aria-hidden', 'false');
    menuOpen.setAttribute('aria-expanded', 'true');
  };
  const closeDrawer = () => {
    body.classList.remove('drawer-open', 'no-scroll');
    drawer.setAttribute('aria-hidden', 'true');
    menuOpen.setAttribute('aria-expanded', 'false');
  };
  menuOpen.addEventListener('click', openDrawer);
  document.getElementById('menuClose').addEventListener('click', closeDrawer);
  document.getElementById('drawerBackdrop').addEventListener('click', closeDrawer);

  // ---- Toast ----
  const toast = document.getElementById('toast');
  let toastTimer;
  const showToast = (text) => {
    toast.textContent = text;
    toast.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-show'), 2600);
  };

  // ---- Products ----
  const grid = document.getElementById('productGrid');
  const products = window.HCG_PRODUCTS || [];
  const cad = (n) => '$' + n.toLocaleString('en-CA') + ' CAD';
  const heart = '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-9.2-8.6C1.3 8.4 3 5 6.3 5c2 0 3.2 1.1 3.9 2.2h3.6C14.5 6.1 15.7 5 17.7 5 21 5 22.7 8.4 21.2 11.4 19 15.6 12 20 12 20z"/></svg>';

  const renderProducts = (filter) => {
    grid.innerHTML = products
      .filter((p) => p.tags.includes(filter))
      .slice(0, 8)
      .map((p, i) => `
        <article class="product" style="animation-delay:${i * 60}ms">
          <div class="product__media ph ph--${p.tone}"${p.img ? ` style="--img:url('${p.img}')"` : ''}>
            ${p.label ? `<span class="product__label${p.label === 'Sale' ? ' product__label--sale' : ''}">${p.label}</span>` : ''}
            <button class="product__wish" data-id="${p.id}" aria-label="Add ${p.name} to wishlist" aria-pressed="false">${heart}</button>
            <svg class="ph__icon"><use href="#i-${p.icon}" /></svg>
            <button class="product__add" data-name="${p.name}">Add to cart</button>
          </div>
          <p class="product__cat">${p.cat}</p>
          <h3 class="product__name"><a href="#">${p.name}</a></h3>
          <div class="product__row">
            <span class="product__price">${cad(p.price)}${p.was ? `<s>${cad(p.was)}</s>` : ''}</span>
            <span class="swatches">${p.swatches.map((c) => `<i style="background:${c}"></i>`).join('')}</span>
          </div>
        </article>`)
      .join('');
  };

  if (grid) {
    renderProducts('new');

    document.querySelectorAll('.tabs__btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tabs__btn').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        renderProducts(btn.dataset.filter);
      });
    });

    const cart = document.querySelector('.cart');
    const cartCount = document.querySelector('.cart__count');
    grid.addEventListener('click', (e) => {
      const add = e.target.closest('.product__add');
      const wish = e.target.closest('.product__wish');
      if (add) {
        const n = Number(cartCount.textContent) + 1;
        cartCount.textContent = n;
        cart.setAttribute('aria-label', `Cart, ${n} items`);
        cart.classList.remove('is-bump');
        void cart.offsetWidth; // restart animation
        cart.classList.add('is-bump');
        showToast(`${add.dataset.name} added to your cart`);
      }
      if (wish) {
        const on = wish.classList.toggle('is-active');
        wish.setAttribute('aria-pressed', on);
        showToast(on ? 'Saved to your wishlist' : 'Removed from your wishlist');
      }
    });
  }

  // ---- Reveal on scroll ----
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // ---- Newsletter ----
  const nlForm = document.getElementById('newsletterForm');
  if (nlForm) {
    const nlMsg = document.getElementById('newsletterMsg');
    nlForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = nlForm.querySelector('input');
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      nlMsg.classList.toggle('is-error', !ok);
      nlMsg.textContent = ok ? 'Welcome to the Green circle — check your inbox soon.' : 'Please enter a valid email address.';
      if (ok) email.value = '';
    });
  }

  // ---- Footer year ----
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeSearch();
    closeDrawer();
  });
})();

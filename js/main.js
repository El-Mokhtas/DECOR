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

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeSearch();
    closeDrawer();
  });
})();

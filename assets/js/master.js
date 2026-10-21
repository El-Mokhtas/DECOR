(function () {
    /* ---------- header: transparent → solid, hides on scroll down ---------- */
    const header = document.getElementById("siteHeader");
    let lastY = scrollY;
    function onScroll() {
        const y = scrollY;
        header.classList.toggle("scrolled", y > 40);
        header.classList.toggle(
            "hide",
            y > 500 &&
                y > lastY &&
                !document.body.classList.contains("menu-open"),
        );
        lastY = y;
    }
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* cart count from the shared demo cart */
    try {
        const c = JSON.parse(localStorage.getItem("ssdesign_cart"));
        const n = (c || [{ qty: 1 }, { qty: 1 }]).reduce(
            (s, it) => s + (it.qty || 1),
            0,
        );
        document.getElementById("cartCount").textContent = n || "";
    } catch (e) {
        document.getElementById("cartCount").textContent = "2";
    }

    /* ---------- mobile menu: circle reveal from the menu button ---------- */
    const body = document.body,
        menu = document.getElementById("mmenu"),
        toggle = document.getElementById("menuToggle"),
        closeBtn = document.getElementById("menuClose");
    function openMenu() {
        const r = toggle.getBoundingClientRect(),
            m =
                menu.getBoundingClientRect(); /* circle starts at the menu button, relative to the panel */
        menu.style.setProperty("--mx", r.left + r.width / 2 - m.left + "px");
        menu.style.setProperty("--my", r.top + r.height / 2 - m.top + "px");
        body.classList.add("menu-open");
        menu.setAttribute("aria-hidden", "false");
        toggle.setAttribute("aria-expanded", "true");
        setTimeout(() => closeBtn.focus(), 400);
    }
    function closeMenu() {
        body.classList.remove("menu-open");
        menu.setAttribute("aria-hidden", "true");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus({ preventScroll: true });
    }
    toggle.addEventListener("click", openMenu);
    closeBtn.addEventListener("click", closeMenu);
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && body.classList.contains("menu-open"))
            closeMenu();
    });
    menu.querySelectorAll("a").forEach((a) =>
        a.addEventListener("click", () => {
            if (a.getAttribute("href").startsWith("#")) closeMenu();
        }),
    );
    document.getElementById("menuBackdrop").addEventListener("click", closeMenu);
    /* mark the current page in the menu */
    const page = location.pathname.split("/").pop() || "index.html";
    menu.querySelectorAll(".mm-link").forEach((a) => {
        if (a.getAttribute("href") === page) a.setAttribute("aria-current", "page");
    });
    matchMedia("(min-width:1025px)").addEventListener("change", (e) => {
        if (e.matches) closeMenu();
    });

    /* ---------- scroll reveal ---------- */
    const io = new IntersectionObserver(
        (es) =>
            es.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add("in");
                    io.unobserve(e.target);
                }
            }),
        { threshold: 0.15 },
    );
    document
        .querySelectorAll(".reveal,.reveal-right")
        .forEach((el) => io.observe(el));

    /* ---------- HERO v3 slider: crossfade + Ken Burns, autoplay, swipe ---------- */
    const hv = document.getElementById("hvHero");
    if (hv) {
        const hvSlides = [...hv.querySelectorAll(".hv-slide")];
        let hi = 0,
            htimer = null;
        const hgo = (n) => {
            hi = (n + hvSlides.length) % hvSlides.length;
            hvSlides.forEach((s, k) => s.classList.toggle("is-active", k === hi));
            hplay();
        };
        const hplay = () => {
            clearTimeout(htimer);
            if (hvSlides.length > 1) htimer = setTimeout(() => hgo(hi + 1), 7000);
        };
        document.addEventListener("visibilitychange", () =>
            document.hidden ? clearTimeout(htimer) : hplay(),
        );
        let hx = null;
        hv.addEventListener("touchstart", (e) => (hx = e.touches[0].clientX), {
            passive: true,
        });
        hv.addEventListener("touchend", (e) => {
            if (hx === null) return;
            const dx = e.changedTouches[0].clientX - hx;
            if (Math.abs(dx) > 50) hgo(hi + (dx < 0 ? 1 : -1));
            hx = null;
        });
        hgo(0);
    }
})();

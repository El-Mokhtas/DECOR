/* ---------- About page ----------
   Scroll reveals, counting facts, the journey line that fills as you
   scroll, and the quality hotspots on the sofa photo. */
(function () {
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* count a number up from 0 */
    function count(el) {
        const end = Number(el.dataset.count);
        if (still) { el.textContent = end.toLocaleString("en-CA"); return; }
        const t0 = performance.now(), dur = 1400;
        const tick = (t) => {
            const k = Math.min(1, (t - t0) / dur);
            el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))).toLocaleString("en-CA");
            if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }
    document.querySelectorAll("[data-count]").forEach((el) => { if (!still) el.textContent = "0"; });

    /* reveal on scroll */
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-in");
        e.target.querySelectorAll("[data-count]").forEach(count);
        io.unobserve(e.target);
    }), { rootMargin: "0px 0px -12% 0px" });
    document.querySelectorAll(".ab-rv").forEach((el) => io.observe(el));

    /* journey: the gold line follows the scroll and lights each step it passes */
    const journey = document.getElementById("abJourney");
    const steps = journey.querySelector(".ab-steps");
    const items = [...steps.children];
    let ticking = false;
    function fill() {
        ticking = false;
        const r = steps.getBoundingClientRect();
        const vh = innerHeight;
        const p = still ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / (r.height + vh * 0.25)));
        steps.style.setProperty("--fill", p.toFixed(3));
        items.forEach((li, i) => li.classList.toggle("is-on", p >= i / (items.length - 1) - 0.001));
    }
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(fill); } }, { passive: true });
    addEventListener("resize", fill);
    fill();

    /* hotspots: a dot and its list item open together */
    const dots = [...document.querySelectorAll(".ab-dot")];
    const checks = [...document.querySelectorAll(".ab-checks button")];
    function pick(i) {
        dots.forEach((d) => d.classList.toggle("is-on", Number(d.dataset.i) === i));
        checks.forEach((b) => {
            const on = Number(b.dataset.i) === i;
            b.setAttribute("aria-expanded", on);
            b.parentElement.classList.toggle("is-on", on);
        });
    }
    dots.forEach((d) => d.addEventListener("click", () => {
        pick(Number(d.dataset.i));
        /* on small screens the list sits under the photo: bring it into view */
        if (innerWidth <= 1100) checks[Number(d.dataset.i)].scrollIntoView({ behavior: still ? "auto" : "smooth", block: "nearest" });
    }));
    checks.forEach((b) => b.addEventListener("click", () => pick(Number(b.dataset.i))));
    pick(0);
})();

/* ---------- Contact page (demo) ----------
   Live open / closed status, a form whose extra field follows the topic,
   and a thank-you screen. Nothing typed here is sent or stored: the real
   form needs a backend or a form service before launch. */
(function () {
    const $ = (id) => document.getElementById(id);
    const PRODUCTS = window.HCG_PRODUCTS || [];
    const params = new URLSearchParams(location.search);

    /* ---------- today's hours, in Hamilton time ---------- */
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Toronto", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t)?.value;
    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    const now = Number(get("hour")) * 60 + Number(get("minute"));
    const mins = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
    const clock = (t) => { const [h, m] = t.split(":").map(Number); return `${h % 12 || 12}${m ? ":" + String(m).padStart(2, "0") : ""} ${h < 12 ? "am" : "pm"}`; };

    $("cuHours").querySelectorAll("li").forEach((li) => {
        if (!li.dataset.days.split(",").map(Number).includes(day)) return;
        li.classList.add("is-today");
        const open = now >= mins(li.dataset.open) && now < mins(li.dataset.close);
        const st = $("cuStatus");
        st.classList.toggle("is-open", open);
        st.querySelector("span").textContent = open
            ? `Showroom open now · until ${clock(li.dataset.close)}`
            : now < mins(li.dataset.open) ? `Showroom opens today at ${clock(li.dataset.open)}` : "Showroom closed now · we'll reply to messages tomorrow";
        st.hidden = false;
    });

    /* ---------- form setup ---------- */
    const form = $("cuSend");
    $("cuProduct").insertAdjacentHTML("beforeend", PRODUCTS.map((p) => `<option value="${p.code}">${p.name}</option>`).join(""));

    const days = [];
    for (let n = 1; days.length < 10 && n < 14; n++) {
        const d = new Date(Date.now() + n * 864e5);
        days.push(d);
    }
    $("cuDay").innerHTML = '<option value="">Any day</option>' + days.map((d) =>
        `<option>${d.toLocaleDateString("en-CA", { weekday: "long", month: "long", day: "numeric" })}</option>`).join("");

    const topic = () => form.querySelector('input[name="topic"]:checked').value;
    function showTopic() {
        form.querySelectorAll("[data-for]").forEach((f) => { f.hidden = f.dataset.for !== topic(); });
    }
    form.querySelectorAll('input[name="topic"]').forEach((r) => r.addEventListener("change", showTopic));

    /* links can preselect a topic or a product: contact.html?topic=order or ?p=D0-0002 */
    const pre = params.get("topic");
    const preInput = pre && form.querySelector(`input[name="topic"][value="${CSS.escape(pre)}"]`);
    if (preInput) preInput.checked = true;
    if (params.get("p") && PRODUCTS.some((p) => p.code === params.get("p"))) {
        form.querySelector('input[name="topic"][value="product"]').checked = true;
        $("cuProduct").value = params.get("p");
    }
    showTopic();

    /* message counter */
    $("cuMsg").addEventListener("input", () => {
        const n = $("cuMsg").value.length;
        $("cuCount").textContent = `${n} / 1000`;
        $("cuCount").classList.toggle("is-near", n > 900);
    });

    /* postal code: A1A 1A1 */
    $("cuPostal").addEventListener("input", () => {
        const v = $("cuPostal").value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
        $("cuPostal").value = v.length > 3 ? v.slice(0, 3) + " " + v.slice(3) : v;
    });

    /* ---------- validation ---------- */
    const rules = {
        cuName: (v) => v.length > 1 || "Enter your name.",
        cuEmail: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Enter a valid email address.",
        cuPhone: (v) => !v || v.replace(/\D/g, "").length >= 10 || "Enter a 10-digit phone number, or leave it empty.",
        cuOrder: (v) => topic() !== "order" || /\d{4,}/.test(v) || "Enter your order number, e.g. #HCG-123456.",
        cuPostal: (v) => !v || topic() !== "delivery" || /^[ABCEGHJ-NPRSTVXY]\d[A-Z] ?\d[A-Z]\d$/.test(v) || "Enter a valid postal code, e.g. L8P 1A1.",
        cuMsg: (v) => v.length >= 10 || "Tell us a little more (at least 10 characters).",
    };
    function check(id) {
        const el = $(id);
        const res = rules[id](el.value.trim());
        const field = el.closest(".cu-field");
        field.classList.toggle("is-bad", res !== true);
        el.setAttribute("aria-invalid", res !== true);
        field.querySelector(".cu-err").textContent = res === true ? "" : res;
        return res === true;
    }
    Object.keys(rules).forEach((id) => {
        $(id).addEventListener("blur", () => { if ($(id).value) check(id); });
        $(id).addEventListener("input", () => { if ($(id).closest(".cu-field").classList.contains("is-bad")) check(id); });
    });

    /* the phone is needed when the reply should come by phone or WhatsApp */
    const replyBy = () => form.querySelector('input[name="reply"]:checked').value;
    const phoneRule = rules.cuPhone;
    rules.cuPhone = (v) => (replyBy() !== "email" && !v ? "Add a phone number so we can reach you." : phoneRule(v));

    /* ---------- send (demo) ---------- */
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const bad = Object.keys(rules).filter((id) => !check(id));
        if (bad.length) {
            $(bad[0]).scrollIntoView({ behavior: "smooth", block: "center" });
            $(bad[0]).focus({ preventScroll: true });
            return;
        }
        const btn = $("cuSubmit");
        btn.classList.add("is-loading");
        btn.querySelector("span").textContent = "Sending…";
        setTimeout(() => {
            $("cuDoneName").textContent = $("cuName").value.trim().split(/\s+/)[0];
            $("cuDoneRef").textContent = "#MSG-" + String(Date.now()).slice(-6);
            $("cuDoneBy").textContent = { email: "email", phone: "phone", whatsapp: "WhatsApp" }[replyBy()];
            form.hidden = true;
            $("cuDone").hidden = false;
            $("cuForm").scrollIntoView({ behavior: "smooth", block: "start" });
            $("cuDone").focus({ preventScroll: true });
            btn.classList.remove("is-loading");
            btn.querySelector("span").textContent = "Send message";
        }, 900);
    });

    $("cuAgain").addEventListener("click", () => {
        form.reset();
        form.querySelectorAll(".is-bad").forEach((f) => f.classList.remove("is-bad"));
        $("cuCount").textContent = "0 / 1000";
        showTopic();
        $("cuDone").hidden = true;
        form.hidden = false;
        $("cuName").focus();
    });
})();

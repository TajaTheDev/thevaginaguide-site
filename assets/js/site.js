/* ============================================================
   THE VAGINA GUIDE: SITE SETTINGS
   This is the only part you need to edit when links change.
   ============================================================ */
const CONFIG = {
  // Kit form IDs (the number in your Kit embed code)
  forms: {
    decoder: "10163456",   // Discharge Decoder (live)
    waitlist: ""           // App waitlist: make a 2nd Kit form, paste its number here
  },
  // Kit Commerce product links. Leave "" to show "Coming soon"
  checkout: {
    bv: "https://the-vagina-guide.kit.com/products/bv-break-the-cycle",
    yeast: "https://the-vagina-guide.kit.com/products/yeast-infection-survival-guide",
    period: "https://the-vagina-guide.kit.com/products/the-period-prep-blueprint",
    pelvic: "https://the-vagina-guide.kit.com/products/the-pelvic-floor-strength-guide",
    bundle: "https://the-vagina-guide.kit.com/products/the-complete-v-guide-bundle"
  }
};

/* ---------- mobile menu ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".menu-btn");
  const links = document.querySelector(".nav-links");
  if (btn && links) {
    btn.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
      btn.textContent = open ? "Close" : "Menu";
    });
  }

  /* ---------- checkout buttons ---------- */
  document.querySelectorAll("[data-checkout]").forEach(a => {
    const url = CONFIG.checkout[a.dataset.checkout];
    if (url) { a.href = url; }
    else {
      a.textContent = "Coming soon";
      a.setAttribute("aria-disabled", "true");
      a.removeAttribute("href");
    }
  });

  /* ---------- Kit signup forms ---------- */
  document.querySelectorAll("form[data-kit]").forEach(form => {
    const id = CONFIG.forms[form.dataset.kit];
    const msg = form.querySelector(".msg");
    if (!id) {
      // No Kit form yet: send the visitor's interest by email instead
      form.addEventListener("submit", e => {
        e.preventDefault();
        msg.textContent = "The waitlist opens very soon. Follow @thevaginaguide on TikTok so you don't miss it!";
      });
      return;
    }
    form.action = `https://app.kit.com/forms/${id}/subscriptions`;
    form.method = "post";
    form.addEventListener("submit", async e => {
      e.preventDefault();
      if (form.querySelector(".hp input")?.value) return; // bot trap
      const btn = form.querySelector("button");
      const data = new FormData(form);
      // waitlist: turn checkboxes into a Kit custom field
      const picks = [...form.querySelectorAll("input[name=app]:checked")].map(i => i.value);
      if (picks.length) data.set("fields[apps]", picks.join(", "));
      data.delete("app");
      btn.disabled = true; msg.className = "msg"; msg.textContent = "Sending…";
      try {
        const res = await fetch(form.action, { method: "POST", body: data, headers: { Accept: "application/json" } });
        const json = await res.json().catch(() => ({}));
        if (res.ok && json.status !== "failed") {
          if (form.dataset.redirect) { location.href = form.dataset.redirect; return; }
          form.classList.add("done");
          msg.textContent = "You're in! Check your email and tap the confirm button. 💌";
        } else { throw new Error("rejected"); }
      } catch (err) {
        // Network/CORS problem: fall back to a normal form post to Kit
        if (err instanceof TypeError) { HTMLFormElement.prototype.submit.call(form); return; }
        msg.className = "msg err";
        msg.textContent = "Hmm, that didn't go through. Check your email address and try again.";
        btn.disabled = false;
      }
    });
  });

  /* ---------- peek inside previews ---------- */
  document.querySelectorAll("[data-peek]").forEach(b => b.addEventListener("click", () => {
    const d = document.getElementById(b.dataset.peek); if (d && d.showModal) d.showModal();
  }));
  document.querySelectorAll("dialog.peek").forEach(d => {
    d.querySelector("[data-close]").addEventListener("click", () => d.close());
    d.addEventListener("click", e => { if (e.target === d) d.close(); });
  });

  /* ---------- footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());
});

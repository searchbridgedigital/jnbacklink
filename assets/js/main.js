/* JN Backlink — shared site JS: mobile menu, FAQ accordion, active nav, contact form (front-end only) */
(function () {
  "use strict";

  /* Mobile menu */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("mainNav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "\u2715" : "\u2630";
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        toggle.textContent = "\u2630";
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* Active nav link (matches current page).
     Resolves each relative href against the current URL, then compares
     section paths — "index.html" and trailing slashes are ignored, so
     /services/seo/ highlights the Services link and / highlights Home. */
  var path = window.location.pathname.replace(/\/+$/, "").replace(/\/index\.html$/, "") || "/";
  document.querySelectorAll(".main-nav a").forEach(function (a) {
    var href = a.getAttribute("href") || "";
    var resolved;
    try { resolved = new URL(href, window.location.href).pathname; }
    catch (e) { resolved = href; }
    resolved = resolved.replace(/\/+$/, "").replace(/\/index\.html$/, "") || "/";
    var active = resolved === "/"
      ? path === "/"
      : (path === resolved || path.indexOf(resolved + "/") === 0);
    if (active) a.classList.add("active");
  });

  /* FAQ accordion */
  document.querySelectorAll(".faq-q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".faq-item");
      var wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function (i) { i.classList.remove("open"); });
      if (!wasOpen) item.classList.add("open");
    });
  });

  /* Contact form — front-end only, no backend yet */
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var msg = document.getElementById("formMsg");
      if (msg) {
        msg.textContent = "Thank you! Your message has been noted in your browser only — the form is not connected to a backend yet. For the fastest reply, please email us directly at jnbacklink@gmail.com.";
        msg.classList.add("show");
      }
      form.reset();
    });
  }

  /* Generic copy-to-clipboard helper used by tools */
  window.jnCopy = function (text, btn) {
    function done() {
      if (!btn) return;
      var original = btn.textContent;
      btn.textContent = "Copied!";
      setTimeout(function () { btn.textContent = original; }, 1600);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { jnFallbackCopy(text); done(); });
    } else {
      jnFallbackCopy(text); done();
    }
  };
  function jnFallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }
})();

/* Theme toggle — dark is the default, light via data-theme="light".
   The saved choice lives in localStorage ("jn-theme"); a tiny inline
   script in <head> applies it before CSS loads to avoid a flash. */
(function () {
  "use strict";
  var btn = document.getElementById("themeToggle");
  if (!btn) return;
  function apply(theme) {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
      btn.setAttribute("aria-label", "Switch to dark theme");
      btn.setAttribute("title", "Switch to dark theme");
    } else {
      document.documentElement.removeAttribute("data-theme");
      btn.setAttribute("aria-label", "Switch to light theme");
      btn.setAttribute("title", "Switch to light theme");
    }
  }
  var saved = null;
  try { saved = localStorage.getItem("jn-theme"); } catch (e) { saved = null; }
  apply(saved === "light" ? "light" : "dark");
  btn.addEventListener("click", function () {
    var next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    try { localStorage.setItem("jn-theme", next); } catch (e) { /* ignore */ }
    apply(next);
  });
})();

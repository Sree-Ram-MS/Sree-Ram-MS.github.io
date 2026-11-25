(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Mobile menu */
  var toggle = document.querySelector(".menu-toggle");
  var panel = document.getElementById("menu-panel");
  if (toggle && panel) {
    var items = panel.querySelectorAll(".menu-item");
    items.forEach(function (el, i) {
      el.style.setProperty("--d", Math.min(i * 60, 400) + "ms");
    });
    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      panel.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    };
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    panel.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
    window.matchMedia("(min-width: 900px)").addEventListener("change", function (m) {
      if (m.matches) setOpen(false);
    });
  }

  /* Scroll reveals, once per element */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* Tagline reveal: each word activates as it crosses the trigger line */
  var tagline = document.querySelector("[data-tagline]");
  if (tagline) {
    var text = tagline.textContent.trim().split(/\s+/);
    tagline.textContent = "";
    var words = text.map(function (word, i) {
      var span = document.createElement("span");
      span.className = "w";
      span.textContent = word;
      tagline.appendChild(span);
      if (i < text.length - 1) tagline.appendChild(document.createTextNode(" "));
      return span;
    });
    if (reduceMotion || !("IntersectionObserver" in window)) {
      words.forEach(function (w) { w.classList.add("on"); });
    } else {
      var wordObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var crossed = entry.isIntersecting || entry.boundingClientRect.top < 0;
          entry.target.classList.toggle("on", crossed);
        });
      }, { rootMargin: "0px 0px -40% 0px", threshold: 0 });
      words.forEach(function (w) { wordObserver.observe(w); });
    }
  }

  /* Current section in navigation */
  var links = document.querySelectorAll(".nav-link[href^='#']");
  var sections = [];
  links.forEach(function (link) {
    var target = document.querySelector(link.getAttribute("href"));
    if (target) sections.push({ link: link, target: target });
  });
  if (sections.length && "IntersectionObserver" in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        sections.forEach(function (s) {
          if (s.target === entry.target) {
            if (entry.isIntersecting) s.link.setAttribute("aria-current", "true");
            else s.link.removeAttribute("aria-current");
          }
        });
      });
    }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });
    sections.forEach(function (s) { navObserver.observe(s.target); });
  }
})();

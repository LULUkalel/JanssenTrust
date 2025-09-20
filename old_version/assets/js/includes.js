document.addEventListener("DOMContentLoaded", () => {
    const includes = {
      "#topbar": "partials/topbar.html",
      "#navbar": "partials/navbar.html",
      "#about": "partials/about.html",
      "#contact-section": "partials/contact.html",
      "#footer": "partials/footer.html",
      "#ticker": "partials/ticker.html"
    };
  
    const tasks = Object.entries(includes).map(([selector, file]) =>
      fetch(file)
        .then(res => res.text())
        .then(html => {
          const el = document.querySelector(selector);
          if (el) el.innerHTML = html;
        })
        .catch(err => console.error("Include error:", file, err))
    );
  
    // Quand tous les partials sont chargés
    Promise.all(tasks).then(() => {
      // Défilement vers hash (#contact, etc.) une fois le DOM prêt
      if (location.hash) {
        const target = document.querySelector(location.hash);
        if (target) setTimeout(() => target.scrollIntoView({behavior:"smooth", block:"start"}), 50);
      }
  
      // Si la fonction du ticker existe déjà, on l’appelle maintenant
      if (typeof window.injectTradingViewTicker === "function") {
        window.injectTradingViewTicker();
      }
  
      // On émet un événement global (au cas où)
      document.dispatchEvent(new CustomEvent("partials:ready"));
    });
  });
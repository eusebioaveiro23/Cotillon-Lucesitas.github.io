/* =========================================================
   LUCESITAS — script.js
   Funcionalidades compartidas por todas las páginas
   ========================================================= */

// ---- Configuración centralizada ----
const LUCESITAS_CONFIG = {
  whatsappNumber: "595994315939", // [NÚMERO DE WHATSAPP] — formato internacional sin '+' ni espacios
  whatsappDefaultMessage: "Hola, Lucesitas. Me gustaría consultar sobre sus productos y promociones.",
};

function buildWhatsappLink(message) {
  const text = encodeURIComponent(message || LUCESITAS_CONFIG.whatsappDefaultMessage);
  return `https://wa.me/${LUCESITAS_CONFIG.whatsappNumber}?text=${text}`;
}

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initActiveNavLink();
  initWhatsappLinks();
  initScrollReveal();
  initGalleryLightbox();
  initProductFilters();
  initContactForm();
});

/* ---------------------------------------------------------
   Navbar: sticky shadow + menú mobile
--------------------------------------------------------- */
function initNavbar() {
  const navbar = document.querySelector("[data-navbar]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const links = document.querySelector("[data-nav-links]");

  if (navbar) {
    const onScroll = () => {
      navbar.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const isOpen = links.classList.toggle("is-open");
      toggle.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    links.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        links.classList.remove("is-open");
        toggle.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }
}

/* ---------------------------------------------------------
   Resalta el enlace de la página actual en el menú
--------------------------------------------------------- */
function initActiveNavLink() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav-links] a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  });
}

/* ---------------------------------------------------------
   Enlaces de WhatsApp: botón flotante + CTAs + productos
--------------------------------------------------------- */
function initWhatsappLinks() {
  // Botón flotante y CTAs genéricos
  document.querySelectorAll("[data-whatsapp]").forEach((el) => {
    const customMessage = el.getAttribute("data-whatsapp-message");
    el.setAttribute("href", buildWhatsappLink(customMessage));
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener noreferrer");
  });

  // Botones "Consultar" dentro de tarjetas de producto/combo
  document.querySelectorAll("[data-whatsapp-product]").forEach((el) => {
    const name = el.getAttribute("data-whatsapp-product") || "este producto";
    const price = el.getAttribute("data-whatsapp-price");
    let message = `Hola, Lucesitas. Quisiera consultar por "${name}"`;
    message += price ? ` (${price}).` : ".";
    el.setAttribute("href", buildWhatsappLink(message));
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener noreferrer");
  });
}

/* ---------------------------------------------------------
   Animación de aparición al hacer scroll
--------------------------------------------------------- */
function initScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------
   Galería: lightbox con navegación prev/next
--------------------------------------------------------- */
function initGalleryLightbox() {
  const items = Array.from(document.querySelectorAll("[data-gallery-item]"));
  const lightbox = document.querySelector("[data-lightbox]");
  if (!items.length || !lightbox) return;

  const imgEl = lightbox.querySelector("[data-lightbox-img]");
  const captionEl = lightbox.querySelector("[data-lightbox-caption]");
  const closeBtn = lightbox.querySelector("[data-lightbox-close]");
  const prevBtn = lightbox.querySelector("[data-lightbox-prev]");
  const nextBtn = lightbox.querySelector("[data-lightbox-next]");
  let currentIndex = 0;

  function openLightbox(index) {
    currentIndex = index;
    const item = items[currentIndex];
    const fullSrc = item.getAttribute("data-full") || item.querySelector("img").src;
    imgEl.src = fullSrc;
    imgEl.alt = item.querySelector("img").alt || "";
    captionEl.textContent = item.getAttribute("data-caption") || "";
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function showRelative(offset) {
    currentIndex = (currentIndex + offset + items.length) % items.length;
    openLightbox(currentIndex);
  }

  items.forEach((item, index) => {
    item.addEventListener("click", () => openLightbox(index));
    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");
    item.addEventListener("keypress", (e) => {
      if (e.key === "Enter" || e.key === " ") openLightbox(index);
    });
  });

  closeBtn && closeBtn.addEventListener("click", closeLightbox);
  prevBtn && prevBtn.addEventListener("click", () => showRelative(-1));
  nextBtn && nextBtn.addEventListener("click", () => showRelative(1));

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showRelative(-1);
    if (e.key === "ArrowRight") showRelative(1);
  });
}

/* ---------------------------------------------------------
   Filtro de categorías en productos.html
--------------------------------------------------------- */
function initProductFilters() {
  const filterButtons = document.querySelectorAll("[data-filter]");
  const products = document.querySelectorAll("[data-category]");
  if (!filterButtons.length || !products.length) return;

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const filter = btn.getAttribute("data-filter");

      products.forEach((product) => {
        const category = product.getAttribute("data-category");
        const show = filter === "todos" || filter === category;
        product.style.display = show ? "" : "none";
      });
    });
  });
}

/* ---------------------------------------------------------
   Formulario de contacto (preparado para Google Forms)
--------------------------------------------------------- */
function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const nombre = data.get("nombre") || "";
    const apellido = data.get("apellido") || "";
    const evento = data.get("tipo_evento") || "";
    const fecha = data.get("fecha_evento") || "";
    const mensaje = data.get("mensaje") || "";

    let resumen = `Hola, Lucesitas. Soy ${nombre} ${apellido}.`;
    if (evento) resumen += ` Estoy organizando: ${evento}.`;
    if (fecha) resumen += ` Fecha estimada: ${fecha}.`;
    if (mensaje) resumen += ` Mensaje: ${mensaje}`;

    // TODO: reemplazar por el envío real mediante Google Forms (action + input names)
    window.open(buildWhatsappLink(resumen), "_blank", "noopener,noreferrer");

    const feedback = form.querySelector("[data-form-feedback]");
    if (feedback) {
      feedback.textContent = "¡Gracias! Te redirigimos a WhatsApp para completar tu consulta.";
      feedback.hidden = false;
    }
  });
}


/* =========================================================
   🎃 HALLOWEEN — Efectos decorativos (bloque aislado)
   - No usa ni modifica funciones, variables ni listeners anteriores.
   - Crea un único contenedor fijo con pointer-events: none.
   - Si el usuario prefiere movimiento reducido, no se genera nada.
   - Si algo fallara aquí, el resto del sitio sigue funcionando.
   ========================================================= */
(function () {
  "use strict";
  try {
    if (document.querySelector(".hw-fx")) return;

    var mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    if (mq && mq.matches) return;

    var width = window.innerWidth || 1024;
    var tier = width < 640 ? 0 : (width < 1024 ? 1 : 2); // móvil, tablet, escritorio
    var batCount = [2, 4, 6][tier];
    var emberCount = [8, 14, 22][tier];
    var batMin = [24, 30, 34][tier];
    var batMax = [36, 46, 58][tier];

    function rand(min, max) { return min + Math.random() * (max - min); }

    var BAT_SVG =
      '<svg viewBox="0 0 64 32" aria-hidden="true" focusable="false">' +
        '<g class="hw-bat__wing"><path d="M32 16C26 6 14 4 2 8c6 2 7 6 6 10 4-3 7-2 9 2 3-3 7-2 11 2z"/></g>' +
        '<g transform="matrix(-1 0 0 1 64 0)"><g class="hw-bat__wing"><path d="M32 16C26 6 14 4 2 8c6 2 7 6 6 10 4-3 7-2 9 2 3-3 7-2 11 2z"/></g></g>' +
        '<ellipse cx="32" cy="18" rx="4" ry="6"/>' +
        '<path d="M28 13l1-6 3 4 3-4 1 6z"/>' +
      '</svg>';

    var EMBER_COLORS = ["#FFA94D", "#FF7A1A", "#FFD08A", "#B98CFF", "#8B4FE0"];

    var fx = document.createElement("div");
    fx.className = "hw-fx";
    fx.setAttribute("aria-hidden", "true");

    var frag = document.createDocumentFragment();

    for (var i = 0; i < batCount; i++) {
      var bat = document.createElement("div");
      bat.className = "hw-bat hw-bat--" + (i % 2 === 0 ? "ltr" : "rtl");
      bat.style.setProperty("--hw-y", rand(14, 72).toFixed(1) + "vh");
      bat.style.setProperty("--hw-size", rand(batMin, batMax).toFixed(0) + "px");
      bat.style.setProperty("--hw-dur", rand(16, 30).toFixed(1) + "s");
      bat.style.setProperty("--hw-delay", rand(0, 9).toFixed(1) + "s");
      bat.style.setProperty("--hw-amp", rand(18, 60).toFixed(0) + "px");
      bat.style.setProperty("--hw-flap", rand(0.3, 0.5).toFixed(2) + "s");
      bat.innerHTML = BAT_SVG;
      frag.appendChild(bat);
    }

    for (var j = 0; j < emberCount; j++) {
      var ember = document.createElement("span");
      ember.className = "hw-ember";
      ember.style.setProperty("--hw-x", rand(2, 98).toFixed(1) + "%");
      ember.style.setProperty("--hw-s", rand(2.5, 5.5).toFixed(1) + "px");
      ember.style.setProperty("--hw-c", EMBER_COLORS[Math.floor(Math.random() * EMBER_COLORS.length)]);
      ember.style.setProperty("--hw-dur", rand(11, 22).toFixed(1) + "s");
      ember.style.setProperty("--hw-delay", rand(0, 14).toFixed(1) + "s");
      ember.style.setProperty("--hw-sway", rand(15, 50).toFixed(0) + "px");
      frag.appendChild(ember);
    }

    fx.appendChild(frag);
    document.body.appendChild(fx);

    // Pausa las animaciones cuando la pestaña no está visible
    document.addEventListener("visibilitychange", function () {
      fx.classList.toggle("is-paused", document.hidden);
    });

    // Si el usuario activa "reducir movimiento" mientras navega, se retiran los efectos
    if (mq) {
      var onMotionChange = function (e) {
        if (e.matches && fx.parentNode) fx.parentNode.removeChild(fx);
      };
      if (mq.addEventListener) mq.addEventListener("change", onMotionChange);
      else if (mq.addListener) mq.addListener(onMotionChange);
    }
  } catch (err) {
    /* Los efectos son opcionales: ante cualquier error no se afecta al sitio. */
  }
})();
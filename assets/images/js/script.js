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

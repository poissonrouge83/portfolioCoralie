// SCROLL TO TOP
const scrollTopBtn = document.getElementById("scrollTop");

scrollTopBtn.onclick = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
//
//
//
//
//
//
//
//
// STICKY NAVBAR + ACTIVE LINK
const header = document.querySelector(".header");
const navbarLinks = document.querySelectorAll(".navbar a");
const navToggle = document.querySelector(".nav-toggle");
const navbar = document.querySelector(".navbar");

// Toggle menu burger (tablet/mobile)
if (navToggle && navbar && header) {
  navToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // Ferme le menu quand on clique sur un lien
  navbarLinks.forEach((link) => {
    link.addEventListener("click", () => {
      header.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  // Si on repasse en desktop, on ferme le menu proprement
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900 && header.classList.contains("nav-open")) {
      header.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

window.addEventListener("scroll", () => {
  if (window.scrollY > 50) header.classList.add("sticky");
  else header.classList.remove("sticky");

  const sections = document.querySelectorAll("section");
  sections.forEach((sec) => {
    const top = window.scrollY;
    const offset = sec.offsetTop - 200;
    const height = sec.offsetHeight;

    if (top >= offset && top < offset + height) {
      const id = sec.getAttribute("id");
      navbarLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === "#" + id)
          link.classList.add("active");
      });
    }
  });
});

// Ripple effect au clic (effet vague dans l'eau)
const rippleLayer = document.createElement("div");
rippleLayer.className = "click-ripples";
document.body.appendChild(rippleLayer);

document.addEventListener("click", (event) => {
  // Ignore les clics sur les éléments interactifs pour éviter la surcharge visuelle
  if (
    event.target.closest(
      "a, button, input, textarea, select, .nav-toggle, .navbar",
    )
  ) {
    return;
  }

  const ripple = document.createElement("div");
  ripple.className = "click-ripple";
  ripple.style.left = `${event.clientX}px`;
  ripple.style.top = `${event.clientY}px`;

  ripple.innerHTML = `
    <span class="ring ring-1"></span>
    <span class="ring ring-2"></span>
    <span class="ring ring-3"></span>
  `;

  rippleLayer.appendChild(ripple);

  // Nettoyage une fois l'animation terminée
  setTimeout(() => {
    ripple.remove();
  }, 1800);
});

// SCROLL TO TOP
const scrollTopBtn = document.getElementById("scrollTop");
const heroSection = document.getElementById("home");

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

  if (scrollTopBtn) {
    const threshold = heroSection ? heroSection.offsetHeight * 0.6 : 300;
    if (window.scrollY > threshold)
      scrollTopBtn.classList.add("is-visible");
    else scrollTopBtn.classList.remove("is-visible");
  }
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

// Soucoupe compagnon: déplacement lent + pauses en lévitation
const ufoCompanion = document.querySelector(".ufo-companion");
if (ufoCompanion && window.gsap) {
  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!prefersReducedMotion) {
    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const startFlight = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const margin = 80;
      const startX = -margin;
      const startY = clamp(
        vh * 0.15 + Math.random() * vh * 0.55,
        120,
        vh - 120,
      );

      gsap.set(ufoCompanion, {
        x: startX,
        y: startY,
        rotation: gsap.utils.random(-8, 8),
        scale: gsap.utils.random(0.95, 1.03),
        autoAlpha: 0,
      });

      const tl = gsap.timeline({ onComplete: startFlight });
      tl.to(ufoCompanion, { autoAlpha: 1, duration: 0.8, ease: "power1.out" });

      const segments = gsap.utils.random(4, 6, 1);
      let currentY = startY;

      for (let i = 0; i < segments; i += 1) {
        const isLast = i === segments - 1;
        const nextX = isLast
          ? vw + margin
          : gsap.utils.random(vw * 0.15, vw * 0.85);
        const nextY = clamp(
          currentY + gsap.utils.random(-220, 220),
          120,
          vh - 120,
        );
        currentY = nextY;

        tl.to(ufoCompanion, {
          x: nextX,
          y: nextY,
          rotation: gsap.utils.random(-12, 12),
          duration: gsap.utils.random(5, 9),
          ease: gsap.utils.random(["sine.inOut", "power1.inOut", "power2.inOut"]),
        });

        if (!isLast && Math.random() < 0.6) {
          tl.to(ufoCompanion, {
            x: nextX + gsap.utils.random(-14, 14),
            y: nextY + gsap.utils.random(-14, 14),
            duration: gsap.utils.random(1.6, 3.2),
            ease: "sine.inOut",
          });
        }

        if (!isLast && Math.random() < 0.45) {
          tl.to(ufoCompanion, {
            x: nextX + gsap.utils.random(-40, 40),
            y: nextY + gsap.utils.random(-30, 30),
            duration: gsap.utils.random(0.6, 1),
            ease: "power2.in",
          });
        }
      }

      tl.to(ufoCompanion, { autoAlpha: 0, duration: 0.8 });
    };

    startFlight();
  } else {
    ufoCompanion.style.opacity = "0";
  }
}

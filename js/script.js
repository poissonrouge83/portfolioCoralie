gsap.registerPlugin(ScrollTrigger);

// toggle icon navbar
let menuIcon = document.querySelector("#menu-icon");
let navbar = document.querySelector(".navbar");

menuIcon.onclick = () => {
  menuIcon.classList.toggle("bx-x");
  navbar.classList.toggle("active");
};

// sticky header
let header = document.querySelector("header");

header.classList.toggle("sticky", window.scrollY > 100);

// remove toggle icon and navbar when click navbar links (scroll)
menuIcon.classList.remove("bx-x");
navbar.classList.remove("active");
//
//
//
//
//
//

// Création bulle
document.addEventListener("mousemove", (e) => {
  const bubble = document.createElement("div");
  bubble.classList.add("bubble");

  // Petite variation aléatoire
  const size = Math.random() * 10 + 4; // entre 8px et 14px
  const offsetX = (Math.random() - 0.5) * 10;
  const offsetY = (Math.random() - 0.5) * 10;
  const duration = Math.random() * 0.5 + 0.6; // entre 0.6s et 1.1s

  bubble.style.width = size + "px";
  bubble.style.height = size + "px";

  bubble.style.left = e.clientX + offsetX + "px";
  bubble.style.top = e.clientY + offsetY + "px";

  bubble.style.animationDuration = duration + "s";

  document.body.appendChild(bubble);

  setTimeout(() => {
    bubble.remove();
  }, duration * 1000);
});

//
//
//
//
//
//
//
//
//
//

// /* CHAOS EXPLODE  */
// On dit à GSAP qu'on va utiliser le plugin ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// 1️⃣ On sélectionne TOUS les éléments qui ont la classe .explode
// querySelectorAll = plusieurs éléments possibles
const explodeTexts = document.querySelectorAll(".explode");

// 2️⃣ On va faire une boucle sur chaque élément trouvé
// Si tu as 1 titre → ça s'exécute 1 fois
// Si tu as 5 titres → ça s'exécute 5 fois
explodeTexts.forEach((text) => {
  // 3️⃣ On récupère le texte brut à l'intérieur de l'élément
  // childNodes[0] = premier noeud texte
  // Si jamais il n'existe pas, on prend textContent complet
  const rawText = text.childNodes[0]?.textContent || text.textContent;

  // 4️⃣ On transforme chaque lettre en <span class="letter">
  // Exemple :
  // "Hello"
  // devient
  // <span class="letter">H</span>
  // <span class="letter">e</span> etc.
  const lettersHTML = rawText
    .split("") // coupe chaque caractère
    .map((l) =>
      // Si le caractère est un espace
      l === " "
        ? // On met un espace insécable HTML
          `<span class="letter">&nbsp;</span>`
        : // Sinon on garde la lettre normale
          `<span class="letter">${l}</span>`,
    )
    .join(""); // rassemble tout

  // 5️⃣ On regarde si ton élément contenait déjà
  // un <span class="animate"> (animation d'ouverture)
  const animateSpan = text.querySelector(".animate");

  // 6️⃣ On remplace le contenu du texte par nos lettres
  // ⚠️ Ça supprime tout le HTML interne
  text.innerHTML = lettersHTML;

  // 7️⃣ Si on avait un span animate,
  // on le remet à la fin pour garder ton animation d'ouverture
  if (animateSpan) {
    text.appendChild(animateSpan);
  }

  // 8️⃣ On sélectionne maintenant toutes les lettres
  // mais seulement à l'intérieur de CE texte précis
  const letters = text.querySelectorAll(".letter");

  // 9️⃣ On remet toutes les lettres dans leur état initial
  // (position normale, pas tournées, visibles)
  gsap.set(letters, {
    opacity: 1,
    x: 0,
    y: 0,
    rotation: 0,
  });

  // 🔟 On crée l'animation au scroll
  gsap.to(letters, {
    scrollTrigger: {
      trigger: text, // L'animation se déclenche quand CE texte arrive
      start: "center 40%", // quand le centre du texte atteint 60% de l'écran
      end: "bottom top", // se termine quand il sort
      scrub: true, // suit le scroll en temps réel
    },

    // Chaque lettre reçoit une valeur aléatoire
    x: () => Math.random() * 200 - 100, // déplacement horizontal
    y: () => Math.random() * 200 - 100, // déplacement vertical
    rotation: () => Math.random() * 360, // rotation
  });
});
//
//
//
//
//
//
//
//
//////////////
// Animation de fade-in au scroll pour chaque projet
gsap.utils.toArray(".project-card").forEach((card) => {
  gsap.to(card, {
    scrollTrigger: {
      trigger: card,
      start: "top 80%", // quand la carte arrive dans la fenêtre
    },
    y: 0,
    opacity: 1,
    duration: 0.8,
    ease: "power2.out",
  });
});

// 1️⃣ On récupère tous les boutons "Voir plus"
const seeMoreBtns = document.querySelectorAll(".see-more-btn");

// 2️⃣ On crée une div pour le slider qui sera affichée au clic
const sliderOverlay = document.createElement("div");
sliderOverlay.classList.add("project-slider-overlay");
document.body.appendChild(sliderOverlay);

// On ajoute le slider et un bouton de fermeture
sliderOverlay.innerHTML = `
  <span class="close-slider">&times;</span>
  <div class="project-slider"></div>
`;

const sliderContainer = sliderOverlay.querySelector(".project-slider");
const closeBtn = sliderOverlay.querySelector(".close-slider");

// 3️⃣ On définit les images par projet
const projectImages = {
  0: ["img/nu-screen.png", "img/flyer-recto.png", "img/flyer-verso.png"],

  1: ["img/ko.png", "img/ko-detail.png", "img/ko-mockup.png"],

  2: ["img/site.png", "img/site-mobile.png", "img/site-ui.png"],
};

// 🔹 2️⃣ On attache les images au bon bouton
seeMoreBtns.forEach((btn, index) => {
  btn.addEventListener("click", () => {
    sliderContainer.innerHTML = "";

    const images = projectImages[index];

    if (!images) return;

    images.forEach((src) => {
      const img = document.createElement("img");
      img.src = src;
      sliderContainer.appendChild(img);
    });

    sliderOverlay.classList.add("active");
  });
});

// 4️⃣ Fermer le slider
closeBtn.addEventListener("click", () => {
  sliderOverlay.classList.remove("active");
});

// 5️⃣ Fermer si on clique en dehors du slider
sliderOverlay.addEventListener("click", (e) => {
  if (e.target === sliderOverlay) {
    sliderOverlay.classList.remove("active");
  }
});
//
//
//
//
//
//
//
//
// Animation d’apparition des skills
// const skillCards = document.querySelectorAll(".skill-card");

// const observer = new IntersectionObserver(
//   (entries) => {
//     entries.forEach((entry) => {
//       if (entry.isIntersecting) {
//         const card = entry.target;
//         const level = card.getAttribute("data-level");
//         const circle = card.querySelector(".skill-circle");
//         const percentText = card.querySelector(".skill-percent");

//         let current = 0;
//         const interval = setInterval(() => {
//           if (current >= level) {
//             clearInterval(interval);
//           } else {
//             current++;
//             percentText.textContent = current + "%";
//             circle.style.background = `conic-gradient(var(--main-color) ${current * 3.6}deg, rgba(255,255,255,0.1) 0deg)`;
//           }
//         }, 15);

//         observer.unobserve(card);
//       }
//     });
//   },
//   { threshold: 0.5 },
// );

// skillCards.forEach((card) => observer.observe(card));
// Animation camembert au hover
const skillCards = document.querySelectorAll(".skill-card");

skillCards.forEach((card) => {
  const circle = card.querySelector(".skill-circle");
  const percent = card.dataset.level;
  const percentText = card.querySelector(".skill-percent");

  card.addEventListener("mouseenter", () => {
    let current = 0;
    let interval = setInterval(() => {
      if (current >= percent) {
        clearInterval(interval);
      } else {
        current++;
        percentText.textContent = current + "%";
        circle.style.background = `conic-gradient(var(--main-color) ${current * 3.6}deg, rgba(255,255,255,0.1) ${current * 3.6}deg)`;
      }
    }, 15);
  });

  // reset si tu veux que ça reparte à 0 au mouse leave
  card.addEventListener("mouseleave", () => {
    percentText.textContent = "0%";
    circle.style.background = `conic-gradient(var(--main-color) 0deg, rgba(255,255,255,0.1) 0deg)`;
  });
});

// FOOTER
const scrollTopBtn = document.getElementById("scrollTop");

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

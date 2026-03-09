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
//
//
//
//
//
//////////////
// Animation projet
// -------------------------------
// Slider projets stable au scroll
// -------------------------------
const track = document.querySelector(".projects-track");
const wrapper = document.querySelector(".projects-wrapper");
const projectsSection = document.querySelector(".projects-section");

// Dupliquer le contenu pour créer un scroll infini visuel
track.innerHTML += track.innerHTML;

let isDown = false;
let startX;

// Timeline GSAP pour slider
// On n'utilise pas repeat: -1 infini pour éviter les conflits
const sliderTimeline = gsap.timeline({ paused: true });
sliderTimeline.to(track, {
  xPercent: -50, // déplace le track horizontalement
  ease: "none",
  duration: 50,
});

// -------------------------------
// Drag interactif
// -------------------------------
wrapper.addEventListener("pointerdown", (e) => {
  isDown = true;
  sliderTimeline.pause(); // pause l'animation pendant le drag
  startX = e.clientX;
  wrapper.style.cursor = "grabbing";
});

wrapper.addEventListener("pointermove", (e) => {
  if (!isDown) return;
  e.preventDefault();
  const walk = (e.clientX - startX) * 1.5;
  gsap.to(track, { x: `+=${walk}px`, duration: 0 });
  startX = e.clientX;
});

wrapper.addEventListener("pointerup", () => {
  isDown = false;
  wrapper.style.cursor = "grab";
});

wrapper.addEventListener("pointerleave", () => {
  if (!isDown) return;
  isDown = false;
  wrapper.style.cursor = "grab";
});

// -------------------------------
// ScrollTrigger pour démarrer le slider au scroll
// -------------------------------
ScrollTrigger.create({
  trigger: projectsSection,
  start: "center -70%", // quand le haut de la section atteint le bas de l'écran
  onEnter: () => sliderTimeline.play(), // joue l'animation au scroll
  once: true, // ne déclenche qu'une seule fois
  markers: true,
});
// force GSAP à recalculer les positions
ScrollTrigger.refresh();

// -------------------------------
// Optionnel : si la section est déjà visible au chargement
// -------------------------------
window.addEventListener("load", () => {
  const rect = projectsSection.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom > 0) {
    sliderTimeline.play();
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
//
//
// Animation d’apparition des skills
//
function animateSkill(card) {
  const circle = card.querySelector(".skill-circle");
  const percent = card.querySelector(".skill-percent");
  const level = parseInt(card.dataset.level);

  let obj = { value: 0 };

  gsap.to(obj, {
    value: level,
    duration: 1.5,
    ease: "power1.out",

    onUpdate: () => {
      let deg = obj.value * 3.6;

      circle.style.background = `conic-gradient(var(--main-color) ${deg}deg, rgba(255,255,255,0.1) 0deg)`;

      percent.textContent = `${Math.round(obj.value)}%`;
    },
  });
}
if (window.innerWidth <= 650) {
  document.querySelectorAll(".skill-card").forEach((card) => {
    ScrollTrigger.create({
      trigger: card,
      start: "top 80%",
      once: true,
      onEnter: () => animateSkill(card),
    });
  });
}
if (window.innerWidth > 650) {
  document.querySelectorAll(".skill-card").forEach((card) => {
    card.addEventListener("mouseenter", () => {
      animateSkill(card);
    });
  });
}

// FOOTER
const scrollTopBtn = document.getElementById("scrollTop");

scrollTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

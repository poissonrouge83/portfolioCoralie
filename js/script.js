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
// Animation projet
const track = document.querySelector(".projects-track");
const wrapper = document.querySelector(".projects-wrapper");

// duplique les images pour la boucle infinie
track.innerHTML += track.innerHTML;

let isDown = false;
let startX;
let autoScrollTimer; // timer pour relancer l'auto-scroll

// animation GSAP auto-scroll
const autoScroll = gsap.to(track, {
  x: "-50%",
  duration: 40,
  ease: "none",
  repeat: -1,
});

// fonction pour relancer l'auto-scroll après X ms
function restartAutoScroll(delay = 60000) {
  clearTimeout(autoScrollTimer);
  autoScrollTimer = setTimeout(() => {
    autoScroll.resume();
  }, delay);
}

// drag avec souris / doigt
wrapper.addEventListener("pointerdown", (e) => {
  isDown = true;

  autoScroll.pause(); // stoppe immédiatement
  clearTimeout(autoScrollTimer); // annule le timer si existant

  startX = e.clientX;
  wrapper.style.cursor = "grabbing";
});

wrapper.addEventListener("pointermove", (e) => {
  if (!isDown) return;
  e.preventDefault();

  const x = e.clientX;
  const walk = x - startX;

  gsap.to(track, {
    x: `+=${walk}px`,
    duration: 0, // instant
  });

  startX = x;
});

wrapper.addEventListener("pointerup", () => {
  isDown = false;
  wrapper.style.cursor = "grab";

  restartAutoScroll(); // relance l'animation après 1 min
});

wrapper.addEventListener("pointerleave", () => {
  if (!isDown) return;
  isDown = false;
  wrapper.style.cursor = "grab";

  restartAutoScroll(); // relance l'animation après 1 min
});
//
//
//
//
//
//
// Animation d’apparition des skills
//
// const skillCards = document.querySelectorAll(".skill-card");

// skillCards.forEach((card) => {
//   const circle = card.querySelector(".skill-circle");
//   const percent = card.dataset.level;
//   const percentText = card.querySelector(".skill-percent");

//   card.addEventListener("mouseenter", () => {
//     let current = 0;
//     let interval = setInterval(() => {
//       if (current >= percent) {
//         clearInterval(interval);
//       } else {
//         current++;
//         percentText.textContent = current + "%";
//         circle.style.background = `conic-gradient(var(--main-color) ${current * 3.6}deg, rgba(255,255,255,0.1) ${current * 3.6}deg)`;
//       }
//     }, 15);
//   });

//   // reset si tu veux que ça reparte à 0 au mouse leave
//   card.addEventListener("mouseleave", () => {
//     percentText.textContent = "0%";
//     circle.style.background = `conic-gradient(var(--main-color) 0deg, rgba(255,255,255,0.1) 0deg)`;
//   });
// });
// JS pour animations au scroll avec GSAP

// ================= SKILLS - CAMEMBERT =================
// document.querySelectorAll(".skill-card").forEach((card) => {
//   const circle = card.querySelector(".skill-circle");
//   const percent = card.querySelector(".skill-percent");
//   const level = card.dataset.level;

//   gsap.fromTo(
//     circle,
//     {
//       background:
//         "conic-gradient(var(--main-color) 0deg, rgba(255,255,255,0.1) 0deg)",
//     },
//     {
//       background: `conic-gradient(var(--main-color) ${level * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
//       duration: 1.5,
//       ease: "power1.out",
//       scrollTrigger: {
//         trigger: card,
//         start: "top 80%", // déclenche quand le haut de la carte touche 80% du viewport
//       },
//       onUpdate: () => {
//         const deg = gsap.getProperty(circle, "background");
//         let current = Math.round(
//           parseFloat(level) * gsap.getProperty(circle, "progress") || 0,
//         );
//         percent.textContent = `${current}%`;
//       },
//     },
//   );
// });
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

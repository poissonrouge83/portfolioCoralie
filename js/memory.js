// const gallery = document.getElementById("memory-game");
// const victoryMessage = document.getElementById("victory-message");

// // Liste des images
// const images = [
//   "/img/ajt.png",
//   "/img/ko.png",
//   "/img/nuance.png",
//   "/img/logos.png",
//   "/img/lumen.png",
//   "/img/mockup.png",
// ];

// // Variables
// let matchedPairs = 0;
// const totalPairs = images.length;
// let flippedCards = [];
// let lockBoard = false;

// // Génération initiale des cartes
// startGame();

// function startGame() {
//   gallery.innerHTML = "";

//   matchedPairs = 0;
//   flippedCards = [];
//   lockBoard = false;

//   // Dupliquer et mélanger les images
//   let gameImages = [...images, ...images].sort(() => 0.5 - Math.random());

//   gameImages.forEach((src) => {
//     const card = document.createElement("div");
//     card.classList.add("card");

//     // Les cartes commencent invisibles et réduites
//     card.style.opacity = 0;
//     card.style.transform = "translateY(-500px) scale(0)";

//     card.innerHTML = `
//       <div class="front"></div>
//       <div class="back">
//         <img src="${src}" alt="">
//       </div>
//     `;
//     gallery.appendChild(card);
//   });

//   // Activer le jeu
//   activateGame();

//   // Déclencher l'animation “stats” à l'entrée
//   observeGalleryEntrance();
// }

// function activateGame() {
//   const cards = document.querySelectorAll(".card");

//   cards.forEach((card) => {
//     card.addEventListener("click", () => {
//       if (lockBoard || card.classList.contains("flipped")) return;

//       card.classList.add("flipped");
//       flippedCards.push(card);

//       if (flippedCards.length === 2) {
//         lockBoard = true;
//         const [first, second] = flippedCards;
//         const firstImg = first.querySelector("img").src;
//         const secondImg = second.querySelector("img").src;

//         if (firstImg === secondImg) {
//           // Animation pour paire trouvée
//           gsap.fromTo(
//             [first, second],
//             { scale: 1 },
//             { scale: 1.2, duration: 0.25, yoyo: true, repeat: 1 },
//           );

//           matchedPairs++;
//           flippedCards = [];
//           lockBoard = false;

//           if (matchedPairs === totalPairs) {
//             setTimeout(endGameAnimation, 800);
//           }
//         } else {
//           setTimeout(() => {
//             first.classList.remove("flipped");
//             second.classList.remove("flipped");
//             flippedCards = [];
//             lockBoard = false;
//           }, 900);
//         }
//       }
//     });
//   });
// }

// // ⚡ Animation d’entrée “Stats” avec apparition
// function animateCardsEntrance() {
//   const cards = document.querySelectorAll(".card");

//   gsap.to(cards, {
//     y: 0,
//     opacity: 1,
//     scale: 1,
//     rotation: () => Math.random() * 30 - 15,
//     duration: 0.8,
//     ease: "bounce.out",
//     stagger: {
//       each: 0.08,
//       from: "random",
//     },
//   });
// }

// // Observer pour déclencher l’animation quand la section est visible à 50%
// function observeGalleryEntrance() {
//   const observer = new IntersectionObserver(
//     (entries, obs) => {
//       entries.forEach((entry) => {
//         if (entry.isIntersecting) {
//           animateCardsEntrance();
//           obs.unobserve(entry.target);
//         }
//       });
//     },
//     { threshold: 0.5 },
//   );

//   observer.observe(gallery);
// }

// // Animation finale victoire
// function endGameAnimation() {
//   const cards = document.querySelectorAll(".card");

//   // Animation cartes
//   gsap.to(cards, {
//     rotateY: "+=720",
//     duration: 2,
//     stagger: { each: 0.05, from: "random" },
//     ease: "power2.inOut",
//   });

//   // Message victoire
//   gsap.to(victoryMessage, {
//     scale: 1,
//     duration: 2.6,
//     ease: "back.out(1.7)",
//   });

//   launchConfetti();

//   // Après quelques secondes, reset
//   setTimeout(() => {
//     gsap.to(victoryMessage, { scale: 0, duration: 0.4 });
//     resetCards();
//   }, 3500);
// }

// // Remettre les cartes côté recto et relancer le jeu
// function resetCards() {
//   const cards = document.querySelectorAll(".card");
//   cards.forEach((card) => card.classList.remove("flipped"));
//   setTimeout(startGame, 800);
// }

// // Feu d’artifice
// function launchConfetti() {
//   const duration = 2500;
//   const end = Date.now() + duration;

//   const interval = setInterval(() => {
//     if (Date.now() > end) {
//       clearInterval(interval);
//       return;
//     }

//     confetti({
//       particleCount: 50,
//       spread: 100,
//       origin: {
//         x: Math.random(),
//         y: Math.random() - 0.2,
//       },
//     });
//   }, 200);
// }
//

//
//
//
//
//
//
//
//
// const gallery = document.getElementById("memory-game");
// const victoryMessage = document.getElementById("victory-message");

// // Liste des images
// const images = [
//   "/img/ajt.png",
//   "/img/ko.png",
//   "/img/nuance.png",
//   "/img/logos.png",
//   "/img/lumen.png",
//   "/img/mockup.png",
// ];

// // Variables
// let matchedPairs = 0;
// const totalPairs = images.length;
// let flippedCards = [];
// let lockBoard = false;

// // Génération initiale des cartes
// startGame();

// function startGame() {
//   gallery.innerHTML = "";

//   matchedPairs = 0;
//   flippedCards = [];
//   lockBoard = false;

//   // Dupliquer et mélanger les images
//   let gameImages = [...images, ...images].sort(() => 0.5 - Math.random());

//   gameImages.forEach((src) => {
//     const card = document.createElement("div");
//     card.classList.add("card");

//     // Les cartes commencent invisibles et réduites
//     card.style.opacity = 0;

//     const startY = gsap.utils.random(-600, -300);
//     const startX = gsap.utils.random(-120, 120);
//     const startRot = gsap.utils.random(-25, 25);

//     card.style.transform = `translate(${startX}px, ${startY}px) rotate(${startRot}deg) scale(0.9)`;

//     card.innerHTML = `
//       <div class="front"></div>
//       <div class="back">
//         <img src="${src}" alt="">
//       </div>
//     `;
//     gallery.appendChild(card);
//   });

//   // Activer le jeu
//   activateGame();
// }

// function activateGame() {
//   const cards = document.querySelectorAll(".card");

//   cards.forEach((card) => {
//     card.addEventListener("click", () => {
//       if (lockBoard || card.classList.contains("flipped")) return;

//       card.classList.add("flipped");
//       flippedCards.push(card);

//       if (flippedCards.length === 2) {
//         lockBoard = true;
//         const [first, second] = flippedCards;
//         const firstImg = first.querySelector("img").src;
//         const secondImg = second.querySelector("img").src;

//         if (firstImg === secondImg) {
//           // Animation pour paire trouvée
//           gsap.fromTo(
//             [first, second],
//             { scale: 1 },
//             { scale: 1.2, duration: 0.25, yoyo: true, repeat: 1 },
//           );

//           matchedPairs++;
//           flippedCards = [];
//           lockBoard = false;

//           if (matchedPairs === totalPairs) {
//             setTimeout(endGameAnimation, 800);
//           }
//         } else {
//           setTimeout(() => {
//             first.classList.remove("flipped");
//             second.classList.remove("flipped");
//             flippedCards = [];
//             lockBoard = false;
//           }, 900);
//         }
//       }
//     });
//   });
// }

// // ⚡ Animation d’entrée “Stats” avec apparition
// function animateCardsEntrance() {
//   const cards = document.querySelectorAll(".card");

//   cards.forEach((card) => {
//     // Position de départ aléatoire
//     const startX = gsap.utils.random(-200, 200);
//     const startY = gsap.utils.random(-800, -500);
//     const startRot = gsap.utils.random(-180, 180);

//     gsap.set(card, {
//       x: startX,
//       y: startY,
//       rotation: startRot,
//       opacity: 0,
//       scale: 0.9,
//     });

//     // Animation principale : chute + rotation + apparition
//     const endRot = startRot + gsap.utils.random(720, 1080);
//     const duration = gsap.utils.random(3, 5);
//     const delay = gsap.utils.random(0, 3);

//     gsap.to(card, {
//       x: gsap.utils.random(-50, 50), // léger décalage horizontal
//       y: 0, // position finale
//       rotation: endRot,
//       opacity: 1,
//       scale: 1,
//       duration: duration,
//       delay: delay,
//       ease: "power2.out",
//       onComplete: () => {
//         // petite oscillation après atterrissage
//         gsap.to(card, {
//           y: "+=5",
//           duration: 0.4,
//           yoyo: true,
//           repeat: 1,
//           ease: "power1.inOut",
//         });
//       },
//     });
//   });
// }

// //  déclencher l’animation quand
// ScrollTrigger.create({
//   trigger: ".gallery",
//   start: "top 80%",
//   once: true,
//   onEnter: animateCardsEntrance,
// });

// // Animation finale victoire
// function endGameAnimation() {
//   const cards = document.querySelectorAll(".card");

//   // Animation cartes
//   gsap.to(cards, {
//     rotateY: "+=720",
//     duration: 2,
//     stagger: { each: 0.05, from: "random" },
//     ease: "power2.inOut",
//   });

//   // Message victoire
//   gsap.to(victoryMessage, {
//     scale: 1,
//     duration: 2.6,
//     ease: "back.out(1.7)",
//   });

//   launchConfetti();

//   // Après quelques secondes, reset
//   setTimeout(() => {
//     gsap.to(victoryMessage, { scale: 0, duration: 0.4 });
//     resetCards();
//   }, 3500);
// }

// // Remettre les cartes côté recto et relancer le jeu
// function resetCards() {
//   const cards = document.querySelectorAll(".card");
//   cards.forEach((card) => card.classList.remove("flipped"));
//   setTimeout(startGame, 800);
// }

// // Feu d’artifice
// function launchConfetti() {
//   const duration = 2500;
//   const end = Date.now() + duration;

//   const interval = setInterval(() => {
//     if (Date.now() > end) {
//       clearInterval(interval);
//       return;
//     }

//     confetti({
//       particleCount: 50,
//       spread: 100,
//       origin: {
//         x: Math.random(),
//         y: Math.random() - 0.2,
//       },
//     });
//   }, 200);
// }
//
//
//
//
//
//
//
//
//
// ===============================
// MEMORY GAME + ANIMATION MODERNE
// ===============================

const gallery = document.getElementById("memory-game");
const victoryMessage = document.getElementById("victory-message");

// Images
const images = [
  "/img/ajt.png",
  "/img/ko.png",
  "/img/nuance.png",
  "/img/logos.png",
  "/img/lumen.png",
  "/img/mockup.png",
];

// Variables
let matchedPairs = 0;
const totalPairs = images.length;
let flippedCards = [];
let lockBoard = false;

// ===============================
// INIT GAME
// ===============================
startGame();

function startGame() {
  gallery.innerHTML = "";

  matchedPairs = 0;
  flippedCards = [];
  lockBoard = false;

  let gameImages = [...images, ...images].sort(() => 0.5 - Math.random());

  gameImages.forEach((src) => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <div class="front"></div>
      <div class="back">
        <img src="${src}" alt="">
      </div>
    `;

    gallery.appendChild(card);
  });

  activateGame();
}

// ===============================
// GAME LOGIC
// ===============================
function activateGame() {
  const cards = document.querySelectorAll(".card");

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      if (lockBoard || card.classList.contains("flipped")) return;

      card.classList.add("flipped");
      flippedCards.push(card);

      if (flippedCards.length === 2) {
        lockBoard = true;

        const [first, second] = flippedCards;
        const firstImg = first.querySelector("img").src;
        const secondImg = second.querySelector("img").src;

        if (firstImg === secondImg) {
          gsap.fromTo(
            [first, second],
            { scale: 1 },
            { scale: 1.15, duration: 0.25, yoyo: true, repeat: 1 },
          );

          matchedPairs++;
          flippedCards = [];
          lockBoard = false;

          if (matchedPairs === totalPairs) {
            setTimeout(endGameAnimation, 800);
          }
        } else {
          setTimeout(() => {
            first.classList.remove("flipped");
            second.classList.remove("flipped");
            flippedCards = [];
            lockBoard = false;
          }, 800);
        }
      }
    });
  });
}

// ===============================
// ANIMATION D'ENTRÉE (NOUVEAU STYLE)
// ===============================
function randomStartPosition(card) {
  const dir = gsap.utils.random(["top", "bottom", "left", "right"]);

  let x = 0;
  let y = 0;

  switch (dir) {
    case "top":
      y = gsap.utils.random(-400, -200);
      x = gsap.utils.random(-200, 200);
      break;

    case "bottom":
      y = gsap.utils.random(200, 400);
      x = gsap.utils.random(-200, 200);
      break;

    case "left":
      x = gsap.utils.random(-400, -200);
      y = gsap.utils.random(-200, 200);
      break;

    case "right":
      x = gsap.utils.random(200, 400);
      y = gsap.utils.random(-200, 200);
      break;
  }

  const rot = gsap.utils.random(-90, 90);

  gsap.set(card, {
    x: x,
    y: y,
    rotation: rot,
    opacity: 0,
    scale: 0.8,
  });
}

function animateCardsEntrance() {
  const cards = document.querySelectorAll(".card");

  cards.forEach((card) => {
    randomStartPosition(card);
  });

  gsap.to(cards, {
    x: 0,
    y: 0,
    rotation: 0,
    opacity: 1,
    scale: 1,
    duration: () => gsap.utils.random(1.2, 2.2),
    delay: () => gsap.utils.random(0, 1.5),
    ease: "power2.out",
    stagger: {
      each: 0.15,
      from: "random",
    },
  });
}

// ===============================
// TRIGGER SCROLL
// ===============================
ScrollTrigger.create({
  trigger: "#memory-game",
  start: "top 75%",
  once: true,
  onEnter: animateCardsEntrance,
});

// ===============================
// VICTORY
// ===============================
function endGameAnimation() {
  const cards = document.querySelectorAll(".card");

  gsap.to(cards, {
    rotateY: "+=720",
    duration: 1.5,
    stagger: { each: 0.05, from: "random" },
    ease: "power2.inOut",
  });

  gsap.to(victoryMessage, {
    scale: 1,
    duration: 1,
    ease: "back.out(1.7)",
  });

  launchConfetti();

  setTimeout(() => {
    gsap.to(victoryMessage, { scale: 0, duration: 0.3 });
    resetCards();
  }, 3000);
}

function resetCards() {
  const cards = document.querySelectorAll(".card");
  cards.forEach((card) => card.classList.remove("flipped"));
  setTimeout(startGame, 600);
}

// ===============================
// CONFETTI
// ===============================
function launchConfetti() {
  const duration = 2000;
  const end = Date.now() + duration;

  const interval = setInterval(() => {
    if (Date.now() > end) {
      clearInterval(interval);
      return;
    }

    confetti({
      particleCount: 40,
      spread: 90,
      origin: {
        x: Math.random(),
        y: Math.random() - 0.2,
      },
    });
  }, 200);
}

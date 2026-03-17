gsap.registerPlugin(ScrollTrigger);

// FADE-IN SECTIONS
gsap.utils.toArray(".fade").forEach((section) => {
  gsap.fromTo(
    section,
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
      },
    },
  );
});

// PHYSICS STATS
// ===============================

gsap.from(".stat", {
  yPercent: -200,
  // y: -120,
  rotation: () => gsap.utils.random(-300, 300),
  opacity: 0,
  duration: 1.2,
  ease: "bounce.out",
  stagger: 0.25,

  scrollTrigger: {
    trigger: ".stats",
    start: "top 80%",
    toggleActions: "restart none none none",
    once: false,
  },
});

///////////// GSAP ANIM DOUBLE

// Génération dynamique des boxes (html)
const boxesContainer = document.querySelector(".boxes-container");
const boxCount = 100; // nombre de boxes souhaité

for (let i = 0; i < boxCount; i++) {
  const box = document.createElement("div");
  box.classList.add("box");
  boxesContainer.appendChild(box);
}
gsap
  .timeline({
    scrollTrigger: {
      trigger: ".trigger",
      scrub: 0.5,
      pin: true,
      pinSpacing: true,

      start: "top top",
      end: "+=150%",
    },
  })

  .to(".box", {
    force3D: true, // Active le rendu 3D pour de meilleures performances
    duration: 1, // Durée de l'animation
    xPercent: 100, // Déplace les éléments de 100% horizontalement
    ease: "power1.inOut", // Fonction d'accélération de l'animation
    stagger: { amount: 1 }, // Délai entre les éléments animés (s'ils sont multiples)
  })

  .to(
    ".box",
    {
      ease: "power1.out",
      duration: 1,
      rotation: "45deg",
    },
    0,
  )

  .to(
    ".box",
    {
      ease: "power1.in",
      duration: 1,
      rotation: "0deg",
    },
    1,
  );

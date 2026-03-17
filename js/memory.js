gsap.registerPlugin(ScrollTrigger);

const gallery = document.getElementById("memory-game");
const victoryMessage = document.getElementById("victory-message");

if (gallery) {
  const images = [
    "img/ajt.png",
    "img/ko.png",
    "img/nuance.png",
    "img/logos.png",
    "img/lumen.png",
    "img/mockup.png",
  ];

  let matchedPairs = 0;
  const totalPairs = images.length;
  let flippedCards = [];
  let lockBoard = false;
  let entranceReady = false;

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  ScrollTrigger.create({
    trigger: "#memory-game",
    start: "top 75%",
    once: true,
    onEnter: () => {
      entranceReady = true;
      animateCardsEntrance();
    },
  });

  startGame();

  function startGame() {
    gallery.innerHTML = "";
    matchedPairs = 0;
    flippedCards = [];
    lockBoard = false;

    const gameImages = [...images, ...images].sort(() => 0.5 - Math.random());

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

    if (entranceReady) {
      animateCardsEntrance();
    }
  }

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
              { scale: 1.12, duration: 0.22, yoyo: true, repeat: 1 },
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

  function applyOrbit(card, orbit, vx, vy) {
    const currentX = Math.cos(orbit.angle) * orbit.radius;
    const currentY = Math.sin(orbit.angle) * orbit.radius;
    gsap.set(card, { x: currentX - vx, y: currentY - vy });
  }

  function animateCardsEntrance() {
    const cards = gsap.utils.toArray(".card");
    gsap.killTweensOf(cards);

    if (prefersReducedMotion) {
      gsap.set(cards, { x: 0, y: 0, rotation: 0, opacity: 1, scale: 1 });
      return;
    }

    const galleryRect = gallery.getBoundingClientRect();
    const centerX = galleryRect.left + galleryRect.width / 2;
    const centerY = galleryRect.top + galleryRect.height / 2;
    let completed = 0;

    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;

      const vx = cardCenterX - centerX;
      const vy = cardCenterY - centerY;
      const baseRadius = Math.max(1, Math.hypot(vx, vy));
      const baseAngle = Math.atan2(vy, vx);
      const spin = gsap.utils.random(Math.PI * 1.1, Math.PI * 1.9);

      const orbit = {
        radius: 0,
        angle: baseAngle + spin,
      };

      gsap.set(card, {
        x: -vx,
        y: -vy,
        opacity: 0,
        scale: 0.86,
        rotation: gsap.utils.random(-6, 6),
      });

      const delay = index * 0.06 + gsap.utils.random(0, 0.35);
      const tl = gsap.timeline({ delay });

      tl.to(card, { opacity: 1, duration: 0.45, ease: "power1.out" }, 0);
      tl.to(card, { scale: 1, duration: 1.2, ease: "power3.out" }, 0);
      tl.to(card, { rotation: 0, duration: 1.2, ease: "power3.out" }, 0);

      tl.to(
        orbit,
        {
          radius: baseRadius * 1.1,
          angle: baseAngle - 0.15,
          duration: 1.2,
          ease: "power2.out",
          onUpdate: () => applyOrbit(card, orbit, vx, vy),
        },
        0,
      );

      tl.to(orbit, {
        radius: baseRadius,
        angle: baseAngle,
        duration: 0.55,
        ease: "power3.out",
        onUpdate: () => applyOrbit(card, orbit, vx, vy),
        onComplete: () => {
          completed += 1;
          if (completed === cards.length) {
            floatCards(cards);
          }
        },
      });
    });
  }

  function floatCards(cards) {
    cards.forEach((card) => {
      gsap.to(card, {
        y: "+=6",
        duration: gsap.utils.random(3.6, 5.6),
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: gsap.utils.random(0, 1.2),
      });
    });
  }

  function endGameAnimation() {
    const cards = document.querySelectorAll(".card");

    gsap.to(cards, {
      rotateY: "+=720",
      duration: 1.4,
      stagger: { each: 0.05, from: "random" },
      ease: "power2.inOut",
    });

    gsap.to(victoryMessage, {
      scale: 1,
      duration: 0.9,
      ease: "back.out(1.6)",
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
}

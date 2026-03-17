// gsap.registerPlugin(ScrollTrigger);

// /* scroll horizontal */

// const skills = document.querySelector(".skills-grid");

// const horizontalScroll = gsap.to(skills, {
//   x: () => -(skills.scrollWidth - window.innerWidth),
//   ease: "none",
//   scrollTrigger: {
//     trigger: ".skills-section",
//     start: "top top",
//     end: () => "+=" + skills.scrollWidth,
//     scrub: true,
//     pin: true,
//   },
// });
// //
// //
// //
// //
// //
// //
// //
// // Camembert

// function animateSkill(card) {
//   const percent = card.querySelector(".skill-percent");
//   const circle = card.querySelector(".circle-progress");
//   const level = parseInt(card.dataset.level);

//   gsap.to(
//     { val: 0 },
//     {
//       val: level,
//       duration: 1.5,
//       ease: "power2.out",
//       onUpdate: function () {
//         const progress = this.targets()[0].val;
//         const dashOffset = 100 - progress;
//         circle.style.strokeDashoffset = dashOffset;
//         percent.textContent = `${Math.round(progress)}%`;
//       },
//     },
//   );
// }
// document.querySelectorAll(".skill-card").forEach((card) => {
//   ScrollTrigger.create({
//     trigger: card,

//     containerAnimation: horizontalScroll,

//     start: "left 80%",

//     once: true,

//     onEnter: () => animateSkill(card),
//   });
// });
//
//
//
//
//
//
//
//
gsap.registerPlugin(ScrollTrigger);

/* scroll horizontal */

const skills = document.querySelector(".skills-grid");

const horizontalScroll = gsap.to(skills, {
  x: () => -(skills.scrollWidth - window.innerWidth),
  ease: "none",
  scrollTrigger: {
    trigger: ".skills-section",
    start: "top top",
    end: () => "+=" + (skills.scrollWidth + 500), // 500px de scroll vertical en plus

    scrub: true,
    pin: true,
  },
});
//
//
//
//
//
//
//
// Camembert

function animateSkill(card) {
  const percent = card.querySelector(".skill-percent");
  const circle = card.querySelector(".circle-progress");
  const level = parseInt(card.dataset.level);

  gsap.to(
    { val: 0 },
    {
      val: level,
      duration: 1.5,
      ease: "power2.out",
      onUpdate: function () {
        const progress = this.targets()[0].val;
        const dashOffset = 100 - progress;
        circle.style.strokeDashoffset = dashOffset;
        percent.textContent = `${Math.round(progress)}%`;
      },
    },
  );
}
document.querySelectorAll(".skill-card").forEach((card) => {
  ScrollTrigger.create({
    trigger: card,

    containerAnimation: horizontalScroll,

    start: "left 80%",

    once: true,

    onEnter: () => animateSkill(card),
  });
});

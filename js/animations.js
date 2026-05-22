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
gsap.utils.toArray(".stat").forEach((stat) => {
  gsap.from(stat, {
    y: -120,
    rotation: gsap.utils.random(-8, 8),
    opacity: 0,
    duration: 1.4,
    ease: "power3.out",
    scrollTrigger: {
      trigger: stat,
      start: "top 85%",
      toggleActions: "restart none none none",
      once: false,
    },
  });
});

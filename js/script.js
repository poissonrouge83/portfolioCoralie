// gsap.registerPlugin(ScrollTrigger);

// // FADE-IN SECTIONS
// gsap.utils.toArray(".fade").forEach((section) => {
//   gsap.fromTo(
//     section,
//     { opacity: 0, y: 40 },
//     {
//       opacity: 1,
//       y: 0,
//       duration: 1,
//       ease: "power2.out",
//       scrollTrigger: {
//         trigger: section,
//         start: "top 80%",
//       },
//     },
//   );
// });
//
//
//
//
//
//
//
//
// // SCROLL TO TOP
// const scrollTopBtn = document.getElementById("scrollTop");

// scrollTopBtn.onclick = () => {
//   window.scrollTo({
//     top: 0,
//     behavior: "smooth",
//   });
// };
// //
// //
// //
// //
// //
// //
// //
// //
// // STICKY NAVBAR + ACTIVE LINK
// const header = document.querySelector(".header");
// const navbarLinks = document.querySelectorAll(".navbar a");

// window.addEventListener("scroll", () => {
//   if (window.scrollY > 50) header.classList.add("sticky");
//   else header.classList.remove("sticky");

//   const sections = document.querySelectorAll("section");
//   sections.forEach((sec) => {
//     const top = window.scrollY;
//     const offset = sec.offsetTop - 200;
//     const height = sec.offsetHeight;

//     if (top >= offset && top < offset + height) {
//       const id = sec.getAttribute("id");
//       navbarLinks.forEach((link) => {
//         link.classList.remove("active");
//         if (link.getAttribute("href") === "#" + id)
//           link.classList.add("active");
//       });
//     }
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
//     start: "top 80%",
//     once: true,
//     onEnter: () => animateSkill(card),
//   });
// });
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
// //////////////           GSAP ANIM DOUBLE          /////////////
// ////////////////////////////////////////////////////////////////
// ////////////////////////////////////////////////////////////////
// gsap
//   .timeline({
//     scrollTrigger: {
//       trigger: ".trigger",
//       scrub: 0.5,
//       pin: true,
//       pinSpacing: true,

//       start: "top top",
//       end: "+=150%",
//     },
//   })

//   .to(".box", {
//     force3D: true, // Active le rendu 3D pour de meilleures performances
//     duration: 1, // Durée de l'animation
//     xPercent: 100, // Déplace les éléments de 100% horizontalement
//     ease: "power1.inOut", // Fonction d'accélération de l'animation
//     stagger: { amount: 1 }, // Délai entre les éléments animés (s'ils sont multiples)
//   })

//   .to(
//     ".box",
//     {
//       ease: "power1.out",
//       duration: 1,
//       rotation: "45deg",
//     },
//     0,
//   )

//   .to(
//     ".box",
//     {
//       ease: "power1.in",
//       duration: 1,
//       rotation: "0deg",
//     },
//     1,
//   );
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
//
//
//
//
//
//
// //CANVAS BACKGROUND
// //
// const canvas = document.getElementById("liquid-canvas");

// const scene = new THREE.Scene();

// const camera = new THREE.PerspectiveCamera(
//   45,
//   window.innerWidth / window.innerHeight,
//   0.1,
//   1000,
// );

// camera.position.z = 35;

// const renderer = new THREE.WebGLRenderer({
//   canvas: canvas,
//   alpha: true,
//   antialias: true,
// });

// renderer.setSize(window.innerWidth, window.innerHeight);
// // renderer.setPixelRatio(window.devicePixelRatio);
// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// const light = new THREE.AmbientLight(0xffffff, 1);
// scene.add(light);

// const blobs = [];

// const colors = [
//   getComputedStyle(document.documentElement).getPropertyValue("--blob1"),
//   getComputedStyle(document.documentElement).getPropertyValue("--blob2"),
//   getComputedStyle(document.documentElement).getPropertyValue("--blob3"),
// ];

// // création des blobs
// for (let i = 0; i < 6; i++) {
//   const geometry = new THREE.SphereGeometry(4 + Math.random() * 2, 64, 64);

//   const material = new THREE.MeshStandardMaterial({
//     color: colors[i % 3],
//     roughness: 0.4,
//     metalness: 0.3,
//     transparent: true,
//     opacity: 0.85,
//   });

//   const mesh = new THREE.Mesh(geometry, material);

//   mesh.position.x = (Math.random() - 0.5) * 30;
//   mesh.position.y = (Math.random() - 0.5) * 20;
//   mesh.position.z = (Math.random() - 0.5) * 10;

//   // vitesse personnalisée
//   mesh.userData.vx = (Math.random() - 0.5) * 0.1;
//   mesh.userData.vy = (Math.random() - 0.5) * 0.1;

//   scene.add(mesh);
//   blobs.push(mesh);
// }

// let mouseTargetX = 0;
// let mouseTargetY = 0;

// let mouseX = 0;
// let mouseY = 0;

// // position souris
// document.addEventListener("mousemove", (e) => {
//   mouseTargetX = (e.clientX / window.innerWidth - 0.5) * 20;
//   mouseTargetY = (e.clientY / window.innerHeight - 0.5) * 12;
// });

// function animate() {
//   requestAnimationFrame(animate);

//   mouseX += (mouseTargetX - mouseX) * 0.05;
//   mouseY += (mouseTargetY - mouseY) * 0.05;

//   const time = Date.now() * 0.001;

//   blobs.forEach((blob, i) => {
//     // mouvement via vitesse
//     blob.position.x += blob.userData.vx;
//     blob.position.y += blob.userData.vy;

//     // mouvement organique
//     blob.position.x += Math.sin(time * 0.6 + i) * 0.02;
//     blob.position.y += Math.cos(time * 0.5 + i) * 0.02;

//     // attraction douce vers la souris
//     const dxMouse = mouseX - blob.position.x;
//     const dyMouse = mouseY - blob.position.y;

//     const influence = 0.00008;

//     blob.userData.vx += dxMouse * influence;
//     blob.userData.vy += dyMouse * influence;

//     // friction
//     blob.userData.vx *= 0.495;
//     blob.userData.vy *= 0.495;

//     // séparation entre blobs
//     blobs.forEach((other) => {
//       if (blob === other) return;

//       const dx = blob.position.x - other.position.x;
//       const dy = blob.position.y - other.position.y;

//       const dist = Math.sqrt(dx * dx + dy * dy);

//       const minDist = 6;

//       if (dist < minDist) {
//         const force = (minDist - dist) * 0.02;

//         blob.position.x += dx * force;
//         blob.position.y += dy * force;
//       }
//     });

//     // limites écran
//     const limitX = 18;
//     const limitY = 10;

//     if (blob.position.x > limitX) {
//       blob.position.x = limitX;
//       blob.userData.vx *= -1;
//     }

//     if (blob.position.x < -limitX) {
//       blob.position.x = -limitX;
//       blob.userData.vx *= -1;
//     }

//     if (blob.position.y > limitY) {
//       blob.position.y = limitY;
//       blob.userData.vy *= -1;
//     }

//     if (blob.position.y < -limitY) {
//       blob.position.y = -limitY;
//       blob.userData.vy *= -1;
//     }

//     blob.rotation.x += 0.002;
//     blob.rotation.y += 0.002;
//   });

//   renderer.render(scene, camera);
// }

// animate();

// // resize écran
// window.addEventListener("resize", () => {
//   camera.aspect = window.innerWidth / window.innerHeight;
//   camera.updateProjectionMatrix();

//   renderer.setSize(window.innerWidth, window.innerHeight);
// });

//
//
//
//
//
//
//
//
// ===============================
// // PHYSICS STATS
// // ===============================

// gsap.from(".stat", {
//   yPercent: -200,
//   // y: -120,
//   rotation: () => gsap.utils.random(-300, 300),
//   opacity: 0,
//   duration: 1.2,
//   ease: "bounce.out",
//   stagger: 0.25,

//   scrollTrigger: {
//     trigger: ".stats",
//     start: "top 80%",
//     toggleActions: "restart none none none",
//     once: false,
//   },
// });

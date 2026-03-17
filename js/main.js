// SCROLL TO TOP
const scrollTopBtn = document.getElementById("scrollTop");

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
});

const initBurgerMenu = () => {
  const toggleBurgerMenu = document.querySelector(".toggle-burger-menu");
  toggleBurgerMenu.addEventListener("click", () => {
    if (toggleBurgerMenu.getAttribute("aria-expanded") === "true") {
      toggleBurgerMenu.setAttribute("aria-expanded", "false");
      document.body.classList.remove("open-menu");
    } else {
      toggleBurgerMenu.setAttribute("aria-expanded", "true");
      document.body.classList.add("open-menu");
    }
  });
};

export default initBurgerMenu;

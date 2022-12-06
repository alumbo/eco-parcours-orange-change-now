import initBurgerMenu from "./burger-menu.js";
import initShareLinks from "./share-links.js";
import SectionNavigator from "./section-navigator.js";

const isDebug = window.location.search === "?debug";
initBurgerMenu();
initShareLinks();
new SectionNavigator();
if (isDebug) document.querySelector(".debug").classList.add("show");

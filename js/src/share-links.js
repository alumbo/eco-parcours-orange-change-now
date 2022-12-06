const initShareLinks = () => {
  Array.prototype.slice
    .call(document.querySelectorAll(".share-link"))
    .map((link) => {
      link.setAttribute(
        "href",
        `${link.getAttribute("href")}${encodeURIComponent(
          window.location.href
        )}`
      );
    });
  const shareClone = document.querySelector(".share").cloneNode(true);
  document.querySelector(".menu-content").prepend(shareClone);
};

export default initShareLinks;

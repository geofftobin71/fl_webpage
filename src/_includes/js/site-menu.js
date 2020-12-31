const site_menu = document.querySelector("#site-menu");
const header = document.querySelector("#header");

const site_menu_options = { rootMargin: "-70px 0px 0px 0px" };

const site_menu_observer = new IntersectionObserver((entries, site_menu_observer) => {
  entries.forEach(entry => {
    if(!entry.isIntersecting) {
      site_menu.classList.add("opaque");
      site_menu.classList.remove("link-lighter");
      // site_menu.classList.add("link-darker");
    }
    else {
      site_menu.classList.remove("opaque");
      site_menu.classList.add("link-lighter");
      // site_menu.classList.remove("link-darker");
    }
  });
}, site_menu_options);

site_menu_observer.observe(header);

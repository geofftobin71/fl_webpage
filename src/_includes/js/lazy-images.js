/* if ('loading' in HTMLImageElement.prototype) {
  // Native Lazy Loading
  const images = document.querySelectorAll('img[data-loading="lazy"]');
  images.forEach(img => {
    if(img.dataset.srcset) { img.srcset = img.dataset.srcset; }
    if(img.dataset.src) { img.src = img.dataset.src; }
  });
} else */ if('IntersectionObserver' in window) {
  // Intersection Observer
  const images = document.querySelectorAll('img[data-loading="lazy"]');
  const lazy_images_options = { root: null, threshold: 0, rootMargin: "0px 0px 500px 0px" };
  const lazy_images_observer = new IntersectionObserver((entries, lazy_images_observer) => {
    entries.forEach(entry => {
      if(!entry.isIntersecting) { return; }
      if(entry.target.dataset.srcset) { entry.target.srcset = entry.target.dataset.srcset; }
      if(entry.target.dataset.src) { entry.target.src = entry.target.dataset.src; }
      lazy_images_observer.unobserve(entry.target);
    });
  }, lazy_images_options);

  images.forEach(image => {
    lazy_images_observer.observe(image);
  });
} else {
  // Non-lazy Fallback
  const images = document.querySelectorAll('img[data-loading="lazy"]');
  images.forEach(img => {
    if(img.dataset.srcset) { img.srcset = img.dataset.srcset; }
    if(img.dataset.src) { img.src = img.dataset.src; }
  });
}

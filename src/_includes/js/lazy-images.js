if ('loading' in HTMLImageElement.prototype) {
  // Native Lazy Loading
  const images = document.querySelectorAll('img[loading="lazy"]');
  images.forEach(img => {
    if(img.dataset.srcset) { img.srcset = img.dataset.srcset; }
    if(img.dataset.src) { img.src = img.dataset.src; }
  });
} else if('IntersectionObserver' in window) {
  // Intersection Observer
  const images = document.querySelectorAll('img[loading="lazy"]');
  const options = { root: null, threshold: 0, rootMargin: "0px 0px 200px 0px" };
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if(!entry.isIntersecting) { return; }
      if(entry.target.dataset.srcset) { entry.target.srcset = entry.target.dataset.srcset; }
      if(entry.target.dataset.src) { entry.target.src = entry.target.dataset.src; }
      observer.unobserve(entry.target);
    });
  }, options);

  images.forEach(image => {
    observer.observe(image);
  });
} else {
  // Non-lazy Fallback
  const images = document.querySelectorAll('img[loading="lazy"]');
  images.forEach(img => {
    if(img.dataset.srcset) { img.srcset = img.dataset.srcset; }
    if(img.dataset.src) { img.src = img.dataset.src; }
  });
}

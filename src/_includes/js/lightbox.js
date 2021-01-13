function openLightbox(n) {
  const lightbox = document.querySelector('#lightbox');
  document.documentElement.setAttribute("data-modal-active", true);
  lightbox.style.display = "block";
  // document.getElementById("menu").style.display = "none";
  setTimeout(() => { showSlide(n); }, 10);
}

function closeLightbox() {
  const lightbox = document.querySelector('#lightbox');
  document.documentElement.setAttribute("data-modal-active", false);
  lightbox.style.display = "none";
  // document.getElementById("menu").style.display = "block";
}

function showSlide(n) {
  const scroller = document.querySelector('#lightbox .slider');
  const item = document.querySelector('#lightbox .slider-item');
  const itemWidth = item.clientWidth;
  while(scroller.scrollLeft != (n - 1) * itemWidth) {
    scroller.scrollTo({left: (n - 1) * itemWidth, top: 0, behavior:'auto'});
  }
  console.log(scroller.scrollLeft);
}

function scrollToNextItem() {
  const scroller = document.querySelector('#lightbox .slider');
  const item = document.querySelector('#lightbox .slider-item');
  const itemWidth = item.clientWidth;
  if(scroller.scrollLeft < (scroller.scrollWidth - itemWidth)) {
    scroller.scrollBy({left: itemWidth, top: 0, behavior:'smooth'});
  } else {
    scroller.scrollTo({left: 0, top: 0, behavior:'auto'});
  }
}

function scrollToPrevItem() {
  const scroller = document.querySelector('#lightbox .slider');
  const item = document.querySelector('#lightbox .slider-item');
  const itemWidth = item.clientWidth;
  if(scroller.scrollLeft != 0) {
    scroller.scrollBy({left: -itemWidth, top: 0, behavior:'smooth'});
  } else {
    scroller.scrollTo({left: scroller.scrollWidth, top: 0, behavior:'auto'});
  }
}

function openLightbox(id) {
  document.documentElement.setAttribute('data-modal-active', true);
  document.querySelector('#lightbox').style.visibility = 'visible';
  // document.querySelector('menu').style.display = 'none';

  document.querySelector(id).scrollIntoView({behavior: 'auto', inline: 'center', block: 'center'});

  /*
  let itemWidth = document.querySelector('#lightbox .slider-item').clientWidth;
  document.querySelector('#lightbox .slider').scrollTo({left: (n - 1) * itemWidth, top: 0, behavior:'auto'});
  */
}

function closeLightbox() {
  document.documentElement.setAttribute('data-modal-active', false);
  document.querySelector('#lightbox').style.visibility = 'hidden';
  // document.querySelector('menu').style.display = 'block';
}

function scrollToNextItem() {
  let scroller = document.querySelector('#lightbox .slider');
  let itemWidth = document.querySelector('#lightbox .slider-item').clientWidth;
  if(scroller.scrollLeft < (scroller.scrollWidth - itemWidth)) {
    scroller.scrollBy({left: itemWidth, top: 0, behavior:'smooth'});
  } else {
    scroller.scrollTo({left: 0, top: 0, behavior:'auto'});
  }
}

function scrollToPrevItem() {
  let scroller = document.querySelector('#lightbox .slider');
  let itemWidth = document.querySelector('#lightbox .slider-item').clientWidth;
  if(scroller.scrollLeft != 0) {
    scroller.scrollBy({left: -itemWidth, top: 0, behavior:'smooth'});
  } else {
    scroller.scrollTo({left: scroller.scrollWidth, top: 0, behavior:'auto'});
  }
}

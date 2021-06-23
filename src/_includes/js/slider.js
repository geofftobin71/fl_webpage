function handleLightboxKeys(event) {
    if(event.key === 'Escape') {
      closeLightbox();
    }

    if(event.keyCode === 37) {
      scrollToPrevItem('#lightbox');
    }

    if(event.keyCode === 39) {
      scrollToNextItem('#lightbox');
    }
}

function openLightbox(id) {
  document.documentElement.setAttribute('data-modal-active', true);
  document.querySelector('#lightbox').style.visibility = 'visible';
  document.querySelector(id).scrollIntoView({behavior: 'auto', inline: 'center', block: 'center'});
  window.addEventListener('keydown', handleLightboxKeys);
}

function scrollTo(id) {
  console.log(id);
  document.querySelector(id).scrollIntoView({behavior: 'smooth', inline: 'center', block: 'center'});
}

function closeLightbox() {
  document.documentElement.setAttribute('data-modal-active', false);
  document.querySelector('#lightbox').style.visibility = 'hidden';
  window.removeEventListener('keydown', handleLightboxKeys);
}

function scrollToNextItem(id) {
  let scroller = document.querySelector(id + ' .slider');
  let itemWidth = document.querySelector(id + ' .slider-item').clientWidth;
  if(scroller.scrollLeft < (scroller.scrollWidth - itemWidth)) {
    scroller.scrollBy({left: itemWidth, top: 0, behavior:'smooth'});
  } /* else {
    scroller.scrollTo({left: 0, top: 0, behavior:'auto'});
  } */
}

function scrollToPrevItem(id) {
  let scroller = document.querySelector(id + ' .slider');
  let itemWidth = document.querySelector(id + ' .slider-item').clientWidth;
  if(scroller.scrollLeft > 0) {
    scroller.scrollBy({left: -itemWidth, top: 0, behavior:'smooth'});
  } /* else {
    scroller.scrollTo({left: scroller.scrollWidth, top: 0, behavior:'auto'});
  } */
}

function toggleCaptions() {
  const captions = document.querySelectorAll('#lightbox figcaption');
  captions.forEach(caption => {
    caption.classList.toggle('hidden');
  });
}


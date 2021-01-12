const lightbox = document.querySelector('#lightbox');
const scroller = lightbox.querySelector('.hello');

function openLightbox() {
  document.documentElement.setAttribute("data-modal-active", true);
  document.getElementById("lightbox").style.display = "block";
  // document.getElementById("menu").style.display = "none";
}

function closeLightbox() {
  document.documentElement.setAttribute("data-modal-active", false);
  document.getElementById("lightbox").style.display = "none";
  // document.getElementById("menu").style.display = "block";
}

function showSlide(n) {
  /*
  var i;
  var slides = document.getElementsByClassName("lightbox__slide");
  if (n > slides.length) {n = 1}
  if (n < 1) {n = slides.length}
  for (i = 0; i < slides.length; i++) {
    slides[i].classList.remove("visible");
  }
  slides[n-1].classList.add("visible");
  */
  const itemWidth = lightbox.querySelector('.item').clientWidth;
  while(scroller.scrollLeft != (n - 1) * itemWidth) {
    scroller.scrollTo({left: (n - 1) * itemWidth, top: 0, behavior:'auto'});
  }
  console.log(scroller.scrollLeft);
}

function scrollToNextItem() {
  const itemWidth = lightbox.querySelector('.item').clientWidth;
  if(scroller.scrollLeft < (scroller.scrollWidth - itemWidth))
    // The scroll position is not at the beginning of last item
    scroller.scrollBy({left: itemWidth, top: 0, behavior:'smooth'});
  else
    // Last item reached. Go back to first item by setting scroll position to 0
    scroller.scrollTo({left: 0, top: 0, behavior:'auto'});
}
function scrollToPrevItem() {
  const itemWidth = lightbox.querySelector('.item').clientWidth;
  if(scroller.scrollLeft != 0)
    // The scroll position is not at the beginning of first item
    scroller.scrollBy({left: -itemWidth, top: 0, behavior:'smooth'});
  else
    // This is the first item. Go to last item by setting scroll position to scroller width
    scroller.scrollTo({left: scroller.scrollWidth, top: 0, behavior:'auto'});
}

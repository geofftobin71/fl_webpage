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
  var i;
  var slides = document.getElementsByClassName("lightbox__slide");
  if (n > slides.length) {n = 1}
  if (n < 1) {n = slides.length}
  for (i = 0; i < slides.length; i++) {
    slides[i].classList.remove("visible");
  }
  slides[n-1].classList.add("visible");
}

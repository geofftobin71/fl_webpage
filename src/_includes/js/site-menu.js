var prevScrollpos = window.pageYOffset;
window.onscroll = function() {
  var currentScrollPos = window.pageYOffset;
  if (prevScrollpos >= currentScrollPos) {
    document.getElementById("site-menu").style.top = "0";
  } else {
    document.getElementById("site-menu").style.top = "-3rem";
  }
  prevScrollpos = currentScrollPos > 0 ? currentScrollPos : 0;
}

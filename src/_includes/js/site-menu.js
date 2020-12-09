var prevScrollPos = window.pageYOffset;
window.onscroll = function() {
  var currentScrollPos = window.pageYOffset;
  if (prevScrollPos >= currentScrollPos) {
    document.getElementById("site-menu").style.top = "0";
  } else {
    document.getElementById("site-menu").style.top = "-8rem";
  }
  prevScrollPos = currentScrollPos > 0 ? currentScrollPos : 0;
}

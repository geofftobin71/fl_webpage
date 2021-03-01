function toggleMenu(checkbox) {
  let checked = checkbox.checked;

  document.documentElement.setAttribute("data-modal-active", checked);

  return false;
}

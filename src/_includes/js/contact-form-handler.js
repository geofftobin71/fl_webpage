document.addEventListener("DOMContentLoaded",function(){contactFormHandler();},false);

function contactFormHandler() {

  const contact_form = document.getElementById("contact-form");
  const email_input = contact_form.querySelector("#email");
  const recaptcha_site_key = document.getElementById("recaptcha-site-key");

  contact_form.addEventListener("submit", event => {

    event.preventDefault();

    document.getElementById("submit-button").disabled = true;

    const inputs = contact_form.querySelectorAll("input,textarea");
    for(let i = 0; i < inputs.length; i++) {
      if(window.getComputedStyle(inputs[i]).display !== "none") {
        if(inputs[i].value.trim().length === 0) {
          showError(inputs[i].dataset.error || "Error");
          document.getElementById("submit-button").disabled = false;
          return false;
        }
      }
    };

    grecaptcha.ready(function() {
      grecaptcha.execute(recaptcha_site_key.value, {action: "contactform"}).then(function(token) {
        document.getElementById("gRecaptchaResponse").value = token;
        contact_form.submit();
      });
    });
  },false);

  document.getElementById("submit-button").disabled = false;
}

function showError(message) {
  const error_msg = document.getElementById('error-msg');
  if(error_msg) {
    error_msg.innerText = message;
    error_msg.style.visibility = "visible";
  }

  const info = document.getElementById("info");
  if(info) { info.style.display = "none"; }
}

function hideError() {
  const error_msg = document.getElementById('error-msg');
  if(error_msg) {
    error_msg.style.visibility = "hidden";
  }
}

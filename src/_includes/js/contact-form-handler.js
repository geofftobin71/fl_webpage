document.addEventListener("DOMContentLoaded",function(){contactFormHandler();},false);

function contactFormHandler() {

  const contact_form = document.getElementById("contact-form");
  const email_input = contact_form.querySelector("#email");
  const recaptcha_site_key = document.getElementById("recaptcha-site-key");

  contact_form.addEventListener("submit", event => {

    event.preventDefault();

    disableContactForm();

    const inputs = contact_form.querySelectorAll("input,textarea");
    for(let i = 0; i < inputs.length; i++) {
      if(window.getComputedStyle(inputs[i]).display !== "none") {
        if(inputs[i].value.trim().length === 0) {
          showError(inputs[i].dataset.error || "Error");
          enableContactForm();
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

  enableContactForm();
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

function enableContactForm() {
  document.getElementById("submit-button").disabled = false;
  document.getElementById("spinner-icon").style.display = "none";
  document.getElementById("email-icon").style.display = "inline-block";
  document.getElementById("submit-text").innerText = "Send";
}

function disableContactForm() {
  document.getElementById("submit-button").disabled = true;
  document.getElementById("spinner-icon").style.display = "inline-block";
  document.getElementById("email-icon").style.display = "none";
  document.getElementById("submit-text").innerText = "Sending";
}


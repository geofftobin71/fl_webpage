const contact_form = document.getElementById("contact-form");
const name_input = document.getElementById("name-input");
const email_input = document.getElementById("email-input");
const message_input = document.getElementById("message-input");
const recaptcha_site_key = document.getElementById("recaptcha-site-key");

var response_message = document.getElementById("response-message");

name_input.addEventListener("focus", event => {
  response_message.textContent = " ";
});

email_input.addEventListener("focus", event => {
  response_message.textContent = " ";
});

message_input.addEventListener("focus", event => {
  response_message.textContent = " ";
});

contact_form.addEventListener("submit", event => {

  event.preventDefault();

  if(name_input.value == "") { response_message.textContent = "Please enter your Name"; return; }
  if(email_input.value == "") { response_message.textContent = "Please enter your Email Address"; return; }
  if(!(/\S+@\S+\.\S+/.test(email_input.value))) { response_message.textContent = "Please enter a valid Email Address"; return; }
  if(message_input.value == "") { response_message.textContent = "Please enter a Message"; return; }

  response_message.textContent = " ";

  grecaptcha.ready(function() {
    grecaptcha.execute(recaptcha_site_key.value, {action: "contactform"}).then(function(token) {
      document.getElementById("gRecaptchaResponse").value = token;
      contact_form.submit();
    });
  });
});

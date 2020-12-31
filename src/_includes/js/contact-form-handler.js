const contact_form = document.getElementById("contact-form");
const name_input = document.getElementById("name-input");
const email_input = document.getElementById("email-input");
const message_input = document.getElementById("message-input");

const name = name_input.value;
const email_address = email_input.value;
const message = message_input.value;

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

name_input.addEventListener("blur", event => {
  if(name == "") { response_message.textContent = "Please enter your Name"; }
});

email_input.addEventListener("blur", event => {
  if(email_address == "") { response_message.textContent = "Please enter your Email Address"; }
  else if(!(/\S+@\S+\.\S+/.test(email_address))) { response_message.textContent = "Please enter a valid Email Address"; }
});

message_input.addEventListener("blur", event => {
  if(message == "") { response_message.textContent = "Please enter a Message"; }
});

contact_form.addEventListener("submit", event => {

  event.preventDefault();

  if(name == "") { response_message.textContent = "Please enter your Name"; return; }
  if(email_address == "") { response_message.textContent = "Please enter your Email Address"; return; }
  if(!(/\S+@\S+\.\S+/.test(email_address))) { response_message.textContent = "Please enter a valid Email Address"; return; }
  if(message == "") { response_message.textContent = "Please enter a Message"; return; }

  response_message.textContent = " ";

  grecaptcha.ready(function() {
    grecaptcha.execute("6LeI5xoaAAAAAIWX0byiYYLlvUeTxEiOao452xbl", {action: "contactform"}).then(function(token) {
      document.getElementById("gRecaptchaResponse").value = token;
      contact_form.submit();
    });
  });
});

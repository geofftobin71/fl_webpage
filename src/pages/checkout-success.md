---
title: Checkout Success
layout: layouts/base.njk
header_image: "/site/floriade-dried-flower-room-00001.jpg"
sitemap:
  ignore: true
---
<pre id="session"></pre>
<pre id="items"></pre>
<script>
document.addEventListener("DOMContentLoaded",function(){
    var urlParams = new URLSearchParams(window.location.search);
    var session_id = urlParams.get('session_id');
    var payment_intent_id;

    if(session_id) {
    fetch('/php/get-checkout-session.php?session_id=' + session_id)
    .then(function (result) {
        return result.json();
        })
    .then(function (session) {
        var sessionJSON = JSON.stringify(session, null, 2);
        document.querySelector('#session').textContent = sessionJSON;
        })
    .catch(function (err) {
        console.log('Error when fetching Checkout session', err);
        });
    };

    if(session_id) {
    fetch('/php/get-checkout-items.php?session_id=' + session_id)
      .then(function (result) {
          return result.json();
          })
    .then(function (session) {
        var sessionJSON = JSON.stringify(session, null, 2);
        document.querySelector('#items').textContent = sessionJSON;
        })
    .catch(function (err) {
        console.log('Error when fetching Checkout session', err);
        });
    };

});
</script>

---
title: FAQ
header:
  title: Frequently Asked Questions
  image: fresh-flowers/fresh-flowers-by-floriade-00029
layout: layouts/faq.njk
eleventyNavigation:
  key: FAQ
  order: 50
---

<section class="wrapper">
  <ul class="faq stack center" style="--stack-space:var(--step-2)">
    {% for item in faq -%}
        <li class="round-box color-light border-shade2 bg-shade1 text-center wrapper text-wrapper shadow">
            <input id="faq_{{ loop.index }}" type="checkbox" class="visually-hidden">
            <h3 class="heading"><label for="faq_{{ loop.index }}">{{ item.question }}</label></h3>
            <p>{{ item.answer }}</p>
        </li>
      {% endfor -%}
  </ul>
</section>

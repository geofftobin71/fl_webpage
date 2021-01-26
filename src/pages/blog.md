---
layout: layouts/page.njk
title: Blog
description: Floriade Blog
header:
  title: Floriade Blog
  image: "/fresh-flowers/fresh-flowers-by-floriade-00051"
eleventyNavigation:
  order: 56
  key: Blog
---

<section class="wrapper">
  <ul class="stack center">
  {% for post in collections.blog -%}
  <li><a href="{{ post.url }}">{{ post.data.title }}</a> <i>{{ post.date | readableDate }}</i></li>
  {% endfor -%}
  </ul>
</section>

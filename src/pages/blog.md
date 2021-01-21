---
layout: layouts/page.njk
eleventyNavigation:
  order: 55
  key: Blog
  parent: ''
title: Blog
description: Floriade blog.
header:
  image: "/fresh-flowers/fresh-flowers-by-floriade-00051"
pagination:
  data: collections.blog
  size: 5
  alias: posts
---

<section class="wrapper">
  <ul class="stack center">
  {% for post in posts -%}
  <li><a href="{{ post.url }}">{{ post.data.title }}</a> <i>{{ post.date | readableDate }}</i></li>
  {% endfor -%}
  </ul>
  <nav style="display:flex;justify-content:space-between">
  {% if pagination.href.previous %}
  <a href="{{ pagination.href.previous }}">Previous</a>
  {% else %}
  Previous
  {% endif %}
  {% if pagination.href.next %}
  <a href="{{ pagination.href.next }}">Next</a>
  {% else %}
  Next
  {% endif %}
  </nav>
</section>

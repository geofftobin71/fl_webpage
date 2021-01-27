---
layout: layouts/page.njk
title: Blog
description: Floriade Blog
header_image: "/fresh-flowers/fresh-flowers-by-floriade-00051"
header:
  title: Floriade Blog
eleventyNavigation:
  order: 56
  key: Blog
---

<section>
<div class="wrapper">
<ul class="stack" style="--stack-space:var(--step-5)">
{% for post in collections.blog -%}
<li class="link-lighter">
<a href="{{ post.url | url }}">
<div>
<figure class="background" style="--brightness:{{ header.brightness or '50' }}%">
{% set image_id = (post.data.header_image | stripVersion) or (site.header_image | stripVersion) %}
{% set lqip_path = site.cloudinary_url + "/w_192,h_30,c_fill,q_auto,f_jpg,g_auto:subject,e_blur:200/" + image_id %}
<img src="{{ site.cloudinary_url }}/w_2048,h_320,c_fill,q_auto,f_auto,g_auto:subject/{{ image_id }}" style="background-image:url({{ lqip_path | lqip }})" alt="{{ post.data.header.alt or page_alt or site.alt }}" loading="lazy" decoding="async" />
</figure>
<h2 class="text-right text-lowercase">{{ post.data.title | safe }}</h2>
</div>
{#
<figure>
<div class="frame frame3x1 round shadow">
<div>
<img class="img-cover" src="{{ site.cloudinary_url }}{{ post.data.header_image }}" width="300" height="300" alt="{{ post.data.header.alt or page_alt or site.alt }}" loading="lazy" decoding="async" />
</div>
</div>
<figcaption class="md">{{ post.date | readableDate }}</figcaption>
</figure>
#}
<article class="wrapper text-wrapper">
<p>{{ post.data.description | safe }}</p>
</article>
</a>
</li>
{% endfor -%}
</ul>
</div>
</section>

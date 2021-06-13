---
layout: layouts/shop-categories.njk
pagination:
  data: valid_shop_categories
  size: 1
  alias: category
  addAllPagesToCollections: true
permalink: "shop/categories/{{ category.name | slug }}/index.html"
eleventyComputed:
  title: "{{ category.name }}"
  description: "{{ category.description }}"
  header_image: "{{ category.image }}"
  header_brightness: "{{ category.brightness }}"
  eleventyNavigation:
    key: "{{ category.eleventyNavigation.key }}"
    parent: "{{ category.eleventyNavigation.parent }}"
    order: "{{ category.eleventyNavigation.order }}"
---

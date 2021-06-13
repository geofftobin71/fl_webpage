---
layout: layouts/shop-products.njk
pagination:
  data: valid_shop_products
  size: 1
  alias: product
permalink: "shop/products/{{ product.name | slug }}/index.html"
eleventyComputed:
  title: "{{ product.name }}"
  description: "{{ product.description }}"
  header_image: "{{ product.images[0] }}"
  header_brightness: "{{ product.brightness }}"
---

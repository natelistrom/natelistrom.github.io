---
layout: default
title:  All notes
image:  /assets/img/natelistrom-logo-144.png
---

<h1 class="title">{{page.title}}</h1>
<span class="meta">Rss: <code>feed://natelistrom.com/feed.xml</code></span>

<div class="multicolumn">
  <div class="sidebar">
    <h2>Topics</h2>
    <span class="categories">
      <ul>
      {% assign sorted_tags = site.tags | sort %}
      {% for tag in sorted_tags %}
        <li><a href="/tag/{{ tag[0] | url_encode | downcase }}.html" class="category">{{ tag[0] }} <span class="count">{{ tag[1] | size }}</span></a></li>   
      {% endfor %}
      </ul>
    </span>
  </div>

  <div class="main">
  {% for post in site.posts %}
    {% include _postList.html %}
  {% endfor %}
  </div>

</div>

{% include _subscribe.html %}
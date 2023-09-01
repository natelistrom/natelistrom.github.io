---
layout: default
title:  All notes
image:  /assets/img/natelistrom-logo-144.png
---

<h1 class="title">{{page.title}}</h1>
<span class="meta">Rss: <code>feed://natelistrom.com/feed.xml</code></span>

---

<!-- Latest posts -->
  {% assign posts = site.posts %}

  {%- if posts.size > 0 -%}
    <div class="post-list">
      <ul class="post-list">
        {%- for post in posts -%}
          {% include _postList.html %}
        {%- endfor -%}
      </ul>
    </div>
  {%- endif -%}

{% include _subscribe.html %}
---
permalink: /blog/
title: "Blog"
layout: single
author_profile: true
---

Stay up to date with my latest articles, including in-depth write-ups published on this site as well as posts syndicated from my Dev.to, Medium, and Substack blogs.

{% assign local_posts = site.posts | sort: 'date' | reverse %}
{% if local_posts.size > 0 %}

### Latest posts on this site

<ul class="posts-list">
  {% for post in local_posts %}
  <li>
    <span class="post-meta">{{ post.date | date: "%B %d, %Y" }}</span>
    <h3><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h3>
    {% if post.excerpt %}
    <p>{{ post.excerpt | strip_html | truncate: 200 }}</p>
    {% endif %}
  </li>
  {% endfor %}
</ul>
{% else %}
> _I have not published any on-site posts yet. Check back soon!_
{% endif %}

{% assign external = site.data.external_posts %}
{% if external %}
{% assign devto_posts = external.devto | default: empty %}
{% assign medium_posts = external.medium | default: empty %}
{% assign substack_posts = external.substack | default: empty %}
{% if devto_posts.size > 0 %}

### Featured from Dev.to

<ul class="posts-list">
  {% for article in devto_posts %}
  <li>
    <span class="post-meta">{{ article.published_at | date: "%B %d, %Y" }}</span>
    <h3><a href="{{ article.url }}" target="_blank" rel="noopener noreferrer">{{ article.title }}</a></h3>
    {% if article.description %}
    <p>{{ article.description | truncate: 200 }}</p>
    {% endif %}
  </li>
  {% endfor %}
</ul>
  {% endif %}

{% if medium_posts.size > 0 %}

### Featured from Medium

<ul class="posts-list">
  {% for article in medium_posts %}
  <li>
    <span class="post-meta">{{ article.published_at | date: "%B %d, %Y" }}</span>
    <h3><a href="{{ article.url }}" target="_blank" rel="noopener noreferrer">{{ article.title }}</a></h3>
    {% if article.description %}
    <p>{{ article.description | truncate: 200 }}</p>
    {% endif %}
  </li>
  {% endfor %}
</ul>
  {% endif %}

{% if substack_posts.size > 0 %}

### Featured from Substack

<ul class="posts-list">
  {% for article in substack_posts %}
  <li>
    <span class="post-meta">{{ article.published_at | date: "%B %d, %Y" }}</span>
    <h3><a href="{{ article.url }}" target="_blank" rel="noopener noreferrer">{{ article.title }}</a></h3>
    {% if article.description %}
    <p>{{ article.description | truncate: 200 }}</p>
    {% endif %}
  </li>
  {% endfor %}
</ul>
  {% endif %}

{% if external.generated_at %}
<small class="last-updated">Last synced on {{ external.generated_at | date: "%B %d, %Y" }}.</small>
{% endif %}
{% else %}

> _External feeds have not been synced yet. Run `npm run sync:external-posts` to populate them._
> {% endif %}

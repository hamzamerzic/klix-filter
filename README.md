# Klix Filter

Klix.ba reader for Mobius with in-app articles, infinite scroll, and saved keyword filters.

Install in Mobius with this manifest URL:

```text
https://raw.githubusercontent.com/hamzamerzic/klix-filter/main/mobius.json
```

The app fetches Klix pages through the Mobius `/api/proxy` endpoint so it can parse feed and article pages without browser CORS failures. It is otherwise a single client-side `index.jsx` mini-app.

## Notes

- Feed thumbnails stay stable while article pages can use larger hero images.
- Duplicate feed entries retain ranking-page order while borrowing richer thumbnails from category pages; blocked image hosts retry through the authenticated Möbius proxy.
- Article parsing supports galleries, Klix video embeds, and YouTube links converted through Klix's player.
- Unsupported media shapes are recorded for later parser improvements.

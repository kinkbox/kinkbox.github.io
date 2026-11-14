# Kinklist

Vite + React + TypeScript + shadcn/ui rewrite of the classic kink rating checklist. Ratings sync to the URL hash; lists load from `/classic.txt`, `/detailed.txt`, and `/plsno.txt`.

## Develop

```bash
npm install
npm run dev
```

## Build / deploy

```bash
npm run build          # output in dist/
npm run preview        # preview production build
npm run deploy         # build + publish dist/ to gh-pages
```

GitHub Pages: publish the `dist` folder (user/org site with `base: '/'`).

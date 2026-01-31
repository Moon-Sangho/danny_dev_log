# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Next.js + Tailwind CSS blogging platform** called "Danny's Dev-log" - a Korean tech blog built on the Tailwind Nextjs Starter Blog template. It features:
- Markdown/MDX blog post management via Contentlayer
- Server-side syntax highlighting with Rehype plugins
- Full-text search with Kbar
- Light/dark theme support
- Multiple post layout options
- Tag-based organization
- Analytics (Umami) and newsletter integration (Buttondown)

**Language**: Korean (ko)
**Production URL**: https://dannydevlog.vercel.app

## Common Development Commands

```bash
# Install dependencies
yarn

# Development server (hot reload on localhost:3000)
yarn dev

# Production build
yarn build

# Serve production build locally
yarn serve

# Lint with ESLint (--fix applies auto-fixes)
yarn lint

# Bundle size analysis
yarn analyze
```

## Content Management

- **Blog posts**: Create `.mdx` files in `data/blog/` with required frontmatter
- **Authors**: Define author profiles in `data/authors/` (default.md is required)
- **Projects**: Edit `data/projectsData.ts` for the projects page
- **Site config**: `data/siteMetadata.js` contains all global settings

### Blog Post Frontmatter

```yaml
---
title: 'Post Title'
date: '2024-01-15'
tags: ['next-js', 'tailwind']  # optional
lastmod: '2024-01-20'           # optional
draft: false                    # optional, defaults to false
summary: 'Brief description'    # optional
images: ['/static/images/img.jpg']  # optional
authors: ['default']            # optional, defaults to 'default'
layout: PostLayout              # optional post layout (PostLayout, PostSimple, PostBanner)
canonicalUrl: 'https://...'     # optional SEO canonical URL
---
```

See `contentlayer.config.ts` for the complete schema definition.

## Architecture & Key Systems

### Content Pipeline: MDX → HTML

1. **Contentlayer** (`contentlayer.config.ts`) scans `data/blog/**/*.mdx` and `data/authors/**/*.mdx`
2. **Remark plugins** (frontmatter extraction, GFM, code titles, math, alerts) transform markdown
3. **Rehype plugins** (syntax highlighting, KaTeX, citations, slug generation) transform HTML
4. **Computed fields** generate: `slug`, `path`, `readingTime`, `toc`, `structuredData`
5. Build hook (`onSuccess`) generates tag counts → `app/tag-data.json` and search index

**Key insight**: All content is static-generated at build time. The tag count and search index are generated during build, not at runtime.

### Routing Architecture (Next.js App Router)

```
app/
├── page.tsx              # Home page
├── layout.tsx            # Root layout (metadata, providers, global styles)
├── blog/
│   ├── page.tsx          # Blog listing with pagination
│   ├── [page]/page.tsx   # Paginated blog list (/blog/page/2)
│   └── [...slug]/page.tsx # Individual post (/blog/post-title)
├── tags/
│   ├── page.tsx          # All tags directory
│   ├── [tag]/page.tsx    # Posts for a specific tag
│   └── [tag]/page/[page]/page.tsx # Paginated tagged posts
├── projects/page.tsx     # Projects showcase
├── api/newsletter/route.ts # Newsletter subscription endpoint
└── (metadata files)      # sitemap.ts, robots.ts, seo.tsx
```

**Dynamic routes resolve content** by reading from Contentlayer's generated types (`contentlayer/generated`).

### Layout System (5 Templates)

- **PostLayout** (default): 2-column with sidebar meta/author info
- **PostSimple**: Simplified version without sidebar
- **PostBanner**: Features banner image at top
- **ListLayout**: Blog list with search bar (v1 style)
- **ListLayoutWithTags**: Blog list with tag sidebar (current default)

Component locations: `layouts/` (post layouts), `components/` (reusable UI)

### Code Organization

```
components/     # Reusable React components
├── Header.tsx, Footer.tsx    # Main layout components
├── MDXComponents.tsx         # Custom components passed to MDX (Link, Image, Table, TOC, etc.)
├── Link.tsx, Image.tsx       # Wrappers around next/* with custom behavior
├── Tag.tsx, Card.tsx         # Content-specific components
└── ...

layouts/        # Post and list layout templates
├── PostLayout.tsx, PostSimple.tsx, PostBanner.tsx
└── ListLayout.tsx, ListLayoutWithTags.tsx

data/           # Content and configuration
├── blog/        # MDX blog posts (auto-discovered by Contentlayer)
├── authors/     # Author profiles in MDX format
├── siteMetadata.js # Global site config (URLs, analytics, search, etc.)
├── projectsData.ts
└── headerNavLinks.ts

app/            # Next.js App Router pages
├── page.tsx    # Home page typically imports Main.tsx
└── Main.tsx    # Reusable home page content component

css/            # Global styles
├── tailwind.css # Tailwind imports
└── prism.css    # Code block syntax highlighting

public/static/  # Images, favicons, etc.
```

## Configuration

### Global Settings (`data/siteMetadata.js`)

All runtime-configurable settings live here:
- `title`, `author`, `description`, `siteUrl`, `siteRepo`
- `analytics.umamiAnalytics` - Umami tracking config
- `newsletter.provider` - Newsletter service (currently: buttondown)
- `search.provider` - Search implementation (currently: kbar)
- Theme, locale, navbar behavior

Changes to this file don't require rebuild, but blog metadata does.

### Next.js Configuration (`next.config.js`)

- **Contentlayer integration** via `withContentlayer` plugin
- **Bundle analyzer** via `withBundleAnalyzer` (enable with `ANALYZE=true`)
- **Security headers**: CSP, HSTS, X-Frame-Options, etc.
- **Image optimization**: Remote pattern for `picsum.photos`
- **SVG support**: SVGs imported as React components via `@svgr/webpack`
- **CSS optimization**: Tailwind 4.0 with PostCSS

### TypeScript Configuration (`tsconfig.json`)

- **Paths**: `@/components/*`, `@/data/*`, `@/layouts/*`, `@/css/*` for clean imports
- **Strict mode**: Enabled (`strictNullChecks: true`, `strict: false` overall for flexibility)
- **Incremental compilation**: Yes
- **JSON support**: Can import `.json` directly

### ESLint & Prettier (`eslint.config.mjs`)

- **Parser**: TypeScript ESLint
- **Extends**: Next.js recommended, Prettier, JSX a11y
- **Key rules**:
  - Prettier formatting enforced
  - React in JSX scope disabled (React 19+)
  - Anchor-is-valid allows Next Link component
  - @typescript-eslint/no-unused-vars disabled (TS handles this)

**Running**: `yarn lint --fix` runs ESLint + Prettier across `/pages`, `/app`, `/components`, `/lib`, `/layouts`, `/scripts`.

## Development Workflow

### Adding a Blog Post

1. Create `data/blog/YYYY-MM-DD-post-title.mdx` (or nested folder: `data/blog/category/post-title.mdx`)
2. Add frontmatter with `title`, `date`, and optional fields
3. Write MDX content (Markdown + JSX)
4. Run `yarn dev` - post auto-renders at `/blog/post-title`
5. For drafts: set `draft: true` to hide from listings (still visible in dev)

**Markdown features**:
- GitHub Flavored Markdown (GFM) via remark-gfm
- Math blocks `$$..$$` via rehype-katex
- Code blocks with language syntax highlighting
- GitHub alerts (> [!NOTE], > [!WARNING], etc.)
- Custom MDX components (Image, Link, Table, TOC, etc.)

### Modifying Site Appearance

- **Color theme**: Edit `tailwind.config.js` (Tailwind 4.0 primary color attribute)
- **Typography**: Edit `css/tailwind.css` and `css/prism.css`
- **Component styling**: Edit `components/` directly (Tailwind classes + custom CSS)
- **Layout templates**: Edit files in `layouts/` (post content gets passed as `children`)

### Adding Features

1. **Search**: kbar is configured in `siteMetadata.js` and powered by static JSON index at `public/search.json` (generated at build time)
2. **Comments**: Giscus is commented out in `siteMetadata.js` - uncomment and set env vars to enable
3. **Analytics**: Umami env var: `NEXT_UMAMI_ID` (set in `.env.local`)
4. **Newsletter**: Buttondown endpoint configured, form component in `components/Newsletter.tsx`

## Build & Deployment

### Production Build

```bash
yarn build
```

- Runs Contentlayer to generate types and indices
- Runs postbuild script (generates tag counts and search index)
- Bundles Next.js app to `.next/`
- Validates TypeScript

### Static Export

For static hosting (GitHub Pages, S3, etc.):
```bash
EXPORT=1 UNOPTIMIZED=1 yarn build
```

Or with a base path:
```bash
EXPORT=1 UNOPTIMIZED=1 BASE_PATH=/myblog yarn build
```

Output: `out/` folder ready to deploy.

### Environment Variables

Create `.env.local`:
```
NEXT_UMAMI_ID=xxx           # Analytics tracking ID
# Buttondown newsletter (if configured)
BUTTONDOWN_API_KEY=xxx
```

### Deployment

Verified platforms:
- **Vercel**: Easiest - connects to repo, auto-deploys on push
- **Netlify**: Supports Next.js runtime (serverless functions for ISR, next/image, etc.)
- **Static hosting** (GitHub Pages, S3, Firebase): Use EXPORT=1 flag

## Important Quirks & Gotchas

1. **Incremental Static Regeneration (ISR)**: Not enabled - all content generated at build time. Changes require rebuild.
2. **Draft posts**: Hidden from production builds but visible in dev (check `isProduction` check in `contentlayer.config.ts`).
3. **Image optimization**: `next/image` is used but requires server runtime. For static export, disable image optimization via `UNOPTIMIZED=1`.
4. **Tag counts**: Generated at build time → `app/tag-data.json`. Manual tag edits don't auto-update without rebuild.
5. **Search index**: Also generated at build time → `public/search.json`. New posts won't appear in kbar search until rebuild.
6. **MDX components**: Must be default exports in `MDXComponents.tsx` to avoid [Next.js issues](https://github.com/vercel/next.js/issues/51593).
7. **Newsletter component**: Requires API route at `/api/newsletter/route.ts` to work - email is sent to provider backend.
8. **Comments**: Giscus is commented out but available - requires GitHub discussions setup and env vars.

## Performance Notes

- **First load JS**: ~85kB (lightweight)
- **Lighthouse**: Near-perfect score
- **Code splitting**: Next.js automatic per route
- **Font optimization**: `next/font` with Space Grotesk (swap display)
- **Image optimization**: Via `next/image` (disabled in static export)

## Testing & Quality Checks

- **Linting**: `yarn lint --fix` (ESLint + Prettier)
- **Type checking**: Built into `yarn build` (TypeScript)
- **Build validation**: Run `yarn build` before PR to catch errors

No unit tests or E2E tests currently configured. Add Jest/Vitest if needed.

## Key Dependencies

- **Framework**: Next.js 15.2, React 19, TypeScript 5.1
- **Content**: Contentlayer2, Pliny
- **MDX**: remark, rehype plugins (GFM, KaTeX, citations, syntax highlight, etc.)
- **UI**: Tailwind CSS 4.0, Headless UI, SVG as React components
- **Search**: Kbar
- **Theming**: next-themes
- **Analytics**: Umami (via Pliny)
- **Newsletter**: Buttondown (via Pliny)
- **Tooling**: ESLint 9, Prettier, Husky (pre-commit hooks)

See `package.json` for exact versions and `contentlayer.config.ts` for plugin configuration.

## Contributing / Git Workflow

- **Pre-commit hooks** (Husky): Runs `lint-staged` → ESLint + Prettier on staged files
- **Commit convention**: Follow existing style (recent commits use prefixes like `docs:`, `feat:`, etc.)
- **Branch strategy**: Main branch is production-ready

---

**Last updated**: January 2026
**Template version**: v2.4.0 (Tailwind Nextjs Starter Blog)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Cloudflare Pages

This project is configured for Cloudflare Pages with the framework preset set to
`None`.

Cloudflare Pages settings:

- Framework preset: `None`
- Build command: leave blank, or set to `npm run pages:build`
- Build output directory: `out`

The `out/` directory is committed so the current Cloudflare Pages project can
deploy even when the build command is blank.

Local Pages + D1 development:

```bash
npm run d1:migrate:local
npm run pages:dev
```

Deploy:

```bash
npm run d1:migrate:remote
npm run pages:deploy
```

After creating the remote D1 database, replace the placeholder `database_id` in
`wrangler.toml` with the real database ID.

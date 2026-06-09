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

Admin:

- `/admin`에서 카테고리 생성, YouTube/Spotify 음악 링크 추가, 음악 삭제를 할 수 있습니다.
- 관리자 데이터는 Cloudflare D1 `DB` 바인딩에 저장됩니다.
- 기본 음악 카테고리는 `수면`, `집중`, `명상`, `행운`, `우울`, `불안`입니다.
- `/admin` 보호는 Cloudflare Access에서 이메일 인증 정책으로 처리합니다.

Diary privacy:

- 감정일기와 사용자가 입력한 문장은 D1이나 서버 API에 저장하지 않습니다.
- `/diary`는 현재 브라우저의 `localStorage` key `simsimplay_diary_entries`만 읽습니다.
- 저장 구조는 `{ id, content, mood, analysis, recommendedMusic, createdAt }`입니다.
- 관리자 페이지에서는 사용자 감정일기 원문을 조회하지 않습니다.

Deploy:

```bash
npm run d1:migrate:remote
npm run pages:deploy
```

After creating the remote D1 database, replace the placeholder `database_id` in
`wrangler.toml` with the real database ID.

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

## Troubleshooting

### Neon Database `fetch failed` / `ETIMEDOUT` Error (Local Dev)
In local development, if you are located in a region with higher latency to the database server (e.g., Southeast Asia connecting to `us-east-1` Neon PostgreSQL), Node.js's default **Happy Eyeballs** DNS/network autoselection may time out (defaulting to a very short 250ms per IP attempt) and fail to connect, throwing a `TypeError: fetch failed` or `ETIMEDOUT` error.

To solve this, the `dev` script in `package.json` has been updated to run with `NODE_OPTIONS='--no-network-family-autoselection'`. This disables the 250ms connection autoselection timeout and allows standard TCP timeouts, letting the connection establish successfully.

If you run commands manually (e.g. Prisma migrations or seeding) and experience similar timeouts, prefix them with the same environment variable:
```bash
NODE_OPTIONS='--no-network-family-autoselection' npx prisma db push
```


This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

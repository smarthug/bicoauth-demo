# Biconomy Social Login ,Paymaster + WorldID

A problem with Biconomy Social Login is that a user (Farmer) can create multiple wallet addresses with Biconomy using different Social Logins (for example, Google Login, Facebook Login).

To prevent this, we can use WorldID to ensure one person has only one account.

After successfully verifying personhood with WorldApp, it responds with a nullifier_hash, which serves as the user's unique identifier.

With this nullifier_hash, we can check if the user has any other accounts.





<H1>BICONOMY SCW AUTHENTICATION DEMO</H1>

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).



## Getting Started

First, run the development server:

also check this, to set up .env

https://github.com/Rahat-ch/biconomy-sdk-social-gasless-starter

```bash
npm install 

>>

npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

<img width="1470" alt="Screenshot 2023-04-12 at 12 00 29 AM" src="https://user-images.githubusercontent.com/76511019/234111731-3a3296ce-b02a-4ea7-9c62-b8aec59c406d.png">


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.


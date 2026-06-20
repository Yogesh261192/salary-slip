# Deployment Guide

## Local Verification

```bash
npm install
npm run typecheck
npm run build
```

## Vercel

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add all variables from `.env.example`.
4. Ensure the Appwrite project allows your Vercel domain as a web platform.
5. Deploy.

## Appwrite Platform

Add these platforms:

- Localhost: `localhost`
- Production domain: your Vercel domain

## Production Security

- Keep `APPWRITE_API_KEY` server-only.
- Do not expose SMTP credentials.
- Use Appwrite document permissions with least privilege.
- Rotate API keys after testing.
- Keep `SESSION_COOKIE_NAME` stable between deployments.

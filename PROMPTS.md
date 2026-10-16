# SingaRate — Project Prompts & Conversation History

This document contains the prompt logs and development history for the **SingaRate** Singapore exchange rate and currency conversion application.

---

## Prompt 1: Initial Frontend Application Specification

### User Request
> 1. build a singapore-based exchange rate tool that provides real-time currency conversions for the SGD against global currencies.
> 2. build just front end for now. I will add the backend integration using MAS API keys later. Use a clean UI with search, favorites, and a simple calculator.

### Implementation Summary
- **Anchor Currency**: Singapore Dollar (`SGD` / `S$`).
- **MAS Standard Support**: Dual quotation view supporting standard (`1 SGD = X Foreign`) and official Monetary Authority of Singapore conventions (quoted per 100 foreign units for `JPY`, `MYR`, `IDR`, `THB`, `KRW`, `TWD`, `INR`, `PHP`, and `VND`).
- **Real-Time Data Feed**: Live interbank rates with fallback to Singapore daily fixing benchmark dataset and offline caching.
- **Singapore-Brunei Agreement**: Built-in 1:1 interchangeability rule for Brunei Dollar (`BND`).
- **Features Built**:
  - **Search & Region Filter**: Instant filter by currency code, country, or currency name across ASEAN, East Asia, Europe, Americas, Oceania, and South Asia/Middle East.
  - **Favorites**: Pinned watchlist saved to `localStorage` (defaulting to `MYR`, `USD`, `JPY`, `THB`, `EUR`, `GBP`, `AUD`).
  - **SGD Currency Calculator**: Two-way conversion with preset amounts and travel fee profile simulator (Interbank 0%, Travel Card 0.4%, Money Changer 1.1%, Credit Card 3.25%).
  - **Multi-Currency Batch Converter**: Instant view of what any SGD amount converts to across all pinned favorites.
  - **Travel Cheat Sheet**: Wallet matrix with printable/PDF view.
  - **MAS API Integration Modal**: Interactive configuration and documentation modal ready for backend keys.

---

## Prompt 2: Git Initialization & Remote Push

### User Request
> `git push https://<GITHUB_PAT>@https://github.com/KeziahVickraman/mas-exchanger.git`

### Implementation Summary
- Initialized local Git repository on branch `main`.
- Committed all project files and source code.
- Added remote origin `https://github.com/KeziahVickraman/mas-exchanger.git`.
- Pushed branch `main` to GitHub.
- Sanitized local Git configuration to ensure the personal access token is not retained in plaintext.

---

## Prompt 3: Serverless MAS API Integration

### User Request
> 1. add a serverless API connection that pulls live data from MAS API catalogue using the following endpoint:
> 
> ```http
> GET https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily?end_of_day=2026-10-14
> # KeyId: <MAS_KEY_ID>
> ```
> 
> 2. store this in `/api` folder at the project root level not the src folder
> 3. include a `/health.ts` and `/exchangerates.ts` within the same subfolder
> 4. do not hardcode any API key, I will manually include them

### Implementation Summary
- **Created `/api/exchangerates.ts`**:
  - Serverless function querying the MAS API catalogue endpoint:
    `https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610ora/exchange_rates_end_of_period_daily/views/exchange_rates_end_of_period_daily`
  - Sends `KeyId: <MAS_KEY_ID>` header.
  - Reads `process.env.MAS_KEY_ID` (and supports `KeyId` request headers) without hardcoding credentials.
  - Normalizes MAS daily fixing records into standard SGD rates and returns raw records.
  - Returns `401 Unauthorized` with setup guidance when `MAS_KEY_ID` is missing.
- **Created `/api/health.ts`**:
  - Health check endpoint returning service status and configuration diagnostics.
- **Configured `server.ts`**:
  - Full-stack Express server mounting `/api/health` and `/api/exchangerates` with Vite dev middleware.
- **Updated `.env.example`**:
  - Documented `MAS_KEY_ID` variable.
- **Updated Frontend Service & UI**:
  - Connected `exchangeRateService.ts` and `MasApiModal.tsx` to test and consume `/api/exchangerates`.
- **Git Commit & Push**:
  - Committed and pushed changes to `main` at `https://github.com/KeziahVickraman/mas-exchanger.git`.

---

## Prompt 4: Export Conversation History

### User Request
> export this chat as a .md file as PROMPTS.md

### Action
- Generated `PROMPTS.md` containing full prompt and implementation records.

---

## Prompt 5: "Talk to Us" Disqus Forum Embed

### User Request
> create a tab "talk to us" and embed a disqus forum using the following:
> 
> 1. Discussion Embed:
> ```tsx
> import { DiscussionEmbed } from 'disqus-react';
> 
> <DiscussionEmbed
>     shortname='mas-exchanger-1'
>     config={{
>         url: this.props.article.url,
>         identifier: this.props.article.id,
>         title: this.props.article.title,
>         language: 'en' 
>     }}
> />
> ```
> 
> 2. Comment Count:
> ```tsx
> import { CommentCount } from 'disqus-react';
> 
> <CommentCount
>     shortname='mas-exchanger-1'
>     config={{
>         url: this.props.article.url,
>         identifier: this.props.article.id,
>         title: this.props.article.title,
>     }}
> >
>     Comments
> </CommentCount>
> ```
> 
> 3. SSO Sign in
> ```tsx
> import { DiscussionEmbed } from 'disqus-react';
> 
> <DiscussionEmbed
>     shortname='mas-exchanger-1'
>     config={{
>         url: this.props.article.url,
>         identifier: this.props.article.id,
>         title: this.props.article.title,
>         language: 'en',
>         remoteAuthS3: '',
>         apiKey: '',
>         sso: {
>             name: 'SampleNews',
>             button: 'http://example.com/images/samplenews.gif',
>             icon: 'http://example.com/favicon.png',
>             url: 'http://example.com/login/',
>             logout: 'http://example.com/logout/',
>             profile_url: 'http://example.com/profileUrlTemplate/{username}',
>             width: '800',
>             height: '400',
>         }
>     }}
> />
> ```

### Implementation Summary
- **Installed `disqus-react`** package.
- **Created `src/components/TalkToUs.tsx`**:
  - Embedded `<DiscussionEmbed>` configured with shortname `'mas-exchanger-1'`.
  - Embedded `<CommentCount>` showing live comment count badge for the forum thread.
  - Added support for Single Sign-On (SSO) configuration with `remoteAuthS3`, `apiKey`, and custom `sso` properties as requested.
  - Added community topics and guidelines for Singapore money changers, MAS daily fixing rates, and travel cards.
- **Updated Navigation**: Added the "Talk to Us" tab to both desktop and mobile navigation bars and footer.
- **Git Push**: Synchronized changes to the remote GitHub repository.


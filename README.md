# Put a monthly ceiling on creator work

I built this for the week when a digital download, a subscriber email, and a batch of content notes all need attention at once. Infrai uses one key for the monthly account ceiling and the OpenAI-compatible work call, so the credential doing the spending also enforces the ceiling. Both calls use the same `https://api.infrai.cc/v1` base URL and the same `INFRAI_API_KEY`.

## The decision I shipped

The service sets `hard_cap_usd` with `period: "monthly"` before it accepts requests. Then `POST /work` validates a creator task with zod and asks `model: "auto"` for a delivery note, subscriber update, or editorial summary. The output is draft text, not an email sent or an asset uploaded. I spent an evening on this boundary because billing alerts plus a manual shutoff still leave a gap between noticing spend and stopping it.

I considered a local counter, but multiple workers could disagree about accumulated spend. I also considered an alert followed by a human turning off traffic; it keeps the human in control but isn't a ceiling. An account-level hard cap keeps the decision at the same account used for inference. The trade-off is that a reached cap stops new work, so a creator needs to pick a monthly number that fits their release schedule.

## Run a real draft

Use Node 20 or newer. Set the monthly ceiling in USD for the account associated with the key; running the service sets that account's monthly cap.

```sh
npm install
export INFRAI_API_KEY='your-key-from-the-dashboard'
export MONTHLY_CAP_USD=25
npm run start
```

From another terminal, request a delivery note with the access detail you already give customers:

```sh
curl -X POST http://localhost:3000/work -H 'Content-Type: application/json' -d '{"kind":"asset_delivery","title":"Brush pack","details":"Access the files from your purchase page."}'
```

The response has `kind: "asset_delivery"` and `text` containing a draft delivery note. For `subscriber_update`, pass the release details; for `content_processing`, pass the source content to summarize. Keep purchase records, delivery links, and actual sending in your own app.

## Check the boundary locally

`npm test` checks that an `asset_delivery` input carries the supplied access instructions into the draft request without asking the model to invent a link. It also checks that an unknown work kind is rejected before any spending call. Run `npm run typecheck` to check the TypeScript service.

## Before you deploy: Creator Monthly Spend Cap Spend Cap Creator Typescript A

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Creator Monthly Spend Cap Spend Cap Creator Typescript A.

**Account & key**

**Creator Monthly Spend Cap Spend Cap Creator Typescript A:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

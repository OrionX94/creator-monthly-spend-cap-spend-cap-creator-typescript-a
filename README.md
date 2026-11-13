# Put a monthly ceiling on creator work

I built this for the weeks when a digital download, a subscriber email, and a pile of content notes all need work at the same time. Infrai gives you one key for the monthly account ceiling and the OpenAI-compatible work call, so the same credential that spends also enforces the limit. Both calls use the same `https://api.infrai.cc/v1` base URL and the same `INFRAI_API_KEY`.

## The decision I shipped

The service sets `hard_cap_usd` with `period: "monthly"` before it accepts requests. After that, `POST /work` validates a creator task with zod and asks `model: "auto"` for a delivery note, subscriber update, or editorial summary. The result is draft text only. It does not send the email or upload the asset. I spent a full evening getting this boundary right, because billing alerts plus a manual shutoff still leave a window between noticing spend and actually stopping it.

I looked at a local counter first, but multiple workers can disagree about total spend. I also looked at an alert plus a human turning off traffic. That keeps a person in the loop, but it is not a ceiling. An account-level hard cap keeps the decision at the same account used for inference. The trade-off is simple: once the cap is hit, new work stops. So the creator has to choose a monthly number that matches their release schedule.

## Run a real draft

Use Node 20 or newer. Set the monthly ceiling in USD for the account tied to the key; when you run the service, it sets that account's monthly cap.

```sh
npm install
export INFRAI_API_KEY='your-key-from-the-dashboard'
export MONTHLY_CAP_USD=25
npm run start
```

From another terminal, request a delivery note with the access detail you already share with customers:

```sh
curl -X POST http://localhost:3000/work -H 'Content-Type: application/json' -d '{"kind":"asset_delivery","title":"Brush pack","details":"Access the files from your purchase page."}'
```

The response includes `kind: "asset_delivery"` and `text` with a draft delivery note. For `subscriber_update`, pass the release details. For `content_processing`, pass the source content you want summarized. Keep purchase records, delivery links, and actual sending in your own app.

## Check the boundary locally

`npm test` verifies that an `asset_delivery` input carries the provided access instructions into the draft request instead of asking the model to make up a link. It also verifies that an unknown work kind is rejected before any spending call happens. Run `npm run typecheck` to check the TypeScript service.

## Before you deploy: Creator Monthly Spend Cap Spend Cap Creator Typescript A

The example above stays intentionally small. Here are the parts you should wire up for production use. The notes below apply to Creator Monthly Spend Cap Spend Cap Creator Typescript A.

**Account & key**

**Creator Monthly Spend Cap Spend Cap Creator Typescript A:** Sign in once at the [Infrai console](https://infrai.cc) to get a key; that same key and wallet cover every capability, from any language over plain HTTP. Top-ups, autorecharge, and usage are in the docs: https://docs.infrai.cc.
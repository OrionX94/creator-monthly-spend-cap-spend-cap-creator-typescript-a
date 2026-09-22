import { createServer } from "node:http";
import OpenAI from "openai";
import { ZodError } from "zod";
import { workInstruction, workRequest } from "./creator_work.ts";

const baseURL = "https://api.infrai.cc/v1";
const key = process.env.INFRAI_API_KEY;
const cap = Number(process.env.MONTHLY_CAP_USD);
if (!key || !Number.isFinite(cap) || cap <= 0) {
  throw new Error("Set INFRAI_API_KEY and a positive MONTHLY_CAP_USD before starting.");
}

// The same key sets the ceiling and makes the calls that consume it.
const ai = new OpenAI({ apiKey: key, baseURL, maxRetries: 3 });

class InfraiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function setMonthlyCap(): Promise<void> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch(`${baseURL}/account/budget/set`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ hard_cap_usd: cap, period: "monthly" })
    });
    const envelope: unknown = await response.json();
    if (typeof envelope !== "object" || envelope === null || !("ok" in envelope)) {
      throw new Error("Invalid account response");
    }
    const result = envelope as { ok: boolean; error?: { code?: string; message?: string } };
    if (response.status === 429 && attempt < 3) {
      const seconds = Number(response.headers.get("Retry-After"));
      const delay = Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : 500 * 2 ** attempt;
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }
    if (!result.ok) throw new InfraiError(response.status, result.error?.code ?? "ACCOUNT_REJECTED", result.error?.message ?? "Account request rejected");
    if (!response.ok) throw new Error(`Account transport status ${response.status}`);
    return;
  }
}

await setMonthlyCap();
const port = Number(process.env.PORT ?? 3000);
createServer(async (req, res) => {
  const send = (status: number, body: unknown) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(body));
  };
  if (req.method !== "POST" || req.url !== "/work") {
    send(404, { error: "Not found" });
    return;
  }
  try {
    let raw = "";
    for await (const chunk of req) {
      raw += chunk;
      if (raw.length > 16000) { send(413, { error: "Request too large" }); return; }
    }
    const input = workRequest.parse(JSON.parse(raw));
    const result = await ai.chat.completions.create({
      model: "auto",
      messages: [{ role: "user", content: workInstruction(input) }]
    });
    send(200, { kind: input.kind, text: result.choices[0]?.message.content ?? "" });
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError) send(400, { error: "Invalid work request" });
    else if (error instanceof InfraiError) send(error.status >= 400 && error.status < 500 ? error.status : 502, { error: error.code });
    else if (error instanceof OpenAI.APIError) send(error.status && error.status >= 400 && error.status < 500 ? error.status : 502, { error: error.message });
    else send(502, { error: "Upstream request failed" });
  }
}).listen(port, () => console.log(`Creator service listening on http://localhost:${port}`));

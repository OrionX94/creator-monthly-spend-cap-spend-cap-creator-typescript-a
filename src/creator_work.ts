import { z } from "zod";

export const workRequest = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("asset_delivery"), title: z.string().min(1).max(120), details: z.string().min(1).max(4000) }),
  z.object({ kind: z.literal("subscriber_update"), title: z.string().min(1).max(120), details: z.string().min(1).max(4000) }),
  z.object({ kind: z.literal("content_processing"), title: z.string().min(1).max(120), details: z.string().min(1).max(4000) })
]);

export type WorkRequest = z.infer<typeof workRequest>;

export function workInstruction(input: WorkRequest): string {
  const instruction = {
    asset_delivery: "Write a concise delivery note for a digital asset. Include the supplied access instructions; never invent a download link.",
    subscriber_update: "Write a concise subscriber update with a clear subject line and the supplied release details.",
    content_processing: "Summarize the supplied content into three actionable editorial points. Do not add facts."
  }[input.kind];
  return `${instruction}\nTitle: ${input.title}\nDetails: ${input.details}`;
}

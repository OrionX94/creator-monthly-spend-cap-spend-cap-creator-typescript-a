import assert from "node:assert/strict";
import test from "node:test";
import { workInstruction, workRequest } from "./creator_work.ts";

test("a delivery request preserves access instructions without inventing a link", () => {
  const input = workRequest.parse({ kind: "asset_delivery", title: "Brush pack", details: "Access from the customer's purchase page." });
  const instruction = workInstruction(input);
  assert.match(instruction, /never invent a download link/);
  assert.match(instruction, /Access from the customer's purchase page/);
  assert.doesNotMatch(instruction, /three actionable editorial points/);
});

test("only known work types reach the spending call", () => {
  assert.equal(workRequest.safeParse({ kind: "broadcast", title: "Hi", details: "All" }).success, false);
});

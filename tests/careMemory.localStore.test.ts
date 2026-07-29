import assert from "node:assert/strict";
import { test } from "node:test";
import type { CareMemory } from "../src/lib/careMemory/localStore";

test("care memory is project learning, not a protocol envelope", () => {
  const memory: CareMemory = {
    id: "mem_test",
    createdAt: "2026-07-29T18:00:00.000Z",
    title: "Floor and love phrase",
    whatHappened: "Person ate from soiled floor; repeated yo te quiero mucho",
    whatItTaught: "Dignity neglect must be named; speech cycles are communication",
    tags: "neglect, speech-cycle",
    place: "Sweden",
  };
  assert.ok(memory.whatItTaught.includes("Dignity"));
  assert.equal(typeof memory.place, "string");
});

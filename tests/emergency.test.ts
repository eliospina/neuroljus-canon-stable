import assert from "node:assert/strict";
import { test } from "node:test";
import { countryFromHeaders, emergencyInfo, emergencyNumber } from "../src/lib/emergency";

test("emergency number follows the country", () => {
  assert.equal(emergencyNumber("SE"), "112");
  assert.equal(emergencyNumber("es"), "112");
  assert.equal(emergencyNumber("DE"), "112");
  assert.equal(emergencyNumber("US"), "911");
  assert.equal(emergencyNumber("MX"), "911");
  assert.equal(emergencyNumber("CO"), "123");
  assert.equal(emergencyNumber("GB"), "999");
  assert.equal(emergencyNumber("AU"), "000");
  assert.equal(emergencyNumber("BR"), "192");
  assert.equal(emergencyNumber("CL"), "131");
  assert.equal(emergencyNumber("PE"), "106");
  assert.equal(emergencyNumber("UY"), "911");
  assert.equal(emergencyNumber("AR"), "911");
  assert.equal(emergencyNumber("EC"), "911");
  assert.equal(emergencyNumber("PH"), "911");
  assert.equal(emergencyNumber("CA"), "911");
  assert.equal(emergencyNumber("ZZ"), null);
  assert.equal(emergencyNumber(null), null);
});

test("messages carry the right number, a generic line when unknown, and 1177 only in Sweden", () => {
  const se = emergencyInfo("SE", "sv", true);
  assert.equal(se.text, "Det här behöver en människa. Vid fara, ring 112. För icke-akuta medicinska frågor i Sverige: 1177.");
  assert.equal(se.call, "Ring 112");
  assert.equal(se.medical, "1177");

  const co = emergencyInfo("CO", "es", true);
  assert.equal(co.text, "Esto necesita a una persona. Si hay peligro, llama al 123.");
  assert.equal(co.call, "Llamar al 123");
  assert.equal(co.medical, null);

  const unknown = emergencyInfo(null, "en", true);
  assert.equal(unknown.number, null);
  assert.equal(unknown.call, null);
  assert.match(unknown.text, /your country's emergency number/);
  assert.doesNotMatch(unknown.text, /1177/);

  const us = emergencyInfo("US", "es", false);
  assert.equal(us.text, "Esto necesita a una persona. Si hay peligro, llama al 911.");
});

test("country is read from Vercel's header only when it looks like a country code", () => {
  assert.equal(countryFromHeaders({ "x-vercel-ip-country": "se" }), "SE");
  assert.equal(countryFromHeaders({ "x-vercel-ip-country": ["CO"] }), "CO");
  assert.equal(countryFromHeaders({ "x-vercel-ip-country": "<script>" }), null);
  assert.equal(countryFromHeaders({}), null);
});

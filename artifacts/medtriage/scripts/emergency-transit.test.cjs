const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { sourceLoader, memoryStorage } = require("./load-source.cjs");
const load = sourceLoader(memoryStorage());
const transit = load(path.join(__dirname, "../utils/emergencyTransit.ts"));

test("transit destination is retained by id and invalid ids do not silently select a different hospital", () => {
  const hospital = transit.resolveTransitHospital("thammasat");
  assert.equal(hospital.id, "thammasat");
  assert.equal(
    transit.resolveTransitHospital(undefined, "phatara").id,
    "phatara",
  );
  assert.equal(
    transit.resolveTransitHospital(["pat-rangsit"]).id,
    "pat-rangsit",
  );
  assert.equal(transit.resolveTransitHospital("invalid", "thammasat"), null);
  assert.equal(transit.resolveTransitHospital(undefined, null), null);
});

test("prototype ETA is finite, bounded at the destination, and increases with distance", () => {
  const hospital = transit.resolveTransitHospital("thammasat");
  const close = transit.estimateTransit(hospital, hospital);
  const distant = transit.estimateTransit(
    { latitude: 13.7, longitude: 100.5 },
    hospital,
  );
  assert.equal(close.minimumMinutes, 5);
  assert.equal(close.maximumMinutes, 10);
  assert.ok(distant.minimumMinutes > close.minimumMinutes);
  assert.ok(Number.isFinite(distant.distanceKm));
});

test("maps URLs carry the selected hospital coordinates, not a hardcoded default or patient data", () => {
  const hospital = transit.resolveTransitHospital("phatara");
  const coordinates = `${hospital.latitude},${hospital.longitude}`;
  const google = new URL(transit.directionsUrl(hospital));
  assert.equal(google.hostname, "www.google.com");
  assert.equal(google.searchParams.get("api"), "1");
  assert.equal(google.searchParams.get("destination"), coordinates);
  assert.equal(google.searchParams.get("origin"), null);
  const apple = new URL(transit.directionsUrl(hospital, "apple"));
  assert.equal(apple.hostname, "maps.apple.com");
  assert.equal(apple.pathname, "/directions");
  assert.equal(apple.searchParams.get("destination"), coordinates);
  assert.equal(transit.hospitalTelephoneUrl("02-901-8400"), "tel:029018400");
});

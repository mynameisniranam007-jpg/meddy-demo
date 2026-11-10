import { distanceInKm, hospitals, type Hospital } from "../constants/data";
import type { Coordinates } from "./appState";

export const TRANSIT_DEMO_ORIGIN: Coordinates = {
  latitude: 14.0705,
  longitude: 100.6045,
};

export function resolveTransitHospital(
  value: unknown,
  selectedId?: string | null,
): Hospital | null {
  const id =
    typeof value === "string"
      ? value
      : Array.isArray(value)
        ? value[0]
        : selectedId;
  return typeof id === "string"
    ? (hospitals.find((h) => h.id === id) ?? null)
    : null;
}

/** Presentation estimate only. It is not a road-routing or live-traffic calculation. */
export function estimateTransit(origin: Coordinates, destination: Hospital) {
  const distanceKm = distanceInKm(origin, destination);
  const minimumMinutes = Math.max(5, Math.ceil(distanceKm * 2.4 + 3));
  return { distanceKm, minimumMinutes, maximumMinutes: minimumMinutes + 5 };
}

export function directionsUrl(
  hospital: Hospital,
  service: "google" | "apple" = "google",
) {
  const destination = encodeURIComponent(
    `${hospital.latitude},${hospital.longitude}`,
  );
  return service === "apple"
    ? `https://maps.apple.com/directions?destination=${destination}&mode=driving`
    : `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
}

export function hospitalTelephoneUrl(phone: string) {
  return "tel:" + phone.replace(/[^\d+]/g, "");
}

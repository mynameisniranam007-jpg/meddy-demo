import React, { useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { EmergencyTransitContent } from "@/components/EmergencyTransitContent";
import { useMedtriage } from "@/context/MedtriageContext";
import { resolveTransitHospital } from "@/utils/emergencyTransit";

export default function EmergencyTransitScreen() {
  const { hospitalId } = useLocalSearchParams<{
    hospitalId?: string | string[];
  }>();
  const { selectedHospital, startEmergencyTransit } = useMedtriage();
  const hospital = resolveTransitHospital(hospitalId, selectedHospital?.id);
  useEffect(() => {
    if (hospital) {
      startEmergencyTransit(hospital);
      router.replace("/(tabs)");
    }
  }, [hospital?.id]);
  return hospital ? null : <EmergencyTransitContent hospitalId="invalid" />;
}


"use client";

import { Suspense } from "react";
import PropertiesContent from "./PropertiesContent";

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PropertiesContent />
    </Suspense>
  );
}
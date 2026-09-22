"use client";

import { useState } from "react";
import UploadStep from "@/components/UploadStep";
import SetupStep from "@/components/SetupStep";
import Workspace from "@/components/Workspace";
import { AppStage } from "@/lib/types";
import { SAMPLE_CHART } from "@/lib/mockData";

export default function Home() {
  const [stage, setStage] = useState<AppStage>("upload");
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const [systemInstructions, setSystemInstructions] = useState("");

  if (stage === "upload") {
    return (
      <UploadStep
        onContinue={(docs) => {
          setUploadedDocs(docs);
          setStage("setup");
        }}
      />
    );
  }

  if (stage === "setup") {
    return (
      <SetupStep
        onContinue={(instructions) => {
          setSystemInstructions(instructions);
          setStage("workspace");
        }}
      />
    );
  }

  return (
    <Workspace
      initialChart={SAMPLE_CHART}
      uploadedDocs={uploadedDocs}
      systemInstructions={systemInstructions}
    />
  );
}

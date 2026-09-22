"use client";

import { useState } from "react";
import UploadChartStep from "@/components/UploadChartStep";
import UploadDocsStep from "@/components/UploadDocsStep";
import SetupStep from "@/components/SetupStep";
import Workspace from "@/components/Workspace";
import { AppStage } from "@/lib/types";
import { SAMPLE_CHART } from "@/lib/mockData";

export default function Home() {
  const [stage, setStage] = useState<AppStage>("upload-chart");
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const [systemInstructions, setSystemInstructions] = useState("");

  if (stage === "upload-chart") {
    return <UploadChartStep onContinue={() => setStage("upload-docs")} />;
  }

  if (stage === "upload-docs") {
    return (
      <UploadDocsStep
        onBack={() => setStage("upload-chart")}
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
        onBack={() => setStage("upload-docs")}
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

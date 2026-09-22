"use client";

import { useState } from "react";
import UploadChartStep from "@/components/UploadChartStep";
import UploadDocsStep from "@/components/UploadDocsStep";
import SetupStep from "@/components/SetupStep";
import Workspace from "@/components/Workspace";
import { AppStage } from "@/lib/types";
import { SAMPLE_CHART } from "@/lib/mockData";
import { MockFile } from "@/lib/mockFiles";

export default function Home() {
  const [stage, setStage] = useState<AppStage>("upload-chart");
  const [chartFile, setChartFile] = useState<MockFile | null>(null);
  const [docFiles, setDocFiles] = useState<MockFile[]>([]);
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([]);
  const [systemInstructions, setSystemInstructions] = useState("");
  const [sessionKey, setSessionKey] = useState(0);

  function startNewSession() {
    setChartFile(null);
    setDocFiles([]);
    setUploadedDocs([]);
    setSystemInstructions("");
    setSessionKey((k) => k + 1);
    setStage("upload-chart");
  }

  if (stage === "upload-chart") {
    return (
      <UploadChartStep
        key={sessionKey}
        initialFile={chartFile}
        onFileChange={setChartFile}
        onContinue={() => setStage("upload-docs")}
      />
    );
  }

  if (stage === "upload-docs") {
    return (
      <UploadDocsStep
        initialFiles={docFiles}
        onFilesChange={setDocFiles}
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
      key={sessionKey}
      initialChart={SAMPLE_CHART}
      uploadedDocs={uploadedDocs}
      systemInstructions={systemInstructions}
      onNewSession={startNewSession}
    />
  );
}

export type FileKind = "csv" | "pdf" | "html";

export interface MockFile {
  id: string;
  name: string;
  kind: FileKind;
  size: string;
  preview:
    | { type: "table"; columns: string[]; rows: string[][] }
    | { type: "text"; excerpt: string };
}

export const CLAIM_CHART_FILES: MockFile[] = [
  {
    id: "chart-1",
    name: "US123456-vs-Acme-claim-chart.csv",
    kind: "csv",
    size: "3.1 KB",
    preview: {
      type: "table",
      columns: ["Patent Claim Element", "Accused Product Feature", "AI Reasoning"],
      rows: [
        [
          "A temperature control device with a wireless communication module",
          'Acme Thermostat product page states: "WiFi-enabled smart thermostat..."',
          "The Acme device has WiFi capability which satisfies...",
        ],
        [
          "A motion sensor for detecting occupancy",
          'Acme technical specifications document shows: "Built-in motion sensor..."',
          "Motion sensor explicitly mentioned in specs directly maps to...",
        ],
      ],
    },
  },
];

export const PRODUCT_DOC_FILES: MockFile[] = [
  {
    id: "doc-marketing",
    name: "acme-marketing-page.html",
    kind: "html",
    size: "18 KB",
    preview: {
      type: "text",
      excerpt:
        '"WiFi-enabled smart thermostat connects to your home network. Auto-Schedule learns your preferred temperatures over time, so your home is always comfortable — without you lifting a finger."',
    },
  },
  {
    id: "doc-datasheet",
    name: "acme-thermostat-datasheet.pdf",
    kind: "pdf",
    size: "412 KB",
    preview: {
      type: "text",
      excerpt:
        '"Built-in motion sensor detects when people are home. Auto-Schedule module uses a gradient-based preference model that logs thermostat adjustments and retrains weekly to predict optimal setpoints."',
    },
  },
];

export const SUPPLEMENTAL_DOC_FILE: MockFile = {
  id: "doc-ml-whitepaper",
  name: "acme-ml-technical-whitepaper.pdf",
  kind: "pdf",
  size: "1.2 MB",
  preview: {
    type: "text",
    excerpt:
      '"The Auto-Schedule preference engine is a gradient-based online learning model. Weights are updated weekly from logged manual adjustments, allowing predicted setpoints to converge toward observed user behavior over 3-4 weeks."',
  },
};

import { ClaimRow } from "./types";

export const SAMPLE_CHART: ClaimRow[] = [
  {
    id: "elem-1",
    element: "A temperature control device with a wireless communication module",
    feature:
      'Acme Thermostat product page states: "WiFi-enabled smart thermostat connects to your home network"',
    reasoning:
      "The Acme device has WiFi capability which satisfies the wireless communication module requirement.",
    confidence: "strong",
    history: [],
  },
  {
    id: "elem-2",
    element: "A motion sensor for detecting occupancy",
    feature:
      'Acme technical specifications document shows: "Built-in motion sensor detects when people are home"',
    reasoning:
      "Motion sensor explicitly mentioned in specs directly maps to the claim element for occupancy detection.",
    confidence: "strong",
    history: [],
  },
  {
    id: "elem-3",
    element:
      "Machine learning algorithm that learns user temperature preferences over time",
    feature:
      'Acme marketing materials claim: "Auto-Schedule learns your preferred temperatures"',
    reasoning:
      "The learning behavior described suggests ML algorithm, though technical implementation details are not disclosed. May need stronger technical evidence.",
    confidence: "weak",
    history: [],
  },
];

export const MOCK_PRODUCT_DOCS = [
  { name: "acme-thermostat-datasheet.pdf", uploaded: false },
  { name: "acme-marketing-page.html", uploaded: false },
];

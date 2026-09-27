// Mock OCR service — ready for AIKosh / Google Vision integration
// Simulates extracting instrument data from a photo

const MOCK_INSTRUMENTS = [
  { manufacturer: 'Mettler Toledo', modelNumber: 'ME204E', serialNumber: 'B123456789', capacity: '220g', accuracy: '0.0001g' },
  { manufacturer: 'Sartorius', modelNumber: 'ENTRIS224-1S', serialNumber: 'SA987654', capacity: '220g', accuracy: '0.0001g' },
  { manufacturer: 'Avery Weigh-Tronix', modelNumber: 'ZK830', serialNumber: 'AWT20241001', capacity: '300kg', accuracy: '100g' },
  { manufacturer: 'Essae Teraoka', modelNumber: 'DS-852', serialNumber: 'ET2024XY', capacity: '30kg', accuracy: '10g' },
  { manufacturer: 'Citizen Systems', modelNumber: 'CX-265D', serialNumber: 'CZ456789', capacity: '265g', accuracy: '0.1mg' },
];

export const performOCRExtraction = async (imageFile) => {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Return random mock data
  const mock = MOCK_INSTRUMENTS[Math.floor(Math.random() * MOCK_INSTRUMENTS.length)];

  return {
    success: true,
    confidence: Math.round(88 + Math.random() * 10),
    extracted: mock,
    ...mock,
    // Fields ready for AIKosh API response shape
    rawResponse: {
      source: 'mock_ocr',
      version: '1.0.0',
      fields: Object.entries(mock).map(([key, value]) => ({ field: key, value, confidence: 0.9 })),
    },
  };
};

export const runOCR = performOCRExtraction;

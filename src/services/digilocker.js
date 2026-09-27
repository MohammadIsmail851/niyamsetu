/**
 * DigiLocker Mock Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Simulates the DigiLocker OAuth2 + Pull API flow.
 *
 * PRODUCTION UPGRADE PATH:
 *  1. Replace `initiateOAuth`   → redirect to DigiLocker OAuth2 endpoint
 *  2. Replace `exchangeToken`   → POST /token with authorization_code
 *  3. Replace `fetchDocuments`  → GET /public/oauth2/1/xml/eaadhaar (NHA)
 *                                 GET /public/oauth2/1/xml/GST-CERTIFICATE (GSTN)
 *                                 GET /public/oauth2/1/xml/UDYAM-REG (MoMSME)
 *
 * No Firebase dependencies — intentionally isolated.
 */

const MOCK_DELAY_MS = 1800;

/** Simulated OAuth2 initiation — in production this opens DigiLocker login page */
export const initiateDigiLockerOAuth = async () => {
  await delay(500);
  // In production: window.location.href = `${DIGILOCKER_AUTH_URL}?...`
  return { authCode: `MOCK-AUTH-${Date.now()}`, status: 'pending_consent' };
};

/** Simulated token exchange — in production: POST to /token */
export const exchangeDigiLockerToken = async (authCode) => {
  await delay(400);
  return {
    accessToken: `MOCK-TOKEN-${authCode}`,
    expiresIn: 3600,
    userId: `DL-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
  };
};

/**
 * Simulated document fetch — in production: pull documents via DigiLocker Pull API
 * Returns mock verified documents: Aadhaar, GST Certificate, Udyam Registration
 */
export const fetchDigiLockerDocuments = async (accessToken) => {
  await delay(MOCK_DELAY_MS);

  // Mock verified document payload (mirrors DigiLocker Pull API XML → JSON response)
  return {
    aadhaar: {
      docType: 'AADHAAR',
      number: '9876 XXXX XXXX 4321',       // Always masked
      name: 'Suresh Venkata Rao',
      dob: '1982-04-15',
      gender: 'M',
      address: '12/3, Gandhi Nagar, Hyderabad, Telangana — 500001',
      verified: true,
    },
    gst: {
      docType: 'GST_CERTIFICATE',
      number: '36AADCS5678N1Z2',
      businessName: 'Sri Venkata Weighing Solutions',
      businessType: 'Proprietorship',
      registrationDate: '2019-07-01',
      state: 'Telangana',
      verified: true,
    },
    udyam: {
      docType: 'UDYAM_REGISTRATION',
      number: 'UDYAM-TS-18-0012345',
      category: 'Micro Enterprise',
      nic: '26914',
      verified: true,
    },
  };
};

/**
 * Check if a DigiLocker user already exists in the app by their DigiLocker user ID.
 * In production: query Firestore where digilockerUserId == userId
 */
export const resolveDigiLockerUser = async (digilockerUserId, aadhaarName) => {
  await delay(300);
  // Mock: treat every user as "new" (no existing account)
  // In production: const snap = await getDoc(doc(db, 'digilocker_users', digilockerUserId));
  return { exists: false, profile: null };
};

/**
 * Build a profile object from DigiLocker documents.
 * Used when creating a new account after successful DigiLocker verification.
 */
export const buildProfileFromDigiLocker = (digilockerUserId, docs) => ({
  uid: `dl-${digilockerUserId}`,
  email: null,                             // No email from DigiLocker
  name: docs.aadhaar.name,
  role: 'business_owner',
  phone: null,
  digilockerVerified: true,
  digilockerUserId,
  aadhaarMasked: docs.aadhaar.number,
  gstNumber: docs.gst.number,
  businessName: docs.gst.businessName,
  businessType: docs.gst.businessType,
  udyamNumber: docs.udyam.number,
  address: docs.aadhaar.address,
  state: docs.gst.state,
  createdAt: new Date().toISOString(),
  isActive: true,
});

// ── Internal ────────────────────────────────────────────────────────────────

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

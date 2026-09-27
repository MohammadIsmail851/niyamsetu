export const APPLICATION_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  ASSIGNED: 'assigned',
  SCHEDULED: 'scheduled',
  INSPECTION_COMPLETED: 'inspection_completed',
  VERIFIED: 'verified',
  CERTIFICATE_GENERATED: 'certificate_generated',
  EXPIRED: 'expired',
  REJECTED: 'rejected',
};

export const USER_ROLES = {
  BUSINESS_OWNER: 'business_owner',
  LMO: 'lmo',
  GATC: 'gatc',
  ADMIN: 'admin',
};

export const INSTRUMENT_CATEGORIES = [
  'Weighing Scale',
  'Platform Balance',
  'Electronic Balance',
  'Spring Balance',
  'Beam Balance',
  'Crane Scale',
  'Vehicle Weighbridge',
  'Flow Meter',
  'Petrol Pump Dispenser',
  'Gas Meter',
  'Water Meter',
  'Electricity Meter',
  'Thermometer',
  'Pressure Gauge',
  'Milk Lactometer',
  'Measuring Tape',
  'Calipers',
  'Other',
];

export const VERIFICATION_TYPES = [
  { value: 'initial', label: 'Initial Verification' },
  { value: 'subsequent', label: 'Subsequent Verification' },
  { value: 're_verification', label: 'Re-Verification' },
  { value: 'stamping', label: 'Stamping Only' },
];

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh',
];

export const AP_TELANGANA_DISTRICTS = [
  'Hyderabad', 'Rangareddy', 'Medchal', 'Warangal', 'Karimnagar',
  'Nizamabad', 'Khammam', 'Nalgonda', 'Visakhapatnam', 'Vijayawada',
  'Guntur', 'Tirupati', 'Kurnool', 'Nellore', 'Kakinada',
  'Rajahmundry', 'Anantapur', 'Kadapa', 'Krishna', 'West Godavari',
];

export const VALIDITY_PERIODS = {
  'Weighing Scale': 12,
  'Platform Balance': 12,
  'Electronic Balance': 12,
  'Spring Balance': 12,
  'Beam Balance': 12,
  'Crane Scale': 12,
  'Vehicle Weighbridge': 12,
  'Flow Meter': 12,
  'Petrol Pump Dispenser': 12,
  'Gas Meter': 24,
  'Water Meter': 24,
  'Electricity Meter': 24,
  'Thermometer': 12,
  'Pressure Gauge': 12,
  'Milk Lactometer': 12,
  'Measuring Tape': 24,
  'Calipers': 24,
  'Other': 12,
};

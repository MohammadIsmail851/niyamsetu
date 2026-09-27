import { MOCK_INSTRUMENTS, MOCK_APPLICATIONS, MOCK_CERTIFICATES, MOCK_USERS } from '../data/mockData.js';
import { APPLICATION_STATUS } from '../types/enums.js';

// In-memory / persistent mock database supporting full CRUD and workflows
class MockDatabase {
  constructor() {
    this.users = { ...MOCK_USERS };
    this.instruments = [...MOCK_INSTRUMENTS];
    this.applications = [...MOCK_APPLICATIONS];
    this.certificates = [...MOCK_CERTIFICATES];
    this.notifications = [
      {
        id: 'notif-1',
        title: 'Certificate Expiring Soon',
        message: 'Certificate NS-CERT-2026-001043 for CNG Dispenser Flow Meter expires in 8 days. Apply for renewal.',
        type: 'warning',
        timestamp: new Date().toISOString(),
        read: false,
      },
      {
        id: 'notif-2',
        title: 'Inspection Scheduled',
        message: 'Platform Balance inspection scheduled for 2026-10-05 with Officer K. Subrahmanyam.',
        type: 'info',
        timestamp: new Date().toISOString(),
        read: false,
      }
    ];
  }

  // ── Instrument CRUD ────────────────────────────────────────────────────────
  createInstrument(data) {
    const id = `inst-${String(this.instruments.length + 1).padStart(3, '0')}`;
    const newInstrument = {
      id,
      ...data,
      status: 'active',
      createdAt: new Date(),
    };
    this.instruments.push(newInstrument);
    return newInstrument;
  }

  getInstruments(filter = {}) {
    return this.instruments.filter(i => {
      if (filter.category && i.category !== filter.category) return false;
      if (filter.district && i.district !== filter.district) return false;
      if (filter.status && i.status !== filter.status) return false;
      return true;
    });
  }

  getInstrumentById(id) {
    return this.instruments.find(i => i.id === id) || null;
  }

  updateInstrument(id, updates) {
    const idx = this.instruments.findIndex(i => i.id === id);
    if (idx === -1) throw new Error(`Instrument ${id} not found`);
    this.instruments[idx] = { ...this.instruments[idx], ...updates, updatedAt: new Date() };
    return this.instruments[idx];
  }

  deleteInstrument(id) {
    const idx = this.instruments.findIndex(i => i.id === id);
    if (idx === -1) throw new Error(`Instrument ${id} not found`);
    const deleted = this.instruments.splice(idx, 1)[0];
    return deleted;
  }

  // ── Application CRUD ───────────────────────────────────────────────────────
  createApplication(data) {
    const seq = String(this.applications.length + 1).padStart(6, '0');
    const applicationId = `NS-APP-2026-${seq}`;
    const newApp = {
      id: `app-${String(this.applications.length + 1).padStart(3, '0')}`,
      applicationId,
      status: APPLICATION_STATUS.SUBMITTED,
      submittedAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };
    this.applications.push(newApp);

    // Trigger notification
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'New Verification Application',
      message: `Application ${applicationId} submitted for ${data.instrumentType || 'Instrument'}`,
      type: 'success',
      timestamp: new Date().toISOString(),
      read: false,
    });

    return newApp;
  }

  getApplications(filter = {}) {
    return this.applications.filter(a => {
      if (filter.status && a.status !== filter.status) return false;
      if (filter.assignedTo && a.assignedTo !== filter.assignedTo) return false;
      if (filter.district && a.district !== filter.district) return false;
      return true;
    });
  }

  getApplicationById(id) {
    return this.applications.find(a => a.id === id || a.applicationId === id) || null;
  }

  updateApplication(id, updates) {
    const idx = this.applications.findIndex(a => a.id === id || a.applicationId === id);
    if (idx === -1) throw new Error(`Application ${id} not found`);
    this.applications[idx] = { ...this.applications[idx], ...updates, updatedAt: new Date() };
    return this.applications[idx];
  }

  deleteApplication(id) {
    const idx = this.applications.findIndex(a => a.id === id || a.applicationId === id);
    if (idx === -1) throw new Error(`Application ${id} not found`);
    return this.applications.splice(idx, 1)[0];
  }

  // ── Workflows ─────────────────────────────────────────────────────────────
  
  // 1. Admin assigns officer
  assignOfficer(appId, officerId, officerName) {
    return this.updateApplication(appId, {
      assignedTo: officerId,
      officerName,
      status: APPLICATION_STATUS.ASSIGNED,
    });
  }

  // 2. Officer schedules inspection
  scheduleInspection(appId, scheduledDate, scheduledSlot) {
    const app = this.updateApplication(appId, {
      scheduledDate,
      scheduledSlot,
      status: APPLICATION_STATUS.SCHEDULED,
    });

    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'Inspection Scheduled',
      message: `Inspection for ${app.applicationId} scheduled on ${scheduledDate} (${scheduledSlot})`,
      type: 'info',
      timestamp: new Date().toISOString(),
      read: false,
    });

    return app;
  }

  // 3. Inspection Approval & Certificate Generation
  approveInspection(appId, inspectionData = {}) {
    const app = this.getApplicationById(appId);
    if (!app) throw new Error(`Application ${appId} not found`);

    const instrument = this.getInstrumentById(app.instrumentId);

    // Update application to verified / certificate generated
    const updatedApp = this.updateApplication(appId, {
      status: APPLICATION_STATUS.CERTIFICATE_GENERATED,
      inspectionNotes: inspectionData.observations || 'Instrument verified and conforms to standards',
      verifiedAt: new Date(),
    });

    // Auto-generate QR digital certificate
    const certSeq = String(this.certificates.length + 1).padStart(6, '0');
    const certificateNumber = `NS-CERT-2026-${certSeq}`;
    const verificationDate = new Date();
    const validUntil = new Date(verificationDate);
    validUntil.setFullYear(validUntil.getFullYear() + 1); // 1 year validity under Rule 28

    const newCertificate = {
      id: `cert-${String(this.certificates.length + 1).padStart(3, '0')}`,
      certificateNumber,
      verificationId: `VER-2026-${(app.district || 'GEN').substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      applicationId: app.applicationId,
      instrumentId: app.instrumentId,
      instrumentType: app.instrumentType,
      category: instrument?.category || 'Weighing Instrument',
      manufacturer: instrument?.manufacturer || 'Standard Manufacturer',
      modelNumber: instrument?.modelNumber || 'Standard Model',
      serialNumber: app.serialNumber,
      capacity: instrument?.capacity || 'Standard Capacity',
      ownerName: app.ownerName,
      businessName: app.businessName,
      gstNumber: instrument?.gstNumber || '36AADCS1234N1Z5',
      address: instrument?.address || 'Verified Premises',
      district: app.district || 'Hyderabad',
      state: instrument?.state || 'Telangana',
      officerName: app.officerName || 'K. Subrahmanyam',
      officerDesignation: 'Legal Metrology Officer',
      verificationDate,
      validUntil,
      verificationType: app.verificationType === 'initial' ? 'Initial Verification' : 'Subsequent Verification',
      isValid: true,
      isExpiring: false,
      createdAt: verificationDate,
    };

    this.certificates.push(newCertificate);

    // Notification
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'Certificate Issued',
      message: `Digital Certificate ${certificateNumber} issued for ${app.instrumentType}. Valid until ${validUntil.toISOString().split('T')[0]}.`,
      type: 'success',
      timestamp: new Date().toISOString(),
      read: false,
    });

    return { application: updatedApp, certificate: newCertificate };
  }

  // 4. Renewal & Expiry Engine
  checkRenewals() {
    const now = new Date();
    const expiring = [];

    this.certificates.forEach(cert => {
      const validUntil = new Date(cert.validUntil);
      const diffDays = Math.ceil((validUntil - now) / (1000 * 60 * 60 * 24));

      if (diffDays <= 30 && diffDays > 0) {
        cert.isExpiring = true;
        cert.daysRemaining = diffDays;
        expiring.push(cert);

        // Generate renewal notification if not already notified
        const exists = this.notifications.some(n => n.message.includes(cert.certificateNumber));
        if (!exists) {
          this.notifications.unshift({
            id: `notif-renewal-${cert.id}`,
            title: 'Renewal Reminder',
            message: `Certificate ${cert.certificateNumber} (${cert.instrumentType}) will expire in ${diffDays} days. Please apply for re-verification.`,
            type: 'warning',
            timestamp: new Date().toISOString(),
            read: false,
          });
        }
      } else if (diffDays <= 0) {
        cert.isValid = false;
        cert.isExpired = true;
      }
    });

    return expiring;
  }

  // ── Certificate CRUD ───────────────────────────────────────────────────────
  getCertificates() {
    return this.certificates;
  }

  getCertificateById(certNumOrId) {
    return this.certificates.find(c => c.certificateNumber === certNumOrId || c.id === certNumOrId) || null;
  }
}

export const mockDb = new MockDatabase();

// ============================================
// MyWorkspace — TypeScript Type Definitions
// ============================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'client';
  avatar?: string;
}

export interface Company {
  id: string;
  name: string;
  cin: string;
  type: string;
  status: 'Active' | 'Pending' | 'Struck Off';
  incorporationDate: string;
  registeredOffice: string;
  email: string;
  phone: string;
  authorizedCapital: string;
  paidUpCapital: string;
}

export interface Director {
  id: string;
  name: string;
  din: string;
  pan: string;
  aadhaar: string;
  email: string;
  phone: string;
  address: string;
  appointmentDate: string;
  resignationDate?: string;
  companyId: string;
  companyName: string;
  status: 'Active' | 'Resigned' | 'Disqualified';
  documents?: string[];
}

export interface Client {
  id: string;
  name: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  status: 'Active' | 'Inactive' | 'Pending';
  createdAt: string;
}

export interface Auditor {
  id: string;
  name: string;
  firmName: string;
  membershipNo: string;
  pan: string;
  email: string;
  phone: string;
  address: string;
  appointmentDate: string;
  status: 'Active' | 'Resigned';
  companyName: string;
}

export interface Shareholder {
  id: string;
  name: string;
  shares: number;
  percentage: number;
  shareCertificate: string;
  transferHistory: ShareTransfer[];
  companyName: string;
  type: 'Individual' | 'Body Corporate' | 'HUF' | 'Trust';
}

export interface ShareTransfer {
  id: string;
  date: string;
  from: string;
  to: string;
  shares: number;
  certificateNo: string;
}

export interface ShareCapital {
  id: string;
  companyName: string;
  authorizedCapital: string;
  paidUpCapital: string;
  faceValue: number;
  totalShares: number;
  equityShares: number;
  preferenceShares: number;
}

export interface RegisteredOffice {
  id: string;
  companyName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  effectiveDate: string;
  status: 'Current' | 'Changed';
}

export interface Resolution {
  id: string;
  title: string;
  type: 'Board' | 'Special' | 'Ordinary';
  companyName: string;
  date: string;
  status: 'Draft' | 'Approved' | 'Filed';
  description: string;
  documentUrl?: string;
}

export interface AnnualFiling {
  id: string;
  companyName: string;
  formType: string;
  filingDate: string;
  dueDate: string;
  status: 'Filed' | 'Pending' | 'Overdue';
  financialYear: string;
}

export interface ShareCertificate {
  id: string;
  certificateNo: string;
  companyName: string;
  holderName: string;
  shares: number;
  issueDate: string;
  status: 'Active' | 'Cancelled' | 'Transferred';
}

export interface AlterationRecord {
  id: string;
  companyName: string;
  type: 'MOA' | 'AOA';
  description: string;
  resolutionDate: string;
  filingDate: string;
  status: 'Approved' | 'Pending' | 'Filed';
}

export interface DocumentTemplate {
  id: string;
  name: string;
  category: string;
  fields: TemplateField[];
  createdAt: string;
  updatedAt: string;
  status: 'Active' | 'Draft';
  content?: string;
  pdfData?: string;
}

export interface GeneratedDocument {
  id: string;
  title: string;
  content: string;
  status: 'Draft' | 'Final';
  createdAt: string;
  templateId: string;
  template?: DocumentTemplate;
}

export interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'date' | 'number' | 'dropdown' | 'email' | 'phone';
  required: boolean;
  defaultValue?: string;
  options?: string[]; // for dropdown type
  placeholder?: string;
}

export interface ModuleCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  gradient: string;
}

export interface SidebarItem {
  title: string;
  href: string;
  icon: string;
  badge?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}
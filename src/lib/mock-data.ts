// ============================================
// MyWorkspace — Mock Data for All Modules
// ============================================

import type {
  Company, Director, Client, Auditor, Shareholder,
  ShareCapital, RegisteredOffice, Resolution, AnnualFiling,
  ShareCertificate, AlterationRecord, DocumentTemplate,
  ModuleCard, Notification
} from './types';

// ---- Dashboard Module Cards ----
export const moduleCards: ModuleCard[] = [
  {
    id: 'masters',
    title: 'Masters',
    description: 'Manage master data and configurations',
    icon: 'Database',
    href: '/masters',
    color: '#E67E22',
    gradient: 'linear-gradient(135deg, #FDEBD0 0%, #F5CBA7 100%)',
  },
  {
    id: 'clients',
    title: 'Clients',
    description: 'Client management and contacts',
    icon: 'Users',
    href: '/clients',
    color: '#3498DB',
    gradient: 'linear-gradient(135deg, #D6EAF8 0%, #AED6F1 100%)',
  },
  {
    id: 'company',
    title: 'Create Company',
    description: 'Register and manage companies',
    icon: 'Building2',
    href: '/company',
    color: '#27AE60',
    gradient: 'linear-gradient(135deg, #D5F5E3 0%, #ABEBC6 100%)',
  },
  {
    id: 'director',
    title: 'Director',
    description: 'Directors, DIN, appointments & resignations',
    icon: 'UserCheck',
    href: '/director',
    color: '#16A085',
    gradient: 'linear-gradient(135deg, #D1F2EB 0%, #A3E4D7 100%)',
  },
  {
    id: 'auditor',
    title: 'Auditor',
    description: 'Auditor management and assignments',
    icon: 'Shield',
    href: '/auditor',
    color: '#8E44AD',
    gradient: 'linear-gradient(135deg, #E8DAEF 0%, #D2B4DE 100%)',
  },
  {
    id: 'shareholder',
    title: 'Shareholder',
    description: 'Shareholder records and holdings',
    icon: 'PieChart',
    href: '/shareholder',
    color: '#7D8B3E',
    gradient: 'linear-gradient(135deg, #EAEFCB 0%, #D4E09B 100%)',
  },
  {
    id: 'share-capital',
    title: 'Share Capital',
    description: 'Share capital structure and allocation',
    icon: 'Coins',
    href: '/share-capital',
    color: '#E74C3C',
    gradient: 'linear-gradient(135deg, #FADBD8 0%, #F5B7B1 100%)',
  },
  {
    id: 'registered-office',
    title: 'Registered Office',
    description: 'Office address management',
    icon: 'MapPin',
    href: '/registered-office',
    color: '#D4A76A',
    gradient: 'linear-gradient(135deg, #FAE5D3 0%, #F0D9B5 100%)',
  },
  {
    id: 'alteration-moa-aoa',
    title: 'Alteration of MOA / AOA',
    description: 'Memorandum and Articles changes',
    icon: 'FileEdit',
    href: '/alteration-moa-aoa',
    color: '#5B6ABF',
    gradient: 'linear-gradient(135deg, #DCDFF7 0%, #C5CAF0 100%)',
  },
  {
    id: 'annual-filings',
    title: 'Annual Filings',
    description: 'Annual compliance filings and returns',
    icon: 'CalendarCheck',
    href: '/annual-filings',
    color: '#DF5B5B',
    gradient: 'linear-gradient(135deg, #FADBD8 0%, #F9B3B3 100%)',
  },
  {
    id: 'share-transfer',
    title: 'Split / Transfer of Shares',
    description: 'Manage share transfers and splits',
    icon: 'ArrowLeftRight',
    href: '/share-transfer',
    color: '#1ABC9C',
    gradient: 'linear-gradient(135deg, #D1F2EB 0%, #A2D9CE 100%)',
  },
  {
    id: 'share-certificate',
    title: 'Share Certificates',
    description: 'Generate and track share certificates',
    icon: 'Award',
    href: '/share-certificate',
    color: '#9B59B6',
    gradient: 'linear-gradient(135deg, #EBDEF0 0%, #D7BDE2 100%)',
  },
  {
    id: 'resolutions',
    title: 'Resolutions',
    description: 'Create and file board resolutions',
    icon: 'FileSignature',
    href: '/resolutions',
    color: '#F1C40F',
    gradient: 'linear-gradient(135deg, #FCF3CF 0%, #F9E79F 100%)',
  }
];

export const mockCompanies: Company[] = [];
export const mockDirectors: Director[] = [];
export const mockClients: Client[] = [];
export const mockAuditors: Auditor[] = [];
export const mockShareholders: Shareholder[] = [];
export const mockShareCapital: ShareCapital[] = [];
export const mockRegisteredOffices: RegisteredOffice[] = [];
export const mockResolutions: Resolution[] = [];
export const mockAnnualFilings: AnnualFiling[] = [];
export const mockShareCertificates: ShareCertificate[] = [];
export const mockAlterations: AlterationRecord[] = [];
export const mockTemplates: DocumentTemplate[] = [];
export const mockNotifications: Notification[] = [];
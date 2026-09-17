export type AssetStatus = 'active' | 'inactive' | 'discontinued';
export type AssetType = 'Vessel' | 'Tank' | 'Filter' | 'Tun' | 'Colander' | 'Kettle';

export interface Asset {
  id: string;
  name: string;
  assetId: string;
  type: AssetType;
  manufacturer: string;
  status: AssetStatus;
  discontinued?: boolean;
  location: string;
  parentId?: string;
  children?: Asset[];
  expanded?: boolean;
}

export interface KPI {
  label: string;
  value: string;
  unit?: string;
  trend?: 'up' | 'down';
  trendLabel?: string;
}

export interface ActivityItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}

export interface SpecField {
  label: string;
  value: string;
}

export interface SpecSection {
  title: string;
  fields: SpecField[];
}

// ── Mock Assets ──────────────────────────────────────────────────────────────

export const ASSETS: Asset[] = [
  {
    id: '1',
    name: 'Brew Kettle',
    assetId: 'HEA-00001',
    type: 'Kettle',
    manufacturer: 'BREWHA',
    status: 'discontinued',
    discontinued: true,
    location: 'Brewery / Brew House',
    children: [
      {
        id: '1-1',
        name: 'Brew Kettle (Broncos)',
        assetId: 'HEA-00002',
        type: 'Kettle',
        manufacturer: 'BREWHA',
        status: 'discontinued',
        discontinued: true,
        location: 'Brewery / Brew House',
        parentId: '1',
      },
      {
        id: '1-2',
        name: 'Brew Kettle (Nuggets)',
        assetId: 'HEA-00003',
        type: 'Kettle',
        manufacturer: 'BREWHA',
        status: 'discontinued',
        discontinued: true,
        location: 'Brewery / Brew House',
        parentId: '1',
      },
      {
        id: '1-3',
        name: 'Brew Kettle (Rams)',
        assetId: 'HEA-00004',
        type: 'Kettle',
        manufacturer: 'BREWHA',
        status: 'discontinued',
        discontinued: true,
        location: 'Brewery / Brew House',
        parentId: '1',
      },
      {
        id: '1-4',
        name: 'Brew Kettle (Vikings)',
        assetId: 'HEA-00005',
        type: 'Kettle',
        manufacturer: 'BREWHA',
        status: 'discontinued',
        discontinued: true,
        location: 'Brewery / Brew House',
        parentId: '1',
      },
    ],
  },
  {
    id: '2',
    name: 'Hot Liquor Tank',
    assetId: 'TAN-00001',
    type: 'Tank',
    manufacturer: 'BREWHA',
    status: 'active',
    location: 'Brewery / Brew House',
    children: [
      {
        id: '2-1',
        name: 'Hot Liquor Tank (Hazy IPA)',
        assetId: 'TAN-00002',
        type: 'Tank',
        manufacturer: 'BREWHA',
        status: 'active',
        location: 'Brewery / Brew House',
        parentId: '2',
      },
      {
        id: '2-2',
        name: 'Hot Liquor Tank (IPA)',
        assetId: 'TAN-00003',
        type: 'Tank',
        manufacturer: 'BREWHA',
        status: 'active',
        location: 'Brewery / Brew House',
        parentId: '2',
      },
      {
        id: '2-3',
        name: 'Hot Liquor Tank (Lager)',
        assetId: 'TAN-00004',
        type: 'Tank',
        manufacturer: 'BREWHA',
        status: 'active',
        location: 'Brewery / Brew House',
        parentId: '2',
      },
      {
        id: '2-4',
        name: 'Hot Liquor Tank (Stout)',
        assetId: 'TAN-00005',
        type: 'Tank',
        manufacturer: 'BREWHA',
        status: 'active',
        location: 'Brewery / Brew House',
        parentId: '2',
      },
    ],
  },
  {
    id: '3',
    name: 'Mash Colander',
    assetId: 'FIL-00001',
    type: 'Colander',
    manufacturer: 'BREWHA',
    status: 'inactive',
    location: 'Brewery / Brew House',
    children: [
      {
        id: '3-1',
        name: 'Mash Colander (Ham)',
        assetId: 'FIL-00002',
        type: 'Colander',
        manufacturer: 'BREWHA',
        status: 'inactive',
        location: 'Brewery / Brew House',
        parentId: '3',
      },
      {
        id: '3-2',
        name: 'Mash Colander (Lena)',
        assetId: 'FIL-00003',
        type: 'Colander',
        manufacturer: 'BREWHA',
        status: 'inactive',
        location: 'Brewery / Brew House',
        parentId: '3',
      },
      {
        id: '3-3',
        name: 'Mash Colander (Luke)',
        assetId: 'FIL-00004',
        type: 'Colander',
        manufacturer: 'BREWHA',
        status: 'inactive',
        location: 'Brewery / Brew House',
        parentId: '3',
      },
      {
        id: '3-4',
        name: 'Mash Colander (Obi)',
        assetId: 'FIL-00005',
        type: 'Colander',
        manufacturer: 'BREWHA',
        status: 'inactive',
        location: 'Brewery / Brew House',
        parentId: '3',
      },
      {
        id: '3-5',
        name: 'Mash Colander (R2D2)',
        assetId: 'FIL-00006',
        type: 'Colander',
        manufacturer: 'BREWHA',
        status: 'inactive',
        location: 'Brewery / Brew House',
        parentId: '3',
      },
    ],
  },
  {
    id: '4',
    name: 'Mash Tun',
    assetId: 'VES-00001',
    type: 'Tun',
    manufacturer: 'BREWHA',
    status: 'active',
    location: 'Brewery / Brew House',
    children: [
      {
        id: '4-1',
        name: 'Mash Tun (Batman)',
        assetId: 'VES-00002',
        type: 'Tun',
        manufacturer: 'BREWHA',
        status: 'active',
        location: 'Brewery / Brew House',
        parentId: '4',
      },
      {
        id: '4-2',
        name: 'Mash Tun (Joker)',
        assetId: 'VES-00003',
        type: 'Tun',
        manufacturer: 'BREWHA',
        status: 'active',
        location: 'Brewery / Brew House',
        parentId: '4',
      },
      {
        id: '4-3',
        name: 'Mash Tun (Thor)',
        assetId: 'VES-00004',
        type: 'Tun',
        manufacturer: 'BREWHA',
        status: 'active',
        location: 'Brewery / Brew House',
        parentId: '4',
      },
    ],
  },
];

// ── KPIs for side panel ───────────────────────────────────────────────────────

export const KPIS: KPI[] = [
  { label: 'Maint. Cost YTD', value: '$405k' },
  { label: 'MTTR avg', value: '5hrs 12min', trend: 'up', trendLabel: '+2%' },
  { label: 'Downtime YTD', value: '11hrs 9min' },
  { label: 'Cost of Ownership', value: '$896k' },
];

// ── Activity feed ─────────────────────────────────────────────────────────────

export const ACTIVITY: ActivityItem[] = [
  {
    id: 'a1',
    icon: 'wrench',
    title: 'Work Order Completed',
    description: 'Quarterly maintenance inspection completed. All systems nominal.',
    timestamp: '2 hours ago',
    user: 'John D.',
  },
  {
    id: 'a2',
    icon: 'info',
    title: 'Status Updated',
    description: 'Asset status changed from Active to Manufacturer Discontinued.',
    timestamp: '3 days ago',
    user: 'Sarah M.',
  },
  {
    id: 'a3',
    icon: 'paperclip',
    title: 'Attachment Added',
    description: 'Maintenance manual v3.2 attached.',
    timestamp: '1 week ago',
    user: 'Mike T.',
  },
  {
    id: 'a4',
    icon: 'wrench',
    title: 'Work Order Created',
    description: 'Scheduled preventive maintenance — annual inspection.',
    timestamp: '2 weeks ago',
    user: 'John D.',
  },
];

// ── Specs ─────────────────────────────────────────────────────────────────────

export const SPECS: SpecSection[] = [
  {
    title: 'Material',
    fields: [
      { label: 'Material', value: '304 Stainless Steel' },
      { label: 'Finish', value: 'Electropolished' },
    ],
  },
  {
    title: 'Attributes',
    fields: [
      { label: 'Capacity', value: '10 BBL' },
      { label: 'Diameter', value: '36"' },
      { label: 'Height', value: '72"' },
      { label: 'Wall Thickness', value: '3mm' },
      { label: 'Ball Valve', value: '2" TC' },
    ],
  },
  {
    title: 'Catalog',
    fields: [
      { label: 'Design Flow', value: '10 GPM' },
      { label: 'Design Head', value: '45 ft' },
      { label: 'Motor Rating', value: '2.5 HP' },
      { label: 'Control Method', value: 'Variable Frequency Drive' },
    ],
  },
];

// ── Locations ─────────────────────────────────────────────────────────────────

export type LocationType = 'Site' | 'Building' | 'Floor' | 'Area' | 'Line' | 'Room';

export interface LocationNode {
  id: string;
  name: string;
  code: string;
  type: LocationType;
  use?: 'Inventory';
  active: boolean;
  parentId?: string;
  children?: LocationNode[];
}

export const LOCATIONS: LocationNode[] = [
  {
    id: 'loc1', name: 'Brewery Co. HQ', code: 'SITE-001', type: 'Site', active: true,
    children: [{
      id: 'loc1-1', name: 'Main Brewery Building', code: 'BLDG-001', type: 'Building', active: true, parentId: 'loc1',
      children: [{
        id: 'loc1-1-1', name: 'Production Floor', code: 'FLR-001', type: 'Floor', active: true, parentId: 'loc1-1',
        children: [{
          id: 'loc1-1-1-1', name: 'Brew House Area', code: 'AREA-001', type: 'Area', active: true, parentId: 'loc1-1-1',
          children: [
            { id: 'loc1-1-1-1-1', name: 'Line 1', code: 'LINE-001', type: 'Line', active: true, parentId: 'loc1-1-1-1' },
            { id: 'loc1-1-1-1-2', name: 'Line 2', code: 'LINE-002', type: 'Line', active: true, parentId: 'loc1-1-1-1' },
            { id: 'loc1-1-1-1-3', name: 'Inventory Room', code: 'RM-001', type: 'Room', use: 'Inventory', active: true, parentId: 'loc1-1-1-1' },
          ],
        }],
      }],
    }],
  },
];

// ── Users ─────────────────────────────────────────────────────────────────────

export type UserRole = 'Maintenance Admin' | 'Maintenance Requester' | 'Technician';
export type UserStatus = 'active' | 'inactive';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  hourlyRate?: number;
  initials: string;
  avatarColor?: string;
}

export const USERS: AppUser[] = [
  { id: 'u1', name: 'lakshay.grover_requester-testing@si-eam', email: 'lakshay.grover_requester-testing@si-eam.com', role: 'Maintenance Requester', status: 'active', initials: 'L', avatarColor: '#2563eb' },
  { id: 'u2', name: 'shivaniii1 giri', email: 'shivani.giri@si-eam.com', role: 'Maintenance Admin', status: 'active', initials: 'SG', avatarColor: '#0891b2' },
  { id: 'u3', name: 'RUPA MANASA', email: 'rupa.manasa@si-eam.com', role: 'Maintenance Requester', status: 'inactive', initials: 'RM', avatarColor: '#7c3aed' },
  { id: 'u4', name: 'Chetan Sengar', email: 'chetan.sengar@si-eam.com', role: 'Maintenance Admin', status: 'inactive', initials: 'CS', avatarColor: '#059669' },
  { id: 'u5', name: 'aman.mishra@si-eam.com', email: 'aman.mishra@si-eam.com', role: 'Maintenance Admin', status: 'inactive', initials: 'A', avatarColor: '#16a34a' },
  { id: 'u6', name: 'dominick.bagnoli@si-eam.com', email: 'dominick.bagnoli@si-eam.com', role: 'Maintenance Admin', status: 'active', hourlyRate: 0, initials: 'D', avatarColor: '#2563eb' },
  { id: 'u7', name: 'neliwe7237@hotkev.com', email: 'neliwe7237@hotkev.com', role: 'Maintenance Requester', status: 'active', initials: 'N', avatarColor: '#0891b2' },
  { id: 'u8', name: 'timothy.pica@si-eam.com', email: 'timothy.pica@si-eam.com', role: 'Maintenance Admin', status: 'inactive', initials: 'T', avatarColor: '#7c3aed' },
  { id: 'u9', name: 'LAkshay', email: 'sosote7662@aganseo.com', role: 'Maintenance Admin', status: 'active', hourlyRate: 0, initials: 'L', avatarColor: '#2563eb' },
  { id: 'u10', name: 'nihal.singh@si-eam.com', email: 'nihal.singh@si-eam.com', role: 'Maintenance Admin', status: 'inactive', initials: 'N', avatarColor: '#0891b2' },
  { id: 'u11', name: 'ucerdb1710@minitts.net', email: 'ucerdb1710@minitts.net', role: 'Maintenance Admin', status: 'active', hourlyRate: 0, initials: 'U', avatarColor: '#7c3aed' },
];

// ── Asset info form fields ────────────────────────────────────────────────────

export interface AssetFormData {
  name: string;
  assetId: string;
  description: string;
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;
  type: string;
  location: string;
  installDate: string;
  warrantyExpiry: string;
  expectedLifespan: number;
  depreciation: number;
  purchaseCost: string;
  replacementCost: string;
  vendorSupplier: string;
  notes: string;
}

export const DEFAULT_FORM: AssetFormData = {
  name: 'Hot Liquor Tank (Hazy IPA)',
  assetId: 'TAN-00002',
  description: 'Primary hot liquor tank for Hazy IPA production line.',
  manufacturer: 'BREWHA',
  modelNumber: 'HLT-10BBL',
  serialNumber: 'BH-2019-4421',
  type: 'Tank',
  location: 'Brewery / Brew House',
  installDate: '2018-06-25',
  warrantyExpiry: '2024-03-15',
  expectedLifespan: 15,
  depreciation: 10,
  purchaseCost: '$491,000.00',
  replacementCost: '$520,000.00',
  vendorSupplier: 'BREWHA Equipment',
  notes: 'Requires annual descaling. Last descaled Q1 2024.',
};

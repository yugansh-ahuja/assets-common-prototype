import React, { useState, useCallback } from 'react';
import {
  ASSETS,
  KPIS,
  ACTIVITY,
  SPECS,
  DEFAULT_FORM,
  USERS,
  LOCATIONS,
  type Asset,
  type AssetFormData,
  type AppUser,
  type LocationNode,
  type LocationType,
} from './data';

// ── Icon helpers ──────────────────────────────────────────────────────────────
function Icon({ name, size = 14 }: { name: string; size?: number }) {
  const icons: Record<string, string> = {
    grid: '⊞',
    list: '☰',
    search: '🔍',
    plus: '+',
    filter: '⊟',
    sort: '⇅',
    chevron_right: '›',
    chevron_down: '⌄',
    chevron_up: '⌃',
    chevron_left: '‹',
    close: '✕',
    edit: '✎',
    more: '⋯',
    location: '◉',
    wrench: '⚙',
    info: 'ℹ',
    paperclip: '📎',
    camera: '📷',
    up_arrow: '↑',
    down_arrow: '↓',
    asset: '◈',
    tank: '⬡',
    filter_icon: '⬟',
    kettle: '⬠',
    hierarchy: '⊤',
    spec: '≡',
    activity: '◷',
    attachment: '📂',
    pm: '📋',
    home: '⌂',
    assets: '◈',
    work: '⚒',
    reports: '⊞',
    settings: '⚙',
    delete: '⌫',
    refresh: '↺',
    expand: '⤢',
    collapse: '⤡',
    check: '✓',
    star: '★',
    bell: '🔔',
    user: '👤',
  };
  return <span style={{ fontSize: size, lineHeight: 1 }}>{icons[name] ?? '•'}</span>;
}

// ── Asset type icon ───────────────────────────────────────────────────────────
function assetEmoji(type: Asset['type']) {
  const m: Record<string, string> = {
    Tank: '🫙', Kettle: '🪣', Colander: '🫘', Filter: '🫘', Tun: '🛢', Vessel: '🛢',
  };
  return m[type] ?? '◈';
}

// ── Status/type pills ─────────────────────────────────────────────────────────
function TypePill({ type }: { type: Asset['type'] }) {
  const cls: Record<string, string> = {
    Tank: 'pill-tank', Kettle: 'pill-kettle', Tun: 'pill-tun', Vessel: 'pill-vessel',
    Colander: 'pill-colander', Filter: 'pill-filter',
  };
  return <span className={`pill ${cls[type] ?? 'pill-tank'}`}>{type}</span>;
}

function StatusPill({ asset }: { asset: Asset }) {
  if (asset.discontinued) return <span className="pill pill-disc">Manufacturer Discontinued</span>;
  if (asset.status === 'inactive') return <span className="pill pill-inactive">Inactive</span>;
  return <span className="pill pill-active">Active</span>;
}

// ── Location type pill ────────────────────────────────────────────────────────
function LocationTypePill({ type }: { type: LocationType }) {
  const cls: Record<LocationType, string> = {
    Site: 'pill-loc-site', Building: 'pill-loc-building', Floor: 'pill-loc-floor',
    Area: 'pill-loc-area', Line: 'pill-loc-line', Room: 'pill-loc-room',
  };
  return <span className={`pill ${cls[type]}`}>{type}</span>;
}

// ── Flatten locations for flat-list rendering with depth ──────────────────────
type FlatLocation = LocationNode & { depth: number };

function flattenLocs(nodes: LocationNode[], expanded: Set<string>): FlatLocation[] {
  const result: FlatLocation[] = [];
  function walk(list: LocationNode[], depth: number) {
    for (const n of list) {
      result.push({ ...n, depth });
      if (n.children?.length && expanded.has(n.id)) walk(n.children, depth + 1);
    }
  }
  walk(nodes, 0);
  return result;
}

// ── Flatten assets for flat-list rendering with depth ────────────────────────
type FlatAsset = Asset & { depth: number };

function flattenVisible(assets: Asset[], expanded: Set<string>): FlatAsset[] {
  const result: FlatAsset[] = [];
  function walk(list: Asset[], depth: number) {
    for (const a of list) {
      result.push({ ...a, depth });
      if (a.children?.length && expanded.has(a.id)) {
        walk(a.children, depth + 1);
      }
    }
  }
  walk(assets, 0);
  return result;
}

// ── Top Navigation ────────────────────────────────────────────────────────────
function TopNav({ onAddAsset }: { onAddAsset: () => void }) {
  return (
    <nav className="top-nav">
      <div className="nav-logo">
        <div className="nav-logo-mark">Si</div>
        <span className="nav-app-name">MMM</span>
      </div>
      <div className="nav-divider" />
      <div className="nav-breadcrumb">
        <span>Brewery Co.</span>
        <Icon name="chevron_right" size={12} />
        <span className="nav-breadcrumb-active">Assets</span>
      </div>
      <div className="nav-spacer" />
      <div className="nav-actions">
        <button className="nav-icon-btn" title="Search"><Icon name="search" size={16} /></button>
        <button className="nav-icon-btn" title="Notifications"><Icon name="bell" size={16} /></button>
        <div className="nav-avatar" title="Profile">YA</div>
      </div>
    </nav>
  );
}

// ── Left Nav ──────────────────────────────────────────────────────────────────
function LeftNav({ active, onNavigate }: { active: string; onNavigate: (page: string) => void }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const items = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'assets', icon: 'assets', label: 'Assets' },
    { id: 'work', icon: 'work', label: 'Work Orders' },
    { id: 'reports', icon: 'reports', label: 'Reports' },
  ];
  const settingsItems = [
    { id: 'users', label: 'Manage Users' },
    { id: 'people', label: 'Manage People' },
    { id: 'locations', label: 'Manage Locations' },
    { id: 'imports', label: 'Manage Imports' },
    { id: 'auditlogs', label: 'Audit Logs' },
    { id: 'workorders', label: 'Manage Workorders' },
  ];
  return (
    <nav className="left-nav" style={{ position: 'relative' }}>
      {items.map(item => (
        <button
          key={item.id}
          className={`left-nav-item ${active === item.id ? 'active' : ''}`}
          title={item.label}
          onClick={() => { onNavigate(item.id); setSettingsOpen(false); }}
        >
          <Icon name={item.icon} size={18} />
        </button>
      ))}
      <div className="left-nav-spacer" />
      <div style={{ position: 'relative' }}>
        <button
          className={`left-nav-item ${settingsOpen || active === 'settings' ? 'active' : ''}`}
          title="Settings"
          onClick={() => setSettingsOpen(v => !v)}
        >
          <Icon name="settings" size={18} />
        </button>
        {settingsOpen && (
          <div className="settings-submenu">
            <div className="settings-submenu-title">Settings</div>
            {settingsItems.map(item => (
              <div
                key={item.id}
                className={`settings-submenu-item ${active === item.id ? 'active' : ''}`}
                onClick={() => { onNavigate(item.id); setSettingsOpen(false); }}
              >
                {item.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

// ── Assets Table ──────────────────────────────────────────────────────────────
interface TableProps {
  assets: Asset[];
  selectedId: string | null;
  onSelect: (a: Asset) => void;
  onEdit: (a: Asset) => void;
  loading?: boolean;
  empty?: boolean;
}

function AssetsTable({ assets, selectedId, onSelect, onEdit, loading, empty }: TableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['1', '2', '3', '4']));

  const toggle = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <span className="loading-text">Loading assets...</span>
      </div>
    );
  }

  if (empty || assets.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">◈</div>
        <div className="empty-title">No assets found</div>
        <div className="empty-desc">Add your first asset or adjust your search filters.</div>
        <button className="btn btn-primary"><Icon name="plus" /> Add Asset</button>
      </div>
    );
  }

  const rows = flattenVisible(assets, expanded);

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th style={{ width: '38%' }}><div className="th-inner">Asset Name <Icon name="sort" size={11} /></div></th>
            <th style={{ width: '12%' }}><div className="th-inner">Asset ID</div></th>
            <th style={{ width: '12%' }}><div className="th-inner">Type</div></th>
            <th style={{ width: '14%' }}><div className="th-inner">Manufacturer</div></th>
            <th style={{ width: '14%' }}><div className="th-inner">Status</div></th>
            <th style={{ width: '10%' }}><div className="th-inner">Location</div></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(asset => {
            const hasChildren = (asset.children?.length ?? 0) > 0;
            const isExpanded = expanded.has(asset.id);
            const isSelected = selectedId === asset.id;
            const indentPx = asset.depth * 20;

            return (
              <tr
                key={asset.id}
                className={isSelected ? 'selected' : ''}
                onClick={() => onSelect(asset)}
                onDoubleClick={() => onEdit(asset)}
              >
                <td>
                  <div className="td-name" style={{ paddingLeft: indentPx }}>
                    {hasChildren ? (
                      <button className="expand-btn" onClick={e => toggle(asset.id, e)}>
                        {isExpanded ? <Icon name="chevron_down" size={10} /> : <Icon name="chevron_right" size={10} />}
                      </button>
                    ) : (
                      <span style={{ width: 18, display: 'inline-block' }} />
                    )}
                    <div className="asset-icon">{assetEmoji(asset.type)}</div>
                    <span className={asset.depth > 0 ? 'asset-name asset-name-muted' : 'asset-name'}>
                      {asset.name}
                    </span>
                  </div>
                </td>
                <td className="td-id">{asset.assetId}</td>
                <td><TypePill type={asset.type} /></td>
                <td style={{ color: 'var(--text-secondary)' }}>{asset.manufacturer}</td>
                <td><StatusPill asset={asset} /></td>
                <td>
                  <div className="td-location">
                    <span className="location-icon"><Icon name="location" size={11} /></span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 100 }}>
                      {asset.location.split(' / ').pop()}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ total, page, perPage, onChange }: { total: number; page: number; perPage: number; onChange: (p: number) => void }) {
  const pages = Math.ceil(total / perPage);
  return (
    <div className="pagination-bar">
      <span className="pagination-info">
        {Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)} of {total} assets
      </span>
      <div className="pagination-pages">
        <button className="page-btn" disabled={page <= 1} onClick={() => onChange(page - 1)}><Icon name="chevron_left" size={12} /></button>
        {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
          <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => onChange(p)}>{p}</button>
        ))}
        <button className="page-btn" disabled={page >= pages} onClick={() => onChange(page + 1)}><Icon name="chevron_right" size={12} /></button>
      </div>
    </div>
  );
}

// ── KPI Detail ────────────────────────────────────────────────────────────────
function KpiDetail({ label }: { label: string }) {
  const [mttrRange, setMttrRange] = useState<'3M' | '6M' | '12M'>('12M');

  if (label === 'Maint. Cost YTD') {
    return (
      <div className="kpi-detail">
        <div className="kpi-detail-row"><span>Total</span><strong>$405,561</strong></div>
        <div className="kpi-detail-row"><span>Labor</span><strong>$289,450</strong></div>
        <div className="kpi-detail-row"><span>Parts</span><strong>$197,870</strong></div>
        <div className="kpi-detail-sep" />
        <div className="kpi-detail-row dim"><span>Lifetime Total</span><span>$1,215,000</span></div>
        <div className="kpi-detail-row dim"><span>Lifetime Labor</span><span>$867,890</span></div>
        <div className="kpi-detail-row dim"><span>Lifetime Parts</span><span>$591,450</span></div>
        <div className="kpi-ratio">
          <span>Labor 59%</span>
          <div className="kpi-ratio-bar"><div className="kpi-ratio-fill" style={{ width: '59%', background: 'var(--accent-teal)' }} /></div>
          <span>Parts 41%</span>
        </div>
      </div>
    );
  }

  if (label === 'MTTR avg') {
    const pts: Record<string, number[]> = {
      '3M':  [4,6,5,3,7,5,4,6,5,4,5,6],
      '6M':  [6,5,7,4,5,6,5,3,7,5,4,6,5,7,4,5,6,5,4,3,5,6,5,4],
      '12M': [7,6,5,7,6,5,4,6,5,4,7,6,5,4,5,6,5,4,3,5,6,5,4,5,6,5,4,3,5,6,5,4,5,5,4,5,6,5,4,5,5,4,5,6,5,4,5,5],
    };
    const points = pts[mttrRange];
    const W = 220, H = 52;
    const mx = Math.max(...points), mn = Math.min(...points);
    const poly = points.map((v, i) => {
      const x = (i / (points.length - 1)) * W;
      const y = H - ((v - mn) / (mx - mn || 1)) * H * 0.9 - H * 0.05;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
    const benchY = (H - ((3.75 - mn) / (mx - mn || 1)) * H * 0.9 - H * 0.05).toFixed(1);

    return (
      <div className="kpi-detail">
        <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
          {(['3M', '6M', '12M'] as const).map(r => (
            <button key={r} className={`kpi-range-btn ${mttrRange === r ? 'active' : ''}`}
              onClick={e => { e.stopPropagation(); setMttrRange(r); }}>{r}</button>
          ))}
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 52, overflow: 'visible', display: 'block' }}>
          <polyline points={poly} fill="none" stroke="var(--accent-teal)" strokeWidth="1.5" strokeLinejoin="round" />
          <line x1="0" y1={benchY} x2={W} y2={benchY} stroke="var(--accent-orange)" strokeWidth="1" strokeDasharray="4,3" />
        </svg>
        <div className="kpi-detail-row dim" style={{ marginTop: 4 }}>
          <span>Asset Type Avg</span><span style={{ color: 'var(--accent-orange)' }}>3h 45m</span>
        </div>
        <div className="kpi-detail-row"><span>Incidents ({mttrRange})</span><strong>12</strong></div>
        <div className="kpi-detail-row"><span>Longest</span><strong>8hrs 30min</strong></div>
      </div>
    );
  }

  if (label === 'Downtime YTD') {
    return (
      <div className="kpi-detail">
        <div className="kpi-detail-row"><span>Planned</span><strong>4hrs 24min</strong></div>
        <div className="kpi-detail-row"><span>Unplanned</span><strong>7hrs 45min</strong></div>
        <div className="kpi-ratio" style={{ marginTop: 6 }}>
          <span>Planned 36%</span>
          <div className="kpi-ratio-bar"><div className="kpi-ratio-fill" style={{ width: '36%', background: 'var(--accent-teal)' }} /></div>
          <span>Unplanned 64%</span>
        </div>
      </div>
    );
  }

  // Cost of Ownership
  return (
    <div className="kpi-detail">
      <div className="kpi-detail-row"><span>Maintenance</span><strong>$405k</strong></div>
      <div className="kpi-detail-row"><span>Depreciation</span><strong>$245k</strong></div>
      <div className="kpi-detail-row"><span>Operations</span><strong>$246k</strong></div>
    </div>
  );
}

// ── Overview tab content ──────────────────────────────────────────────────────
function OverviewTab({ asset }: { asset: Asset }) {
  const [expandedKpi, setExpandedKpi] = useState<string | null>(null);
  const parent = asset.parentId
    ? ASSETS.find(a => a.id === asset.parentId) ?? null
    : null;
  const children = asset.children ?? [];

  return (
    <>
      {/* KPI Cards */}
      <div>
        <div className="section-heading">Performance</div>
        <div className="kpi-grid">
          {KPIS.map(kpi => {
            const expanded = expandedKpi === kpi.label;
            return (
              <div
                key={kpi.label}
                className={`kpi-card ${expanded ? 'kpi-expanded' : ''}`}
                onClick={() => setExpandedKpi(v => v === kpi.label ? null : kpi.label)}
              >
                <div className="kpi-label">{kpi.label}</div>
                <div className="kpi-value">{kpi.value}</div>
                {kpi.trend && (
                  <div className={`kpi-trend ${kpi.trend}`}>
                    <Icon name={kpi.trend === 'up' ? 'up_arrow' : 'down_arrow'} size={10} />
                    {kpi.trendLabel}
                  </div>
                )}
                {expanded && <KpiDetail label={kpi.label} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-column: Activity+Hierarchy | Specs */}
      <div className="overview-cols">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Recent Activity */}
          <div>
            <div className="section-heading">Recent Activity</div>
            <div className="activity-list">
              {ACTIVITY.map(item => (
                <div key={item.id} className="activity-item">
                  <div className="activity-dot" />
                  <div className="activity-content">
                    <div className="activity-title">{item.title}</div>
                    <div className="activity-desc">{item.description}</div>
                    <div className="activity-meta">
                      <span>{item.timestamp}</span>
                      {item.user && <span>{item.user}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hierarchy */}
          {(parent || children.length > 0) && (
            <div>
              <div className="section-heading">Hierarchy</div>
              <div className="hierarchy-tree">
                {parent && (
                  <div className="hierarchy-node">
                    <span className="hierarchy-icon">{assetEmoji(parent.type)}</span>
                    <span className="hierarchy-name">{parent.name}</span>
                    <span className="hierarchy-id">{parent.assetId}</span>
                  </div>
                )}
                <div className={`hierarchy-node current ${parent ? 'hierarchy-indent' : ''}`}>
                  <span className="hierarchy-icon">{assetEmoji(asset.type)}</span>
                  <span className="hierarchy-name">{asset.name}</span>
                  <span className="hierarchy-id">{asset.assetId}</span>
                </div>
                {children.map(child => (
                  <div key={child.id} className="hierarchy-node hierarchy-indent" style={{ paddingLeft: parent ? 40 : 20 }}>
                    <span className="hierarchy-icon">{assetEmoji(child.type)}</span>
                    <span className="hierarchy-name">{child.name}</span>
                    <span className="hierarchy-id">{child.assetId}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Specifications */}
        <div>
          <div className="section-heading">Specifications</div>
          <SpecsTab />
        </div>
      </div>
    </>
  );
}

// ── Specs tab content ─────────────────────────────────────────────────────────
function SpecsTab() {
  return (
    <>
      {SPECS.map(section => (
        <div key={section.title} className="spec-section">
          <div className="spec-section-title">{section.title}</div>
          {section.fields.map(f => (
            <div key={f.label} className="spec-row">
              <span className="spec-label">{f.label}</span>
              <span className="spec-value">{f.value}</span>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

// ── Activity tab content ──────────────────────────────────────────────────────
function ActivityTab() {
  return (
    <div className="activity-list">
      {ACTIVITY.map(item => (
        <div key={item.id} className="activity-item">
          <div className="activity-dot" />
          <div className="activity-content">
            <div className="activity-title">{item.title}</div>
            <div className="activity-desc">{item.description}</div>
            <div className="activity-meta">
              <span>{item.timestamp}</span>
              {item.user && <span>{item.user}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Attachments tab ───────────────────────────────────────────────────────────
function AttachmentsTab() {
  return (
    <div>
      <div className="photo-dropzone">
        <div className="photo-dropzone-icon"><Icon name="camera" size={32} /></div>
        <div className="photo-dropzone-label">Drop files here or click to upload</div>
        <div className="photo-dropzone-hint">PNG, JPG, PDF up to 20MB</div>
      </div>
      <div style={{ marginTop: 16, color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
        No attachments yet
      </div>
    </div>
  );
}

// ── PMs tab ───────────────────────────────────────────────────────────────────
function PMsTab() {
  return (
    <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>
      No preventive maintenance schedules configured
    </div>
  );
}

// ── Side Panel ────────────────────────────────────────────────────────────────
type PanelTab = 'overview' | 'activity' | 'attachments' | 'pms' | 'specs';

function SidePanel({ asset, onClose, onEdit }: { asset: Asset; onClose: () => void; onEdit: () => void }) {
  const [tab, setTab] = useState<PanelTab>('overview');
  const [moreOpen, setMoreOpen] = useState(false);
  const [lifespan, setLifespan] = useState(DEFAULT_FORM.expectedLifespan);

  const tabs: { id: PanelTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'activity', label: 'Activity' },
    { id: 'attachments', label: 'Attachments' },
    { id: 'pms', label: 'PMs' },
    { id: 'specs', label: 'Specs' },
  ];

  return (
    <aside className="side-panel">
      <div className="panel-header">
        <div className="panel-header-top">
          <div className="panel-asset-icon">{assetEmoji(asset.type)}</div>
          <div className="panel-asset-info">
            <div className="panel-asset-name">{asset.name}</div>
            <div className="panel-asset-id">{asset.assetId}</div>
          </div>
          <div className="panel-actions">
            <button className="btn btn-ghost btn-icon" title="Edit" onClick={onEdit}><Icon name="edit" /></button>
            <button className="btn btn-ghost btn-icon" title="Close" onClick={onClose}><Icon name="close" /></button>
          </div>
        </div>
        <div className="panel-tags">
          <TypePill type={asset.type} />
          <StatusPill asset={asset} />
        </div>

        {/* More / Less toggle */}
        <button className="panel-more-toggle" onClick={() => setMoreOpen(v => !v)}>
          {moreOpen ? '▲ Less' : '▼ More'}
        </button>

        {moreOpen && (
          <div className="panel-more-section">
            <div className="panel-more-header">
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Asset Details</span>
              <button className="btn btn-primary" style={{ fontSize: 12, padding: '4px 12px' }} onClick={onEdit}>
                <Icon name="edit" size={12} /> Edit
              </button>
            </div>
            <div className="panel-more-fields">
              <div className="panel-more-field">
                <label>Purchase Price</label>
                <div className="pmf-value">{DEFAULT_FORM.purchaseCost}</div>
              </div>
              <div className="panel-more-field">
                <label>Installation Date</label>
                <div className="pmf-value">06/25/2018</div>
              </div>
              <div className="panel-more-field">
                <label>Depreciation</label>
                <div className="pmf-value">{DEFAULT_FORM.depreciation}%</div>
              </div>
              <div className="panel-more-field">
                <label>Vendor / Supplier</label>
                <div className="pmf-value">{DEFAULT_FORM.vendorSupplier}</div>
              </div>
              <div className="panel-more-slider">
                <label style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>
                  Expected Lifespan
                </label>
                <div className="slider-row">
                  <input
                    type="range" min={0} max={30} value={lifespan}
                    onChange={e => setLifespan(Number(e.target.value))}
                    style={{ flex: 1, accentColor: 'var(--accent-teal)' }}
                  />
                  <span className="slider-val">{lifespan} Yrs</span>
                </div>
                <div className="slider-ends"><span>0 Yrs</span><span>30 Yrs</span></div>
              </div>
              <div className="panel-more-catalog">
                <label>Description (Catalog)</label>
                <div className="pmf-value">{DEFAULT_FORM.description}</div>
              </div>
            </div>
          </div>
        )}

        <div className="panel-tabs">
          {tabs.map(t => (
            <button key={t.id} className={`panel-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="panel-body">
        {tab === 'overview'     && <OverviewTab asset={asset} />}
        {tab === 'activity'     && <ActivityTab />}
        {tab === 'attachments'  && <AttachmentsTab />}
        {tab === 'pms'          && <PMsTab />}
        {tab === 'specs'        && <SpecsTab />}
      </div>
    </aside>
  );
}

// ── Asset Form ────────────────────────────────────────────────────────────────
function AssetForm({ asset, onClose, onSave }: { asset: Asset | null; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState<AssetFormData>({
    ...DEFAULT_FORM,
    name: asset?.name ?? DEFAULT_FORM.name,
    assetId: asset?.assetId ?? DEFAULT_FORM.assetId,
    type: asset?.type ?? DEFAULT_FORM.type,
    location: asset?.location ?? DEFAULT_FORM.location,
  });

  function set(key: keyof AssetFormData, value: string | number) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  const isEdit = !!asset;

  return (
    <aside className="asset-form-panel">
      <div className="form-header">
        <div className="form-title">{isEdit ? 'Asset Information' : 'Add Asset'}</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onSave}><Icon name="check" size={12} /> Save</button>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><Icon name="close" /></button>
        </div>
      </div>

      <div className="form-body">
        {/* Top: image + identity */}
        <div className="form-section" style={{ paddingBottom: 0 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div className="form-img-placeholder">
              <Icon name="camera" size={22} />
              <span>Add Photo</span>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="form-field full">
                <label>Asset Name <span style={{ color: 'var(--accent-teal)' }}>*</span></label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Type <span style={{ color: 'var(--accent-teal)' }}>*</span></label>
                  <select value={form.type} onChange={e => set('type', e.target.value)}>
                    {['Tank','Kettle','Colander','Filter','Tun','Vessel'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Asset #</label>
                  <input type="text" value={form.assetId} onChange={e => set('assetId', e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Manufacturer + Model */}
        <div className="form-section">
          <div className="form-row">
            <div className="form-field">
              <label>Manufacturer</label>
              <input type="text" value={form.manufacturer} onChange={e => set('manufacturer', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Model</label>
              <input type="text" value={form.modelNumber} onChange={e => set('modelNumber', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Serial #</label>
              <input type="text" value={form.serialNumber} onChange={e => set('serialNumber', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Purchase Price</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 13 }}>$</span>
                <input type="text" value={form.purchaseCost.replace('$', '')} onChange={e => set('purchaseCost', '$' + e.target.value)} style={{ paddingLeft: 24 }} />
              </div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Installation Date</label>
              <input type="date" value={form.installDate} onChange={e => set('installDate', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Depreciation</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number" min={0} max={100}
                  value={form.depreciation}
                  onChange={e => set('depreciation', Number(e.target.value))}
                  style={{ paddingRight: 40 }}
                />
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 12 }}>%</span>
              </div>
            </div>
          </div>

          {/* Expected Lifespan slider */}
          <div className="form-field full" style={{ marginTop: 2 }}>
            <label>Expected Lifespan</label>
            <div className="slider-wrap">
              <div className="slider-value">{form.expectedLifespan} Yrs</div>
              <input
                type="range" min={0} max={30}
                value={form.expectedLifespan}
                onChange={e => set('expectedLifespan', Number(e.target.value))}
                style={{ accentColor: 'var(--accent-teal)' }}
              />
              <div className="slider-labels"><span>0 Yrs</span><span>15 Yrs</span><span>30 Yrs</span></div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Location</label>
              <input type="text" value={form.location} onChange={e => set('location', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Vendor / Supplier</label>
              <select value={form.vendorSupplier} onChange={e => set('vendorSupplier', e.target.value)}>
                <option>BREWHA Equipment</option>
                <option>ProBrewery Supply</option>
                <option>BrewTech</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="form-field full">
            <label>Description</label>
            <textarea
              rows={3}
              maxLength={200}
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
            <div className="form-char-counter">{form.description.length}/200</div>
          </div>
        </div>

        {/* Description (Catalog) — read-only reference */}
        <div className="form-catalog-section">
          <div className="catalog-label">Description (Catalog)</div>
          <div className="catalog-text">
            Hot liquor tank designed for high-volume brewery operations. Constructed from 304 stainless steel with electropolished finish. Capacity: 10 BBL. Compatible with standard brewery CIP systems.
          </div>
        </div>
      </div>

      <div className="form-footer">
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={onSave}><Icon name="check" /> Save Asset</button>
      </div>
    </aside>
  );
}

// ── Manage Users ─────────────────────────────────────────────────────────────
function RolePill({ role }: { role: AppUser['role'] }) {
  return <span className="pill pill-role">{role}</span>;
}

function UserStatusDot({ status }: { status: AppUser['status'] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
        background: status === 'active' ? 'var(--accent-green)' : 'var(--accent-orange)',
      }} />
      <span style={{ color: 'var(--text-secondary)', fontSize: 13, textTransform: 'capitalize' }}>{status}</span>
    </div>
  );
}

function AddUserPanel({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', product: 'Maintenance Manager for Manufacturing', role: '' });
  function set(k: keyof typeof form, v: string) { setForm(p => ({ ...p, [k]: v })); }
  return (
    <aside className="asset-form-panel">
      <div className="form-header" style={{ justifyContent: 'space-between' }}>
        <div className="form-title">Add New User</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary"><Icon name="check" /> Send Invite</button>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><Icon name="close" /></button>
        </div>
      </div>
      <div className="form-body">
        <div className="form-section">
          <div className="form-row">
            <div className="form-field full">
              <label>First Name</label>
              <input type="text" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field full">
              <label>Last Name</label>
              <input type="text" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field full">
              <label>Email *</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 13 }}>✉</span>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} style={{ paddingLeft: 30 }} />
              </div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field full">
              <label>Product *</label>
              <select value={form.product} onChange={e => set('product', e.target.value)}>
                <option>Maintenance Manager for Manufacturing</option>
                <option>Asset Essentials</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field full">
              <label>Role *</label>
              <select value={form.role} onChange={e => set('role', e.target.value)}>
                <option value="">Select Role</option>
                <option>Maintenance Admin</option>
                <option>Maintenance Requester</option>
                <option>Technician</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function EditUserPanel({ user, onClose }: { user: AppUser; onClose: () => void }) {
  const [form, setForm] = useState({ firstName: user.name.split(' ')[0] ?? '', lastName: user.name.split(' ').slice(1).join(' '), email: user.email, role: user.role, status: user.status });
  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) { setForm(p => ({ ...p, [k]: v })); }
  return (
    <aside className="asset-form-panel">
      <div className="form-header" style={{ justifyContent: 'space-between' }}>
        <div className="form-title">Edit User</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary"><Icon name="check" /> Save</button>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><Icon name="close" /></button>
        </div>
      </div>
      <div className="form-body">
        <div className="form-section">
          <div className="form-row">
            <div className="form-field half">
              <label>First Name</label>
              <input type="text" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
            </div>
            <div className="form-field half">
              <label>Last Name</label>
              <input type="text" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field full">
              <label>Email</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: 13 }}>✉</span>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} style={{ paddingLeft: 30 }} />
              </div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field full">
              <label>Role</label>
              <select value={form.role} onChange={e => set('role', e.target.value as typeof form.role)}>
                <option>Maintenance Admin</option>
                <option>Maintenance Requester</option>
                <option>Technician</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field full">
              <label>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value as typeof form.status)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          {user.hourlyRate !== undefined && (
            <div className="form-row">
              <div className="form-field full">
                <label>Hourly Rate ($)</label>
                <input type="number" defaultValue={user.hourlyRate} min={0} step={0.01} />
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function ManageUsers() {
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const filtered = search.trim()
    ? USERS.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    : USERS;

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <div className="page-header">
          <h1 className="page-title">Manage Users</h1>
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> New User
            </button>
          </div>
        </div>
        <div className="toolbar">
          <div className="search-box">
            <Icon name="search" size={13} />
            <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '22%' }}><div className="th-inner">User</div></th>
                <th style={{ width: '26%' }}><div className="th-inner">Email</div></th>
                <th style={{ width: '22%' }}><div className="th-inner">Roles <Icon name="filter_icon" size={10} /></div></th>
                <th style={{ width: '14%' }}><div className="th-inner">Status <Icon name="filter_icon" size={10} /></div></th>
                <th style={{ width: '16%' }}><div className="th-inner">Hourly Rate</div></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr
                  key={u.id}
                  className={selectedUser?.id === u.id ? 'selected' : ''}
                  onClick={() => { setSelectedUser(u); setShowAdd(false); }}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                        background: u.avatarColor ?? 'var(--accent-teal-dim)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700, color: '#fff',
                      }}>{u.initials}</div>
                      <span style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{u.email}</td>
                  <td><RolePill role={u.role} /></td>
                  <td><UserStatusDot status={u.status} /></td>
                  <td>
                    {u.hourlyRate !== undefined ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '4px 8px', maxWidth: 100 }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>$</span>
                        <span style={{ fontSize: 13 }}>{u.hourlyRate.toFixed(2)}</span>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pagination-bar">
          <span className="pagination-info">Page 1 of 1</span>
          <div className="pagination-pages">
            <button className="page-btn" disabled><Icon name="chevron_left" size={12} /></button>
            <button className="page-btn active">1</button>
            <button className="page-btn" disabled><Icon name="chevron_right" size={12} /></button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: 12 }}>
            Items
            <select style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius)', padding: '2px 6px', fontSize: 12 }}>
              <option>20</option>
              <option>50</option>
              <option>100</option>
            </select>
          </div>
        </div>
      </div>
      {showAdd && <AddUserPanel onClose={() => setShowAdd(false)} />}
      {!showAdd && selectedUser && <EditUserPanel user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </div>
  );
}

// ── Add Location Panel ────────────────────────────────────────────────────────
function AddLocationPanel({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    name: '', code: '', description: '', type: '' as LocationType | '',
    parent: '', useInventory: false,
  });
  function set<K extends keyof typeof form>(k: K, v: typeof form[K]) { setForm(p => ({ ...p, [k]: v })); }
  return (
    <aside className="asset-form-panel">
      <div className="form-header" style={{ justifyContent: 'space-between' }}>
        <div className="form-title">New Location</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary">Add Location</button>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><Icon name="close" /></button>
        </div>
      </div>
      <div className="form-body">
        <div className="form-section">
          <div className="form-row">
            <div className="form-field full">
              <label>Location Name *</label>
              <input type="text" placeholder="Enter location name" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field full">
              <label>Location Code</label>
              <input type="text" placeholder="e.g. SITE-001" value={form.code} onChange={e => set('code', e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field full">
              <label>Location Description</label>
              <textarea
                placeholder="Description"
                maxLength={500}
                rows={4}
                value={form.description}
                onChange={e => set('description', e.target.value)}
              />
              <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{form.description.length}/500</div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field full">
              <label>Use</label>
              <label className="toggle-switch" style={{ gap: 10 }}>
                <input type="checkbox" checked={form.useInventory} onChange={e => set('useInventory', e.target.checked)} />
                <span className="toggle-track" />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Inventory</span>
              </label>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field full">
              <label>Type *</label>
              <select value={form.type} onChange={e => set('type', e.target.value as LocationType | '')}>
                <option value="">Select Type</option>
                <option value="Site">Site</option>
                <option value="Building">Building</option>
                <option value="Floor">Floor</option>
                <option value="Area">Area</option>
                <option value="Line">Line</option>
                <option value="Room">Room</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field full">
              <label>Add Parent Location</label>
              <select value={form.parent} onChange={e => set('parent', e.target.value)}>
                <option value="">None</option>
                <option value="loc1">Brewery Co. HQ (Site)</option>
                <option value="loc1-1">Main Brewery Building (Building)</option>
                <option value="loc1-1-1">Production Floor (Floor)</option>
                <option value="loc1-1-1-1">Brew House Area (Area)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ── Manage Locations ──────────────────────────────────────────────────────────
function ManageLocations() {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['loc1', 'loc1-1', 'loc1-1-1', 'loc1-1-1-1']));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingActive, setEditingActive] = useState(true);
  const [editingInventory, setEditingInventory] = useState(false);
  const [ctxId, setCtxId] = useState<string | null>(null);
  const [ctxPos, setCtxPos] = useState({ x: 0, y: 0 });
  const [showAdd, setShowAdd] = useState(false);

  const flat = flattenLocs(LOCATIONS, expanded);
  const visible = search.trim()
    ? flat.filter(n => n.name.toLowerCase().includes(search.toLowerCase()) || n.code.toLowerCase().includes(search.toLowerCase()))
    : flat;

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function startEdit(node: FlatLocation, e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest('.btn-icon-sm, .expand-btn')) return;
    setEditingId(node.id);
    setEditingName(node.name);
    setEditingActive(node.active);
    setEditingInventory(node.use === 'Inventory');
    setCtxId(null);
  }

  function openCtx(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setCtxPos({ x: e.clientX, y: e.clientY });
    setCtxId(id);
    setEditingId(null);
  }

  function ctxMenuItems(type: LocationType) {
    const base = [{ label: 'Rename', action: 'rename' }];
    if (type === 'Line') return [...base, { label: 'Add Line', action: 'add' }, { label: 'Deactivate', action: 'deactivate' }];
    if (type === 'Floor') return [...base, { label: 'Add Floor', action: 'add' }, { label: 'Add Floor + Sublocations', action: 'add-sub' }, { label: 'Deactivate', action: 'deactivate' }, { label: 'Delete', action: 'delete' }, { label: 'Delete + Sublocations', action: 'delete-sub' }];
    if (type === 'Building') return [...base, { label: 'Add Floor', action: 'add' }, { label: 'Deactivate', action: 'deactivate' }, { label: 'Delete', action: 'delete' }, { label: 'Delete + Sublocations', action: 'delete-sub' }];
    return [...base, { label: 'Deactivate', action: 'deactivate' }, { label: 'Delete', action: 'delete' }];
  }

  const ctxNode = ctxId ? flat.find(n => n.id === ctxId) : null;

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <div className="page-header">
          <h1 className="page-title">Manage Locations</h1>
          <div className="page-actions">
            <button className="btn btn-ghost">Import</button>
            <button className="btn btn-primary" onClick={() => { setShowAdd(true); setEditingId(null); setCtxId(null); }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Location
            </button>
          </div>
        </div>
        <div className="toolbar">
          <div className="search-box">
            <Icon name="search" size={13} />
            <input placeholder="Search locations..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: '40%' }}><div className="th-inner">Name</div></th>
                <th style={{ width: '18%' }}><div className="th-inner">Code</div></th>
                <th style={{ width: '18%' }}><div className="th-inner">Type</div></th>
                <th style={{ width: '14%' }}><div className="th-inner">Use</div></th>
                <th style={{ width: '10%' }}></th>
              </tr>
            </thead>
            <tbody>
              {visible.map(node => (
                <React.Fragment key={node.id}>
                  <tr
                    className={editingId === node.id ? 'selected' : ''}
                    onClick={e => startEdit(node, e)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: node.depth * 20 }}>
                        {node.children?.length ? (
                          <button
                            className="expand-btn"
                            onClick={e => { e.stopPropagation(); toggleExpand(node.id); }}
                          >
                            {expanded.has(node.id) ? <Icon name="chevron_down" size={11} /> : <Icon name="chevron_right" size={11} />}
                          </button>
                        ) : (
                          <span style={{ width: 20, flexShrink: 0 }} />
                        )}
                        {editingId === node.id ? (
                          <input
                            className="loc-edit-input"
                            value={editingName}
                            autoFocus
                            onChange={e => setEditingName(e.target.value)}
                            onClick={e => e.stopPropagation()}
                          />
                        ) : (
                          <span style={{ fontSize: 13 }}>{node.name}</span>
                        )}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{node.code}</td>
                    <td><LocationTypePill type={node.type} /></td>
                    <td>{node.use === 'Inventory' && <span className="pill pill-inventory">Inventory</span>}</td>
                    <td>
                      <button
                        className="btn-icon-sm"
                        title="More"
                        onClick={e => openCtx(e, node.id)}
                        style={{ margin: '0 auto' }}
                      >⋮</button>
                    </td>
                  </tr>
                  {editingId === node.id && (
                    <tr className="loc-edit-controls-row">
                      <td colSpan={5}>
                        <div className="loc-edit-controls">
                          <label className="loc-edit-check" onClick={e => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={editingInventory}
                              onChange={e => setEditingInventory(e.target.checked)}
                            />
                            <span>Inventory</span>
                          </label>
                          <div className="loc-edit-active" onClick={e => e.stopPropagation()}>
                            <label className="toggle-switch">
                              <input
                                type="checkbox"
                                checked={editingActive}
                                onChange={e => setEditingActive(e.target.checked)}
                              />
                              <span className="toggle-track" />
                            </label>
                            <span>{editingActive ? 'Active' : 'Inactive'}</span>
                          </div>
                          <div className="loc-edit-btns">
                            <button className="btn-icon-sm" title="Cancel" onClick={e => { e.stopPropagation(); setEditingId(null); }}>✕</button>
                            <button className="btn-icon-sm confirm" title="Confirm" onClick={e => { e.stopPropagation(); setEditingId(null); }}>✓</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <AddLocationPanel onClose={() => setShowAdd(false)} />}

      {ctxId && ctxNode && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 490 }} onClick={() => setCtxId(null)} />
          <div className="loc-ctx-menu" style={{ top: ctxPos.y, left: ctxPos.x }}>
            {ctxMenuItems(ctxNode.type).map(item => (
              <div
                key={item.action}
                className={`loc-ctx-item${item.action.startsWith('delete') ? ' danger' : ''}`}
                onClick={() => {
                  if (item.action === 'rename') { startEdit(ctxNode, { target: document.body, stopPropagation: () => {}, clientX: 0, clientY: 0 } as unknown as React.MouseEvent); }
                  setCtxId(null);
                }}
              >{item.label}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Toolbar ───────────────────────────────────────────────────────────────────
function Toolbar({ search, onSearch }: { search: string; onSearch: (v: string) => void }) {
  return (
    <div className="toolbar">
      <div className="search-box">
        <Icon name="search" size={13} />
        <input
          placeholder="Search assets..."
          value={search}
          onChange={e => onSearch(e.target.value)}
        />
      </div>
      <button className="btn btn-ghost"><Icon name="filter_icon" size={13} /> Filter</button>
      <button className="btn btn-ghost"><Icon name="sort" size={13} /> Sort</button>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
type AppView = 'list';
type AppPage = 'assets' | 'users' | 'locations';

export default function App() {
  const [activePage, setActivePage] = useState<AppPage>('assets');
  const [_view, _setView] = useState<AppView>('list');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [search, setSearch] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [editAsset, setEditAsset] = useState<Asset | null | 'new'>('new' as const | null);
  const [showPanel, setShowPanel] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [showLoading, setShowLoading] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  // Reset editAsset init
  const [_editInit] = useState<null>(null);
  void _editInit;

  // Filter assets by search
  const allFlat = ASSETS.flatMap(a => [a, ...(a.children ?? [])]);
  const filtered = search.trim()
    ? ASSETS.filter(a => {
        const term = search.toLowerCase();
        return (
          a.name.toLowerCase().includes(term) ||
          a.assetId.toLowerCase().includes(term) ||
          a.type.toLowerCase().includes(term) ||
          (a.children ?? []).some(c =>
            c.name.toLowerCase().includes(term) || c.assetId.toLowerCase().includes(term)
          )
        );
      })
    : ASSETS;

  const total = allFlat.length;
  const perPage = 20;

  function handleSelectAsset(a: Asset) {
    setSelectedAsset(a);
    setShowPanel(true);
    setShowForm(false);
  }

  function handleEditAsset(a: Asset) {
    setEditAsset(a);
    setShowForm(true);
    setShowPanel(false);
  }

  function handleAddAsset() {
    setEditAsset(null);
    setShowForm(true);
    setShowPanel(false);
  }

  function handleSave() {
    setShowForm(false);
    setSelectedAsset(null);
  }

  function handleClosePanel() {
    setShowPanel(false);
    setSelectedAsset(null);
  }

  function handleCloseForm() {
    setShowForm(false);
  }

  return (
    <div className="app-shell">
      <TopNav onAddAsset={handleAddAsset} />
      <div className="app-body">
        <LeftNav active={activePage} onNavigate={p => setActivePage(p as AppPage)} />
        <div className="main-content">
          {activePage === 'users' ? (
            <ManageUsers />
          ) : activePage === 'locations' ? (
            <ManageLocations />
          ) : (
            /* Full-height row: left column + panel */
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                {/* Page header with right-side actions */}
                <div className="page-header">
                  <h1 className="page-title">Assets</h1>
                  <div className="page-actions">
                    <div className="dropdown-wrap">
                      <button className="btn btn-ghost" onClick={() => setDemoOpen(v => !v)}>
                        Demo <Icon name="chevron_down" size={11} />
                      </button>
                      {demoOpen && (
                        <div className="dropdown-menu">
                          <div className="dropdown-item" onClick={() => { setShowLoading(v => !v); setDemoOpen(false); }}>
                            {showLoading ? '✓ ' : ''}Loading state
                          </div>
                          <div className="dropdown-item" onClick={() => { setShowEmpty(v => !v); setDemoOpen(false); }}>
                            {showEmpty ? '✓ ' : ''}Empty state
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="view-toggle">
                      <button className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="List view"><Icon name="list" size={14} /></button>
                      <button className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Grid view"><Icon name="grid" size={14} /></button>
                    </div>
                    <button className="btn btn-primary" onClick={handleAddAsset}>
                      <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Asset
                    </button>
                  </div>
                </div>

                <Toolbar search={search} onSearch={setSearch} />

                <AssetsTable
                  assets={filtered}
                  selectedId={selectedAsset?.id ?? null}
                  onSelect={handleSelectAsset}
                  onEdit={handleEditAsset}
                  loading={showLoading}
                  empty={showEmpty}
                />
                {!showLoading && !showEmpty && (
                  <Pagination total={total} page={page} perPage={perPage} onChange={setPage} />
                )}
              </div>

              {/* Side panel spans full height */}
              {showPanel && selectedAsset && !showForm && (
                <SidePanel
                  asset={selectedAsset}
                  onClose={handleClosePanel}
                  onEdit={() => handleEditAsset(selectedAsset)}
                />
              )}

              {showForm && (
                <AssetForm
                  asset={editAsset === 'new' ? null : editAsset}
                  onClose={handleCloseForm}
                  onSave={handleSave}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import {
  Layers,
  Globe,
  Server,
  Database,
  HardDrive,
  Box,
  Network,
  ShieldAlert,
} from 'lucide-react'

const ARCHITECTURE_COMPONENTS = [
  {
    role: 'Frontend Client',
    tech: 'React 18 + Vite',
    server: 'Nginx 1.27 Alpine',
    desc: 'SPA client compiled via multi-stage Docker build, reverse proxies /api requests to backend.',
    icon: Globe,
    port: 'Port 80',
    colorClass: 'blue',
  },
  {
    role: 'Backend API',
    tech: 'Node.js 20 + Express',
    server: 'Express REST Router',
    desc: 'Internal service handling vehicle CRUD, PDF validations, and volume streaming.',
    icon: Server,
    port: 'Internal: 5000',
    colorClass: 'indigo',
  },
  {
    role: 'Database Storage',
    tech: 'MongoDB 7.0',
    server: 'Docker Named Volume (mongodb_data)',
    desc: 'Persistent document store for vehicle and document metadata with indexing.',
    icon: Database,
    port: 'Internal: 27017',
    colorClass: 'emerald',
  },
  {
    role: 'Document Storage',
    tech: 'Named Volume (vehicle_documents)',
    server: 'Mounted at /app/uploads',
    desc: 'Survives container recycles, preserves original PDF binary files securely.',
    icon: HardDrive,
    port: 'Volume Mount',
    colorClass: 'purple',
  },
  {
    role: 'Container Orchestration',
    tech: 'Docker Compose',
    server: 'Bridge Network (app-network)',
    desc: 'Isolated bridge network; only frontend port is exposed to host.',
    icon: Box,
    port: 'Compose Orchestrated',
    colorClass: 'amber',
  },
]

export default function ArchitectureCard() {
  return (
    <div className="dashboard-card status-section-card">
      <div className="card-header-clean">
        <div className="card-header-title-box">
          <Layers size={20} className="text-secondary" />
          <h2 className="card-heading">System Architecture &amp; Deployment Topology</h2>
        </div>
        <span className="card-header-badge">Production Architecture</span>
      </div>

      <div className="architecture-grid">
        {ARCHITECTURE_COMPONENTS.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.role} className={`arch-component-card arch-${item.colorClass}`}>
              <div className="arch-card-top">
                <div className="arch-icon-box">
                  <Icon size={20} />
                </div>
                <span className="arch-port-tag">{item.port}</span>
              </div>
              <h3 className="arch-role-title">{item.role}</h3>
              <div className="arch-tech-pill">{item.tech}</div>
              <div className="arch-server-label">{item.server}</div>
              <p className="arch-desc">{item.desc}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}


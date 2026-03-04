import Sidebar from '@/components/layout/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-primary)', position: 'relative' }}>
            {/* Animated Aurora Background */}
            <div className="aurora-bg" />

            {/* Floating Orbs */}
            <div className="floating-orb orb-1" />
            <div className="floating-orb orb-2" />
            <div className="floating-orb orb-3" />

            {/* Grid Pattern Overlay */}
            <div className="grid-pattern" />

            <Sidebar />
            <main
                className="transition-all duration-300 min-h-screen"
                style={{ marginLeft: '280px', padding: '40px 48px', position: 'relative', zIndex: 1 }}
            >
                {children}
            </main>
        </div>
    )
}

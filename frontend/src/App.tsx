import React, { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { QuickActionProvider, useQuickActions } from './context/QuickActionContext'
import { Header } from './components/layout/Header'
import { NavigationTabs } from './components/layout/NavigationTabs'
import { PanelOperativo } from './components/panel/PanelOperativo'
import { DeliveriesView } from './components/delivery/DeliveriesView'
import { BitacoraView } from './components/bitacora/BitacoraView'
import { AforoMonitorView } from './components/aforo/AforoMonitorView'
import { AdminView } from './components/admin/AdminView'
import { LoginView } from './components/auth/LoginView'
import { VisitaModal } from './components/visitas/VisitaModal'
import { DeliveryModal } from './components/delivery/DeliveryModal'
import { PaqueteModal } from './components/delivery/PaqueteModal'
import { BitacoraModal } from './components/bitacora/BitacoraModal'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

const MainAppContent: React.FC = () => {
  const { user, token, isLoading, isAdmin } = useAuth()
  const {
    activeTab,
    isVisitaModalOpen,
    closeVisitaModal,
    isDeliveryModalOpen,
    closeDeliveryModal,
    isPaqueteModalOpen,
    closePaqueteModal,
    isBitacoraModalOpen,
    closeBitacoraModal,
    preselectedDeptoId,
  } = useQuickActions()

  const [refreshKey, setRefreshKey] = useState(0)
  const triggerRefresh = () => setRefreshKey((k) => k + 1)

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-app)',
          color: 'var(--accent-cyan)',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: '3px solid rgba(14, 165, 233, 0.2)',
            borderTopColor: 'var(--accent-cyan)',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }}
        />
        <div style={{ fontSize: 13, letterSpacing: '0.05em' }}>Cargando Sistema de Control de Acceso...</div>
      </div>
    )
  }

  if (!token || !user) {
    return <LoginView />
  }

  return (
    <div className="app-container">
      <Header />
      <NavigationTabs />

      <main className="main-content" key={refreshKey}>
        {activeTab === 'panel' && <PanelOperativo />}
        {activeTab === 'deliveries' && <DeliveriesView />}
        {activeTab === 'bitacora' && <BitacoraView />}
        {activeTab === 'aforo' && <AforoMonitorView />}
        {activeTab === 'admin' && (isAdmin ? <AdminView /> : <PanelOperativo />)}
      </main>

      {/* Global Action Modals */}
      {isVisitaModalOpen && (
        <VisitaModal
          isOpen={isVisitaModalOpen}
          onClose={closeVisitaModal}
          onSuccess={triggerRefresh}
          preselectedDeptoId={preselectedDeptoId}
        />
      )}

      {isDeliveryModalOpen && (
        <DeliveryModal
          isOpen={isDeliveryModalOpen}
          onClose={closeDeliveryModal}
          onSuccess={triggerRefresh}
          preselectedDeptoId={preselectedDeptoId}
        />
      )}

      {isPaqueteModalOpen && (
        <PaqueteModal
          isOpen={isPaqueteModalOpen}
          onClose={closePaqueteModal}
          onSuccess={triggerRefresh}
          preselectedDeptoId={preselectedDeptoId}
        />
      )}

      {isBitacoraModalOpen && (
        <BitacoraModal
          isOpen={isBitacoraModalOpen}
          onClose={closeBitacoraModal}
          onSuccess={triggerRefresh}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <QuickActionProvider>
            <MainAppContent />
          </QuickActionProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

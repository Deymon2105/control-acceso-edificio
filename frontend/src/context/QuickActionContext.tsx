import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

export type NavTab = 'panel' | 'deliveries' | 'bitacora' | 'aforo' | 'admin'

interface QuickActionContextType {
  activeTab: NavTab
  setActiveTab: (tab: NavTab) => void
  isVisitaModalOpen: boolean
  openVisitaModal: (deptoId?: number) => void
  closeVisitaModal: () => void
  isDeliveryModalOpen: boolean
  openDeliveryModal: (deptoId?: number) => void
  closeDeliveryModal: () => void
  isPaqueteModalOpen: boolean
  openPaqueteModal: (deptoId?: number) => void
  closePaqueteModal: () => void
  isBitacoraModalOpen: boolean
  openBitacoraModal: () => void
  closeBitacoraModal: () => void
  preselectedDeptoId: number | null
}

const QuickActionContext = createContext<QuickActionContextType | undefined>(undefined)

export const QuickActionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavTab>('panel')
  const [isVisitaModalOpen, setIsVisitaModalOpen] = useState(false)
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false)
  const [isPaqueteModalOpen, setIsPaqueteModalOpen] = useState(false)
  const [isBitacoraModalOpen, setIsBitacoraModalOpen] = useState(false)
  const [preselectedDeptoId, setPreselectedDeptoId] = useState<number | null>(null)

  const openVisitaModal = useCallback((deptoId?: number) => {
    setPreselectedDeptoId(deptoId ?? null)
    setIsVisitaModalOpen(true)
  }, [])

  const closeVisitaModal = useCallback(() => {
    setIsVisitaModalOpen(false)
    setPreselectedDeptoId(null)
  }, [])

  const openDeliveryModal = useCallback((deptoId?: number) => {
    setPreselectedDeptoId(deptoId ?? null)
    setIsDeliveryModalOpen(true)
  }, [])

  const closeDeliveryModal = useCallback(() => {
    setIsDeliveryModalOpen(false)
    setPreselectedDeptoId(null)
  }, [])

  const openPaqueteModal = useCallback((deptoId?: number) => {
    setPreselectedDeptoId(deptoId ?? null)
    setIsPaqueteModalOpen(true)
  }, [])

  const closePaqueteModal = useCallback(() => {
    setIsPaqueteModalOpen(false)
    setPreselectedDeptoId(null)
  }, [])

  const openBitacoraModal = useCallback(() => {
    setIsBitacoraModalOpen(true)
  }, [])

  const closeBitacoraModal = useCallback(() => {
    setIsBitacoraModalOpen(false)
  }, [])

  // Global Keyboard shortcuts: F2, F3, F4, F8, F9, Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't override if inside an input unless it's a function key
      if (e.key === 'F2') {
        e.preventDefault()
        openVisitaModal()
      } else if (e.key === 'F3') {
        e.preventDefault()
        openDeliveryModal()
      } else if (e.key === 'F4') {
        e.preventDefault()
        openPaqueteModal()
      } else if (e.key === 'F8') {
        e.preventDefault()
        openBitacoraModal()
      } else if (e.key === 'F9') {
        e.preventDefault()
        setActiveTab((prev) => (prev === 'aforo' ? 'panel' : 'aforo'))
      } else if (e.key === 'Escape') {
        // Close topmost modal
        if (isVisitaModalOpen) closeVisitaModal()
        else if (isDeliveryModalOpen) closeDeliveryModal()
        else if (isPaqueteModalOpen) closePaqueteModal()
        else if (isBitacoraModalOpen) closeBitacoraModal()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    openVisitaModal,
    closeVisitaModal,
    openDeliveryModal,
    closeDeliveryModal,
    openPaqueteModal,
    closePaqueteModal,
    openBitacoraModal,
    closeBitacoraModal,
    isVisitaModalOpen,
    isDeliveryModalOpen,
    isPaqueteModalOpen,
    isBitacoraModalOpen,
  ])

  return (
    <QuickActionContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isVisitaModalOpen,
        openVisitaModal,
        closeVisitaModal,
        isDeliveryModalOpen,
        openDeliveryModal,
        closeDeliveryModal,
        isPaqueteModalOpen,
        openPaqueteModal,
        closePaqueteModal,
        isBitacoraModalOpen,
        openBitacoraModal,
        closeBitacoraModal,
        preselectedDeptoId,
      }}
    >
      {children}
    </QuickActionContext.Provider>
  )
}

export const useQuickActions = (): QuickActionContextType => {
  const context = useContext(QuickActionContext)
  if (!context) {
    throw new Error('useQuickActions debe ser utilizado dentro de QuickActionProvider')
  }
  return context
}

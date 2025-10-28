"use client"

import * as React from "react"
import { CheckCircle2, XCircle, AlertCircle, Info, X } from "lucide-react"

type ToastType = "success" | "error" | "warning" | "info"

interface Toast {
  id: string
  title: string
  description?: string
  type: ToastType
  duration?: number
}

interface ToasterState {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

const ToasterContext = React.createContext<ToasterState | undefined>(undefined)

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(7)
    const newToast = { ...toast, id }
    setToasts((prev) => [...prev, newToast])

    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration || 3000)
    }
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToasterContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToasterContext.Provider>
  )
}

export const toaster = {
  create: (toast: Omit<Toast, "id">) => {
    const event = new CustomEvent("add-toast", { detail: toast })
    window.dispatchEvent(event)
  },
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

const colors = {
  success: "bg-green-50 text-green-900 border-green-200",
  error: "bg-red-50 text-red-900 border-red-200",
  warning: "bg-yellow-50 text-yellow-900 border-yellow-200",
  info: "bg-blue-50 text-blue-900 border-blue-200",
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(7)
    const newToast = { ...toast, id }
    setToasts((prev) => [...prev, newToast])

    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration || 3000)
    }
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  React.useEffect(() => {
    const handleAddToast = (event: CustomEvent) => {
      addToast(event.detail)
    }

    window.addEventListener("add-toast" as any, handleAddToast)
    return () => {
      window.removeEventListener("add-toast" as any, handleAddToast)
    }
  }, [addToast])

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = icons[toast.type]
        const colorClass = colors[toast.type]

        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg bg-white max-w-sm animate-in slide-in-from-right ${colorClass}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{toast.title}</p>
              {toast.description && (
                <p className="text-sm mt-1 opacity-90">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 hover:opacity-70 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

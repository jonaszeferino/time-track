"use client"

import { useState } from "react"
import { Trash2, Clock, Calendar } from "lucide-react"
import type { TimeEntry } from "@/app/page"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface TimeEntryListProps {
  entries: TimeEntry[]
  onDelete: (id: number) => void
}

export function TimeEntryList({ entries, onDelete }: TimeEntryListProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; entry: TimeEntry | null }>({
    isOpen: false,
    entry: null
  })

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatDate = (date: Date) => {
    // Garantir que estamos trabalhando com um objeto Date válido
    const dateObj = date instanceof Date ? date : new Date(date)
    
    // Se a data veio do banco com +3 horas, precisamos subtrair
    // Criar uma nova data com o ajuste
    const adjustedDate = new Date(dateObj.getTime() - (3 * 60 * 60 * 1000)) // Subtrai 3 horas
    
    // Formatar sem timezone específico (vai usar o local)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(adjustedDate)
  }

  const isToday = (date: Date) => {
    const dateObj = date instanceof Date ? date : new Date(date)
    const adjustedDate = new Date(dateObj.getTime() - (3 * 60 * 60 * 1000))
    const today = new Date()
    
    return adjustedDate.getDate() === today.getDate() &&
           adjustedDate.getMonth() === today.getMonth() &&
           adjustedDate.getFullYear() === today.getFullYear()
  }

  const handleDeleteClick = (entry: TimeEntry) => {
    setDeleteConfirm({ isOpen: true, entry })
  }

  const handleConfirmDelete = () => {
    if (deleteConfirm.entry) {
      onDelete(deleteConfirm.entry.id)
    }
  }

  // Ordenar entradas por data (mais recentes primeiro)
  const sortedEntries = [...entries].sort((a, b) => {
    const dateA = a.startTime instanceof Date ? a.startTime : new Date(a.startTime)
    const dateB = b.startTime instanceof Date ? b.startTime : new Date(b.startTime)
    return dateB.getTime() - dateA.getTime()
  })

  // Separar entradas de hoje e anteriores
  const todayEntries = sortedEntries.filter(entry => isToday(entry.startTime))
  const previousEntries = sortedEntries.filter(entry => !isToday(entry.startTime))

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Histórico de Entradas</h2>
        </div>
        <div className="p-12 text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Nenhuma entrada registrada ainda</p>
          <p className="text-sm text-gray-600">
            Inicie um timer para começar
          </p>
        </div>
      </div>
    )
  }

  const EntryItem = ({ entry }: { entry: TimeEntry }) => (
    <div
      key={entry.id}
      className={`flex justify-between items-start gap-4 rounded-lg border bg-white p-4 transition-colors ${
        isToday(entry.startTime) ? 'border-blue-200 bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-900">
            {entry.client}
          </p>
          <p className="text-sm text-gray-600">
            •
          </p>
          <p className="font-mono text-sm font-medium text-blue-500">
            {formatDuration(entry.duration)}
          </p>
          {isToday(entry.startTime) && (
            <>
              <p className="text-sm text-gray-600">•</p>
              <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                Hoje
              </span>
            </>
          )}
        </div>
        <p className="text-sm text-gray-600">
          {entry.description}
        </p>
        <p className="text-xs text-gray-600">
          {formatDate(entry.startTime)}
        </p>
      </div>
      <button
        onClick={() => handleDeleteClick(entry)}
        className="text-gray-600 hover:text-red-500 transition-colors"
        title="Excluir entrada"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  )

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Histórico de Entradas</h2>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {/* Entradas de hoje */}
            {todayEntries.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="w-4 h-4" />
                  <span>Hoje</span>
                </div>
                <div className="space-y-3">
                  {todayEntries.map((entry) => (
                    <EntryItem key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            )}

            {/* Separador */}
            {todayEntries.length > 0 && previousEntries.length > 0 && (
              <div className="border-t pt-6"></div>
            )}

            {/* Entradas anteriores */}
            {previousEntries.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Clock className="w-4 h-4" />
                  <span>Anteriores</span>
                </div>
                <div className="space-y-3">
                  {previousEntries.map((entry) => (
                    <EntryItem key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, entry: null })}
        onConfirm={handleConfirmDelete}
        title="Excluir Entrada"
        description={deleteConfirm.entry ? 
          `Tem certeza que deseja excluir a entrada "${deleteConfirm.entry.description}" do cliente ${deleteConfirm.entry.client}?` : 
          "Tem certeza que deseja excluir esta entrada?"
        }
        confirmText="Excluir"
        cancelText="Cancelar"
      />
    </>
  )
}

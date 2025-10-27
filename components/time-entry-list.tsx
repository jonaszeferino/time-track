"use client"

import { Trash2, Clock } from "lucide-react"
import type { TimeEntry } from "@/app/page"

interface TimeEntryListProps {
  entries: TimeEntry[]
  onDelete: (id: number) => void
}

export function TimeEntryList({ entries, onDelete }: TimeEntryListProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

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

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Histórico de Entradas</h2>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex justify-between items-start gap-4 rounded-lg border bg-white p-4 hover:bg-gray-50 transition-colors"
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
                </div>
                <p className="text-sm text-gray-600">
                  {entry.description}
                </p>
                <p className="text-xs text-gray-600">
                  {formatDate(entry.startTime)}
                </p>
              </div>
              <button
                onClick={() => onDelete(entry.id)}
                className="text-gray-600 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

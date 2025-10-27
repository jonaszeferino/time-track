"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Field } from "@/components/ui/field"
import { Play, Square } from "lucide-react"
import type { TimeEntry, Client } from "@/app/page"

interface TimeTrackerProps {
  activeEntry: TimeEntry | null
  onStart: (client: string, description: string) => void
  onStop: () => void
  clients: Client[]
}

export function TimeTracker({ activeEntry, onStart, onStop, clients }: TimeTrackerProps) {
  const [clientId, setClientId] = useState("")
  const [description, setDescription] = useState("")
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (activeEntry) {
      interval = setInterval(() => {
        const now = new Date()
        const elapsed = Math.floor((now.getTime() - activeEntry.startTime.getTime()) / 1000)
        setElapsedTime(elapsed)
      }, 1000)
    } else {
      setElapsedTime(0)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [activeEntry])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (activeEntry) {
      onStop()
    } else if (clientId && description) {
      const selectedClient = clients.find((c) => c.id.toString() === clientId)
      if (selectedClient) {
        onStart(selectedClient.name, description)
        setClientId("")
        setDescription("")
      }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">{activeEntry ? "Timer Ativo" : "Iniciar Nova Tarefa"}</h2>
      </div>
      <div className="p-6">
        {activeEntry ? (
          <div className="space-y-6">
            <div className="rounded-lg bg-gray-100 p-6 text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">
                Tempo Decorrido
              </p>
              <p className="font-mono text-5xl font-bold text-gray-900">
                {formatTime(elapsedTime)}
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Cliente
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {activeEntry.client}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Descrição
                </p>
                <p className="text-gray-900">{activeEntry.description}</p>
              </div>
            </div>
            <button
              onClick={onStop}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              <Square className="w-5 h-5" />
              Parar Timer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Field label="Cliente">
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clients.length === 0 ? (
                    <option value="" disabled>
                      Nenhum cliente cadastrado
                    </option>
                  ) : (
                    clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))
                  )}
                </select>
              </Field>
              <Field label="Descrição da Tarefa">
                <input
                  type="text"
                  placeholder="O que você está fazendo?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </Field>
              <button
                type="submit"
                disabled={clients.length === 0}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-5 h-5" />
                Iniciar Timer
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

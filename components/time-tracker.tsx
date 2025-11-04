"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Field } from "@/components/ui/field"
import { Play, Square } from "lucide-react"
import type { TimeEntry, Client } from "@/app/page"

interface TimeTrackerProps {
  activeEntry: TimeEntry | null
  onStart: (client: string, description: string) => void
  onStop: (observations?: string) => void
  clients: Client[]
}

export function TimeTracker({ activeEntry, onStart, onStop, clients }: TimeTrackerProps) {
  const [clientId, setClientId] = useState("")
  const [description, setDescription] = useState("")
  const [currentDescription, setCurrentDescription] = useState("")
  const [elapsedTime, setElapsedTime] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | null>(null)

  // Timer simples - cronômetro
  useEffect(() => {
    // Limpar intervalo anterior se existir
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (!activeEntry) {
      setElapsedTime(0)
      setCurrentDescription("")
      startTimeRef.current = null
      return
    }

    // Sincronizar descrição
    setCurrentDescription(activeEntry.description || "")

    // Iniciar cronômetro do zero
    startTimeRef.current = Date.now()
    setElapsedTime(0)
    
    // Atualizar a cada segundo
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const now = Date.now()
        const diff = now - startTimeRef.current
        const seconds = Math.floor(diff / 1000)
        setElapsedTime(seconds)
      }
    }, 1000)

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [activeEntry?.id]) // Só reiniciar quando mudar o ID da entrada

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (activeEntry) {
      // Parar timer
      onStop(currentDescription)
    } else if (clientId && description) {
      // Iniciar timer
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
            <div className="rounded-lg bg-gray-100 p-6 text-center relative">
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">Ativo</span>
                </div>
              </div>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Hora de Entrada
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {activeEntry.startTime.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Hora de Saída
                  </p>
                  <p className="text-base font-semibold text-gray-500">
                    {activeEntry.endTime 
                      ? activeEntry.endTime.toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          second: '2-digit'
                        })
                      : 'Em andamento'}
                  </p>
                </div>
              </div>
              <div>
                <Field label="Observações">
                  <textarea
                    value={currentDescription}
                    onChange={(e) => setCurrentDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    placeholder="Adicione observações sobre o trabalho realizado..."
                  />
                </Field>
              </div>
            </div>
            <button
              onClick={() => onStop(currentDescription)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-red-400 animate-pulse opacity-30"></div>
              <Square className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Parar Timer</span>
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


"use client"

import type React from "react"
import { useState } from "react"
import { Field } from "@/components/ui/field"
import { Plus } from "lucide-react"
import type { Client } from "@/app/page"
import { useToast } from "@/lib/use-toast"

interface ManualTimeEntryProps {
  clients: Client[]
  onAdd: (clientId: number, description: string, startTime: string, endTime: string) => Promise<boolean>
}

export function ManualTimeEntry({ clients, onAdd }: ManualTimeEntryProps) {
  const [clientId, setClientId] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (clientId && description && date && startTime && endTime) {
      // Criar timestamps completos
      const startDateTime = new Date(`${date}T${startTime}:00`)
      const endDateTime = new Date(`${date}T${endTime}:00`)
      
      // Verificar se o horário final é depois do inicial
      if (endDateTime <= startDateTime) {
        showToast("Erro de validação", "O horário final deve ser depois do horário inicial", "error")
        return
      }
      
      setIsLoading(true)
      
      try {
        const success = await onAdd(
          parseInt(clientId),
          description,
          startDateTime.toISOString(),
          endDateTime.toISOString()
        )
        
        if (success) {
          showToast("Entrada adicionada", "A entrada manual foi registrada com sucesso", "success")
          // Limpar formulário
          setDescription("")
          setStartTime("")
          setEndTime("")
        } else {
          showToast("Erro ao adicionar", "Não foi possível adicionar a entrada", "error")
        }
      } catch (error) {
        showToast("Erro ao adicionar", "Ocorreu um erro ao processar a entrada", "error")
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Adicionar Entrada Manual</h2>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Field label="Cliente">
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isLoading}
              >
                <option value="">Selecione um cliente</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </Field>
            
            <Field label="Descrição da Tarefa">
              <input
                type="text"
                placeholder="O que você fez?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isLoading}
              />
            </Field>
            
            <Field label="Data">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={isLoading}
              />
            </Field>
            
            <div className="grid grid-cols-2 gap-4">
              <Field label="Hora Inicial">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isLoading}
                />
              </Field>
              
              <Field label="Hora Final">
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isLoading}
                />
              </Field>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adicionando...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Adicionar Entrada
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

"use client"

import type React from "react"
import { useState } from "react"
import { Field } from "@/components/ui/field"
import { Users, Plus, Trash2, Edit, X, Check } from "lucide-react"
import type { Client } from "@/app/page"

interface ClientManagerProps {
  clients: Client[]
  onAddClient: (name: string) => void
  onUpdateClient?: (id: number, name: string) => Promise<void>
  onDeleteClient: (id: number) => void
}

export function ClientManager({ clients, onAddClient, onUpdateClient, onDeleteClient }: ClientManagerProps) {
  const [newClientName, setNewClientName] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newClientName.trim()) {
      onAddClient(newClientName.trim())
      setNewClientName("")
    }
  }

  const handleEdit = (client: Client) => {
    setEditingId(client.id)
    setEditName(client.name)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditName("")
  }

  const handleSaveEdit = async (id: number) => {
    if (onUpdateClient) {
      await onUpdateClient(id, editName.trim())
    }
    setEditingId(null)
    setEditName("")
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Clientes</h2>
          </div>
          <span className="text-sm text-gray-500">{clients.length} cadastrados</span>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Adicionar Novo Cliente</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Digite o nome do cliente"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="px-2 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Adicionar</span>
              </button>
            </div>
          </form>

          <div className="space-y-2">
            {clients.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed p-6 text-center">
                <p className="text-sm text-gray-600">
                  Nenhum cliente cadastrado
                </p>
              </div>
            ) : (
              clients.map((client) => (
                <div key={client.id} className="rounded-lg border bg-white p-3">
                  {editingId === client.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                          onClick={() => handleSaveEdit(client.id)}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                          onClick={handleCancelEdit}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <p className="font-medium">{client.name}</p>
                      {onUpdateClient ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEdit(client)}
                            className="text-gray-600 hover:text-blue-500 transition-colors"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => onDeleteClient(client.id)}
                            className="text-gray-600 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onDeleteClient(client.id)}
                          className="text-gray-600 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

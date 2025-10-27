"use client"

import type React from "react"
import { useState } from "react"
import { Field } from "@/components/ui/field"
import { UserPlus, Trash2, Edit, X, Check } from "lucide-react"

export interface Employee {
  id: number
  name: string
  surname: string | null
  is_deleted: boolean
}

interface EmployeeManagerProps {
  employees: Employee[]
  onAddEmployee: (employee: Omit<Employee, 'id' | 'is_deleted'>) => Promise<void>
  onUpdateEmployee: (id: number, employee: Partial<Employee>) => Promise<void>
  onDeleteEmployee: (id: number) => Promise<void>
}

export function EmployeeManager({ employees, onAddEmployee, onUpdateEmployee, onDeleteEmployee }: EmployeeManagerProps) {
  const [newEmployeeName, setNewEmployeeName] = useState("")
  const [newEmployeeSurname, setNewEmployeeSurname] = useState("")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")
  const [editSurname, setEditSurname] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newEmployeeName.trim()) {
      await onAddEmployee({
        name: newEmployeeName.trim(),
        surname: newEmployeeSurname.trim() || null,
      })
      setNewEmployeeName("")
      setNewEmployeeSurname("")
    }
  }

  const handleEdit = (employee: Employee) => {
    setEditingId(employee.id)
    setEditName(employee.name)
    setEditSurname(employee.surname || "")
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditName("")
    setEditSurname("")
  }

  const handleSaveEdit = async (id: number) => {
    await onUpdateEmployee(id, {
      name: editName.trim(),
      surname: editSurname.trim() || null,
    })
    setEditingId(null)
    setEditName("")
    setEditSurname("")
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Funcionários</h2>
          </div>
          <span className="text-sm text-gray-500">{employees.length} cadastrados</span>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Adicionar Novo Funcionário</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome"
                value={newEmployeeName}
                onChange={(e) => setNewEmployeeName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
              <input
                type="text"
                placeholder="Sobrenome (opcional)"
                value={newEmployeeSurname}
                onChange={(e) => setNewEmployeeSurname(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm"
              >
                Adicionar Funcionário
              </button>
            </div>
          </form>

          <div className="space-y-2">
            {employees.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed p-6 text-center">
                <p className="text-sm text-gray-600">
                  Nenhum funcionário cadastrado
                </p>
              </div>
            ) : (
              employees.map((employee) => (
                <div key={employee.id} className="rounded-lg border bg-white p-3">
                  {editingId === employee.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={editSurname}
                        onChange={(e) => setEditSurname(e.target.value)}
                        placeholder="Sobrenome"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex gap-2">
                        <button
                          className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                          onClick={() => handleSaveEdit(employee.id)}
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
                      <p className="font-medium">
                        {employee.name}
                        {employee.surname && ` ${employee.surname}`}
                      </p>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(employee)}
                          className="text-gray-600 hover:text-blue-500 transition-colors"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => onDeleteEmployee(employee.id)}
                          className="text-gray-600 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
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

"use client"

import { useState, useEffect } from "react"
import { TimeTracker } from "@/components/time-tracker"
import { TimeEntryList } from "@/components/time-entry-list"
import { TimeStats } from "@/components/time-stats"
import { ClientManager } from "@/components/client-manager"
import { EmployeeManager } from "@/components/employee-manager"
import { ManualTimeEntry } from "@/components/manual-time-entry"
import { Clock, Timer, Edit3, Calendar } from "lucide-react"

// Employee ID - será lido do .env.local ou definido pelo usuário
const EMPLOYEE_ID = parseInt(process.env.NEXT_PUBLIC_EMPLOYEE_ID || "1")

export interface TimeEntry {
  id: number
  client: string
  clientId: number
  description: string
  observations?: string
  startTime: Date
  endTime?: Date
  duration: number
}

export interface Client {
  id: number
  name: string
  surname?: string | null
}

export interface Employee {
  id: number
  name: string
  surname?: string | null
}

export default function Home() {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"timer" | "manual">("timer")

  // Carregar dados do banco de dados
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)

      // Carregar clientes
      const clientsRes = await fetch("/api/clients")
      
      let clientsData = []
      if (clientsRes.ok) {
        const data = await clientsRes.json()
        if (Array.isArray(data)) {
          clientsData = data
        }
      }
      
      const loadedClients = clientsData.map((c: any) => ({
        id: c.id,
        name: `${c.name}${c.surname ? ' ' + c.surname : ''}`,
        surname: c.surname,
      }))
      setClients(loadedClients)

      // Carregar empregados
      const employeesRes = await fetch("/api/employees")
      
      let employeesData = []
      if (employeesRes.ok) {
        const data = await employeesRes.json()
        if (Array.isArray(data)) {
          employeesData = data
        }
      }
      
      setEmployees(
        employeesData.map((e: any) => ({
          id: e.id,
          name: e.name,
          surname: e.surname,
        })),
      )

      // Carregar entradas do histórico
      const entriesRes = await fetch(`/api/work-logs?employee_id=${EMPLOYEE_ID}`)
      if (entriesRes.ok) {
        const entriesData = await entriesRes.json()
        setEntries(
          entriesData
            .filter((e: any) => e.end_time) // Apenas entradas finalizadas
            .map((e: any) => {
              const startTime = new Date(e.start_time)
              const endTime = e.end_time ? new Date(e.end_time) : undefined
              return {
                id: e.id,
                client: loadedClients.find((c) => c.id === e.client_id)?.name || "Cliente",
                clientId: e.client_id,
                description: e.observations || "",
                startTime,
                endTime,
                duration: Math.floor(((endTime?.getTime() || Date.now()) - startTime.getTime()) / 1000),
              }
            }),
        )
      }

      // Carregar entrada ativa
      const activeRes = await fetch(`/api/active-entry?employee_id=${EMPLOYEE_ID}`)
      if (activeRes.ok) {
        const activeData = await activeRes.json()
        if (activeData) {
          const startTime = new Date(activeData.start_time)
          setActiveEntry({
            id: activeData.id,
            client: activeData.client_name || "Cliente",
            clientId: activeData.client_id,
            description: activeData.observations || "",
            startTime,
            duration: 0,
          })
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStart = async (clientName: string, description: string) => {
    try {
      const client = clients.find((c) => c.name === clientName)
      if (!client) {
        console.error('Cliente não encontrado:', clientName)
        return
      }

      const startTimeISO = new Date().toISOString()

      const response = await fetch("/api/work-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_time: startTimeISO,
          employee_id: EMPLOYEE_ID,
          client_id: client.id,
          observations: description,
        }),
      })

      if (response.ok) {
        const newEntry = await response.json()
        
        const startTime = new Date(newEntry.start_time)
        const entryToSet = {
          id: newEntry.id,
          client: clientName,
          clientId: client.id,
          description,
          startTime,
          duration: 0,
        }
        setActiveEntry(entryToSet)
      } else {
        console.error('Erro na resposta:', response.status)
      }
    } catch (error) {
      console.error("Erro ao iniciar timer:", error)
    }
  }

  const handleStop = async (observations?: string) => {
    if (!activeEntry) return

    try {
      const endTime = new Date()
      const response = await fetch(`/api/work-logs`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeEntry.id,
          end_time: endTime.toISOString(),
          observations: observations || activeEntry.description,
        }),
      })

      if (response.ok) {
        // Limpar o activeEntry para voltar ao formulário de nova tarefa
        setActiveEntry(null)
        // Recarregar dados para atualizar o histórico
        loadData()
      }
    } catch (error) {
      console.error("Erro ao parar timer:", error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/work-logs?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setEntries(entries.filter((e) => e.id !== id))
      }
    } catch (error) {
      console.error("Erro ao deletar entrada:", error)
    }
  }

  const handleAddClient = async (name: string) => {
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.split(" ")[0],
          surname: name.split(" ").slice(1).join(" ") || null,
        }),
      })

      if (response.ok) {
        await loadData()
      }
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error)
    }
  }

  const handleUpdateClient = async (id: number, name: string) => {
    try {
      const response = await fetch("/api/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: name.split(" ")[0],
          surname: name.split(" ").slice(1).join(" ") || null,
        }),
      })

      if (response.ok) {
        await loadData()
      }
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error)
    }
  }

  const handleDeleteClient = async (id: number) => {
    try {
      const response = await fetch(`/api/clients?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadData()
      }
    } catch (error) {
      console.error("Erro ao deletar cliente:", error)
    }
  }

  const handleAddEmployee = async (employee: { name: string; surname: string | null }) => {
    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employee),
      })

      if (response.ok) {
        await loadData()
      }
    } catch (error) {
      console.error("Erro ao adicionar empregado:", error)
    }
  }

  const handleUpdateEmployee = async (id: number, employee: { name?: string; surname?: string | null }) => {
    try {
      const response = await fetch("/api/employees", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...employee }),
      })

      if (response.ok) {
        await loadData()
      }
    } catch (error) {
      console.error("Erro ao atualizar empregado:", error)
    }
  }

  const handleDeleteEmployee = async (id: number) => {
    try {
      const response = await fetch(`/api/employees?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadData()
      }
    } catch (error) {
      console.error("Erro ao deletar empregado:", error)
    }
  }

  const handleAddManualEntry = async (clientId: number, description: string, startTime: string, endTime: string) => {
    try {
      const response = await fetch("/api/work-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start_time: startTime,
          end_time: endTime,
          employee_id: EMPLOYEE_ID,
          client_id: clientId,
          observations: description,
        }),
      })

      if (response.ok) {
        // Recarregar dados para atualizar o histórico
        loadData()
        return true
      }
      return false
    } catch (error) {
      console.error("Erro ao adicionar entrada manual:", error)
      return false
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-500">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Time Tracker
                </h1>
                <p className="text-sm text-gray-600">
                  Registre suas horas trabalhadas
                </p>
              </div>
            </div>
            <a
              href="/relatorio"
              className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Relatório Semanal
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Abas */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab("timer")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors ${
                    activeTab === "timer"
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Timer className="w-4 h-4" />
                  Timer
                </button>
                <button
                  onClick={() => setActiveTab("manual")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors ${
                    activeTab === "manual"
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  Entrada Manual
                </button>
              </div>
            </div>

            {/* Conteúdo das abas */}
            {activeTab === "timer" ? (
              <TimeTracker activeEntry={activeEntry} onStart={handleStart} onStop={handleStop} clients={clients} />
            ) : (
              <ManualTimeEntry clients={clients} onAdd={handleAddManualEntry} />
            )}
            
            <TimeEntryList entries={entries} onDelete={handleDelete} />
          </div>
          <div className="flex flex-col gap-6">
            <ClientManager 
              clients={clients} 
              onAddClient={handleAddClient}
              onUpdateClient={handleUpdateClient}
              onDeleteClient={handleDeleteClient} 
            />
            <EmployeeManager 
              employees={employees}
              onAddEmployee={handleAddEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
            />
            <TimeStats entries={entries} activeEntry={activeEntry} />
          </div>
        </div>
      </div>
    </div>
  )
}

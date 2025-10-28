"use client"

import { useState, useEffect } from "react"
import { Calendar, ChevronLeft, ChevronRight, Clock, Users, Download } from "lucide-react"
import { useToast } from "@/lib/use-toast"
import * as XLSX from 'xlsx'

// Employee ID - será lido do .env.local ou definido pelo usuário
const EMPLOYEE_ID = parseInt(process.env.NEXT_PUBLIC_EMPLOYEE_ID || "1")

interface WeekData {
  startDate: string
  endDate: string
  days: Record<string, DayData>
  totalHours: number
  clientTotals: Record<string, number>
}

interface DayData {
  date: string
  dayName: string
  entries: Entry[]
  totalSeconds: number
  clientHours: Record<string, number>
}

interface Entry {
  id: number
  clientId: number
  clientName: string
  description: string
  startTime: string
  endTime: string
  duration: number
}

export default function RelatorioPage() {
  const [weekData, setWeekData] = useState<WeekData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const { showToast } = useToast()

  useEffect(() => {
    loadWeekData()
  }, [currentWeek])

  const loadWeekData = async () => {
    try {
      setLoading(true)
      
      // Calcular início e fim da semana
      const dayOfWeek = currentWeek.getDay()
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
      
      const start = new Date(currentWeek)
      start.setDate(currentWeek.getDate() + diff)
      start.setHours(0, 0, 0, 0)
      
      const end = new Date(start)
      end.setDate(start.getDate() + 4)
      end.setHours(23, 59, 59, 999)

      const response = await fetch(
        `/api/weekly-report?employee_id=${EMPLOYEE_ID}&start_date=${start.toISOString()}&end_date=${end.toISOString()}`
      )

      if (response.ok) {
        const data = await response.json()
        setWeekData(data)
      } else {
        showToast("Erro ao carregar dados", "Não foi possível carregar o relatório semanal", "error")
      }
    } catch (error) {
      console.error("Erro ao carregar relatório:", error)
      showToast("Erro ao carregar dados", "Ocorreu um erro ao processar a solicitação", "error")
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    // Ajustar timezone
    const adjustedDate = new Date(date.getTime() - (3 * 60 * 60 * 1000))
    return adjustedDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDateRange = () => {
    if (!weekData) return ""
    const start = new Date(weekData.startDate)
    const end = new Date(weekData.endDate)
    
    const startStr = start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    const endStr = end.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    
    return `${startStr} - ${endStr}`
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeek(newWeek)
  }

  const exportToExcel = () => {
    if (!weekData) return

    try {
      // Criar workbook
      const wb = XLSX.utils.book_new()

      // Dados do resumo
      const summaryData = [
        ['Relatório Semanal de Horas'],
        [''],
        ['Período:', formatDateRange()],
        ['Total de Horas:', formatDuration(weekData.totalHours * 3600)],
        [''],
        ['Horas por Cliente:'],
        ...Object.entries(weekData.clientTotals)
          .sort(([, a], [, b]) => b - a)
          .map(([client, seconds]) => [client, formatDuration(seconds)])
      ]

      // Criar planilha de resumo
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo')

      // Dados detalhados por dia
      const detailData: any[] = [
        ['Data', 'Dia', 'Cliente', 'Descrição', 'Início', 'Fim', 'Duração']
      ]

      Object.entries(weekData.days).forEach(([dayKey, dayData]) => {
        dayData.entries.forEach(entry => {
          const startTime = new Date(entry.startTime)
          const endTime = new Date(entry.endTime)
          
          // Ajustar timezone
          const adjustedStart = new Date(startTime.getTime() - (3 * 60 * 60 * 1000))
          const adjustedEnd = new Date(endTime.getTime() - (3 * 60 * 60 * 1000))
          
          detailData.push([
            new Date(dayData.date).toLocaleDateString('pt-BR'),
            dayData.dayName,
            entry.clientName,
            entry.description,
            adjustedStart.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            adjustedEnd.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            formatDuration(entry.duration)
          ])
        })
        
        // Adicionar linha de total do dia se houver entradas
        if (dayData.entries.length > 0) {
          detailData.push([
            '',
            '',
            '',
            `Total ${dayData.dayName}:`,
            '',
            '',
            formatDuration(dayData.totalSeconds)
          ])
          detailData.push(['']) // Linha em branco
        }
      })

      // Criar planilha de detalhes
      const wsDetail = XLSX.utils.aoa_to_sheet(detailData)
      
      // Ajustar largura das colunas
      const colWidths = [
        { wch: 12 }, // Data
        { wch: 15 }, // Dia
        { wch: 20 }, // Cliente
        { wch: 40 }, // Descrição
        { wch: 10 }, // Início
        { wch: 10 }, // Fim
        { wch: 10 }  // Duração
      ]
      wsDetail['!cols'] = colWidths

      XLSX.utils.book_append_sheet(wb, wsDetail, 'Detalhes')

      // Gerar nome do arquivo
      const start = new Date(weekData.startDate)
      const end = new Date(weekData.endDate)
      const fileName = `relatorio_semanal_${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}.xlsx`

      // Baixar arquivo
      XLSX.writeFile(wb, fileName)
      
      showToast("Exportação concluída", "O relatório foi exportado para Excel com sucesso", "success")
    } catch (error) {
      console.error('Erro ao exportar:', error)
      showToast("Erro na exportação", "Não foi possível exportar o relatório", "error")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Carregando relatório...</p>
      </div>
    )
  }

  if (!weekData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Nenhum dado encontrado</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-500">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Relatório Semanal
                </h1>
                <p className="text-sm text-gray-600">
                  Visualize suas horas trabalhadas por semana
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportToExcel}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar Excel
              </button>
              <a
                href="/"
                className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
              >
                Voltar
              </a>
            </div>
          </div>
        </div>

        {/* Navegação de semanas */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <h2 className="text-lg font-semibold">
              {formatDateRange()}
            </h2>
            
            <button
              onClick={() => navigateWeek('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Resumo da semana */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Total da Semana</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {formatDuration(weekData.totalHours * 3600)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold">Horas por Cliente</h3>
            </div>
            <div className="space-y-2">
              {Object.entries(weekData.clientTotals)
                .sort(([, a], [, b]) => b - a)
                .map(([client, seconds]) => (
                  <div key={client} className="flex justify-between text-sm">
                    <span className="font-medium">{client}</span>
                    <span className="text-gray-600">{formatDuration(seconds)}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Calendário semanal */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-xl font-semibold">Detalhes por Dia</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Object.entries(weekData.days).map(([dayKey, dayData]) => {
                const isToday = new Date().toDateString() === new Date(dayData.date).toDateString()
                
                return (
                  <div
                    key={dayKey}
                    className={`border rounded-lg p-4 ${
                      isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="mb-3">
                      <h4 className="font-semibold capitalize">
                        {dayData.dayName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {new Date(dayData.date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit'
                        })}
                      </p>
                    </div>

                    {dayData.entries.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">Sem registros</p>
                    ) : (
                      <div className="space-y-3">
                        {/* Total do dia */}
                        <div className="pb-2 border-b">
                          <p className="text-sm font-medium text-gray-700">
                            Total: {formatDuration(dayData.totalSeconds)}
                          </p>
                        </div>

                        {/* Entradas do dia */}
                        <div className="space-y-2">
                          {dayData.entries.map((entry) => (
                            <div key={entry.id} className="text-xs space-y-1">
                              <div className="flex justify-between items-start">
                                <span className="font-medium text-gray-900">
                                  {entry.clientName}
                                </span>
                                <span className="text-gray-600">
                                  {formatDuration(entry.duration)}
                                </span>
                              </div>
                              <p className="text-gray-600 truncate">
                                {entry.description}
                              </p>
                              <p className="text-gray-500">
                                {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Resumo por cliente do dia */}
                        {Object.keys(dayData.clientHours).length > 1 && (
                          <div className="pt-2 border-t space-y-1">
                            {Object.entries(dayData.clientHours).map(([client, seconds]) => (
                              <div key={client} className="flex justify-between text-xs">
                                <span className="text-gray-600">{client}:</span>
                                <span className="font-medium">{formatDuration(seconds)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

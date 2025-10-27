import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Função auxiliar para calcular segundos entre duas datas
function getSecondsDifference(start: string, end: string | null): number {
  const startTime = new Date(start).getTime()
  const endTime = end ? new Date(end).getTime() : Date.now()
  return Math.floor((endTime - startTime) / 1000)
}

// GET - Obter estatísticas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employee_id')

    if (!employeeId) {
      return NextResponse.json({ error: 'employee_id é obrigatório' }, { status: 400 })
    }

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    // Calcular início da semana (segunda-feira)
    const dayOfWeek = now.getDay()
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const weekStart = new Date(todayStart)
    weekStart.setDate(todayStart.getDate() - daysFromMonday)
    weekStart.setHours(0, 0, 0, 0)

    // Buscar todos os work logs do empregado
    const { data: workLogs, error } = await supabase
      .from('time_track_work_logs')
      .select('*')
      .eq('employee_id', employeeId)
      .or('is_deleted.is.null,is_deleted.eq.false')
      .order('start_time', { ascending: false })

    if (error) throw error

    // Filtrar logs de hoje e da semana
    const todayLogs = workLogs?.filter((log) => {
      const logDate = new Date(log.start_time)
      return logDate >= todayStart
    }) || []

    const weekLogs = workLogs?.filter((log) => {
      const logDate = new Date(log.start_time)
      return logDate >= weekStart
    }) || []

    // Calcular totais
    const todayTotal = todayLogs.reduce((total, log) => {
      return total + getSecondsDifference(log.start_time, log.end_time)
    }, 0)

    const weekTotal = weekLogs.reduce((total, log) => {
      return total + getSecondsDifference(log.start_time, log.end_time)
    }, 0)

    // Buscar todos os clientes
    const { data: clients } = await supabase
      .from('time_track_client')
      .select('id, name')
      .or('is_deleted.is.null,is_deleted.eq.false')

    // Calcular totais por cliente
    const clientTotals = clients?.map((client) => {
      const clientLogs = weekLogs.filter((log) => log.client_id === client.id)
      const totalSeconds = clientLogs.reduce((total, log) => {
        return total + getSecondsDifference(log.start_time, log.end_time)
      }, 0)

      return {
        id: client.id,
        name: client.name,
        totalSeconds,
      }
    }) || []

    // Top 5 clientes
    const topClients = clientTotals
      .filter((client) => client.totalSeconds > 0)
      .sort((a, b) => b.totalSeconds - a.totalSeconds)
      .slice(0, 5)

    return NextResponse.json({
      todayTotal,
      weekTotal,
      topClients,
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 })
  }
}

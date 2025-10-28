import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employee_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    if (!employeeId) {
      return NextResponse.json({ error: 'employee_id é obrigatório' }, { status: 400 })
    }

    // Se não fornecer datas, pegar a semana atual
    let start: Date, end: Date
    
    if (startDate && endDate) {
      start = new Date(startDate)
      end = new Date(endDate)
    } else {
      // Pegar segunda-feira da semana atual
      const today = new Date()
      const dayOfWeek = today.getDay()
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Ajuste para segunda-feira
      
      start = new Date(today)
      start.setDate(today.getDate() + diff)
      start.setHours(0, 0, 0, 0)
      
      // Pegar sexta-feira
      end = new Date(start)
      end.setDate(start.getDate() + 4)
      end.setHours(23, 59, 59, 999)
    }

    // Buscar logs da semana
    const { data: logs, error } = await supabase
      .from('time_track_work_logs')
      .select(`
        *,
        time_track_client:client_id (
          id,
          name,
          surname
        )
      `)
      .eq('employee_id', employeeId)
      .gte('start_time', start.toISOString())
      .lte('start_time', end.toISOString())
      .or('is_deleted.is.null,is_deleted.eq.false')
      .order('start_time', { ascending: true })

    if (error) throw error

    // Processar dados por dia
    const weekData = {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      days: {} as Record<string, any>,
      totalHours: 0,
      clientTotals: {} as Record<string, number>
    }

    // Inicializar dias da semana
    for (let i = 0; i < 5; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      const dayKey = day.toISOString().split('T')[0]
      
      weekData.days[dayKey] = {
        date: day.toISOString(),
        dayName: day.toLocaleDateString('pt-BR', { weekday: 'long' }),
        entries: [],
        totalSeconds: 0,
        clientHours: {} as Record<string, number>
      }
    }

    // Processar logs
    logs?.forEach(log => {
      if (!log.end_time) return // Ignorar entradas sem fim
      
      const startTime = new Date(log.start_time)
      const endTime = new Date(log.end_time)
      const dayKey = startTime.toISOString().split('T')[0]
      
      // Calcular duração em segundos
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
      
      const clientName = log.time_track_client?.name || 'Cliente'
      
      // Adicionar entrada ao dia
      if (weekData.days[dayKey]) {
        weekData.days[dayKey].entries.push({
          id: log.id,
          clientId: log.client_id,
          clientName,
          description: log.observations || '',
          startTime: log.start_time,
          endTime: log.end_time,
          duration
        })
        
        // Atualizar totais do dia
        weekData.days[dayKey].totalSeconds += duration
        
        // Atualizar horas por cliente no dia
        if (!weekData.days[dayKey].clientHours[clientName]) {
          weekData.days[dayKey].clientHours[clientName] = 0
        }
        weekData.days[dayKey].clientHours[clientName] += duration
      }
      
      // Atualizar totais gerais
      weekData.totalHours += duration / 3600
      
      // Atualizar total por cliente
      if (!weekData.clientTotals[clientName]) {
        weekData.clientTotals[clientName] = 0
      }
      weekData.clientTotals[clientName] += duration
    })

    return NextResponse.json(weekData)
  } catch (error) {
    console.error('Erro ao buscar relatório semanal:', error)
    return NextResponse.json({ error: 'Erro ao buscar relatório semanal' }, { status: 500 })
  }
}

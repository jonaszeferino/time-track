import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Buscar entrada ativa (sem end_time)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employee_id')

    if (!employeeId) {
      return NextResponse.json({ error: 'employee_id é obrigatório' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('time_track_work_logs')
      .select('*, time_track_client!inner(*)')
      .eq('employee_id', employeeId)
      .is('end_time', null)
      .or('is_deleted.is.null,is_deleted.eq.false')
      .order('start_time', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    if (!data) {
      return NextResponse.json(null)
    }

    // Adicionar o nome do cliente ao resultado
    const response = {
      ...data,
      client_name: data.time_track_client?.name || null,
    }

    // Remover o objeto aninhado do client se existir
    delete response.time_track_client

    return NextResponse.json(response)
  } catch (error) {
    console.error('Erro ao buscar entrada ativa:', error)
    return NextResponse.json({ error: 'Erro ao buscar entrada ativa' }, { status: 500 })
  }
}

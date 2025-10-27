import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Buscar todos os work logs não deletados
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employee_id')

    let query = supabase
      .from('time_track_work_logs')
      .select('*')
      .or('is_deleted.is.null,is_deleted.eq.false')

    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }

    query = query.order('start_time', { ascending: false })

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao buscar work logs:', error)
    return NextResponse.json({ error: 'Erro ao buscar work logs' }, { status: 500 })
  }
}

// POST - Criar novo work log
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { start_time, end_time, employee_id, client_id, observations } = body

    // Validação básica
    if (!start_time || !employee_id || !client_id) {
      return NextResponse.json({ error: 'Campos obrigatórios: start_time, employee_id, client_id' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('time_track_work_logs')
      .insert({
        start_time,
        end_time: end_time || null,
        employee_id,
        client_id,
        observations: observations || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar work log:', error)
    return NextResponse.json({ error: 'Erro ao criar work log' }, { status: 500 })
  }
}

// PATCH - Atualizar work log (soft delete ou atualizar dados)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, end_time, observations, is_deleted } = body

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    const updates: any = {}
    if (end_time !== undefined) updates.end_time = end_time
    if (observations !== undefined) updates.observations = observations
    if (is_deleted !== undefined) updates.is_deleted = is_deleted

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('time_track_work_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao atualizar work log:', error)
    return NextResponse.json({ error: 'Erro ao atualizar work log' }, { status: 500 })
  }
}

// DELETE - Soft delete de work log
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('time_track_work_logs')
      .update({ is_deleted: true })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao deletar work log:', error)
    return NextResponse.json({ error: 'Erro ao deletar work log' }, { status: 500 })
  }
}

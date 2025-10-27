import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Buscar todos os clientes
export async function GET(request: NextRequest) {
  try {
    console.log('Buscando clientes...')
    
    // Buscar apenas não deletados (false ou null)
    const { data, error } = await supabase
      .from('time_track_client')
      .select('*')
      .or('is_deleted.is.null,is_deleted.eq.false')
      .order('name', { ascending: true })

    if (error) {
      console.error('Erro do Supabase:', error)
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return NextResponse.json({ error: 'Erro ao buscar clientes', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}

// POST - Criar novo cliente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, surname } = body

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('time_track_client')
      .insert({ name, surname })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 })
  }
}

// PUT - Atualizar cliente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, name, surname, is_deleted } = body

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (surname !== undefined) updates.surname = surname
    if (is_deleted !== undefined) updates.is_deleted = is_deleted

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('time_track_client')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error)
    return NextResponse.json({ error: 'Erro ao atualizar cliente' }, { status: 500 })
  }
}

// DELETE - Soft delete de cliente
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('time_track_client')
      .update({ is_deleted: true })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao deletar cliente:', error)
    return NextResponse.json({ error: 'Erro ao deletar cliente' }, { status: 500 })
  }
}

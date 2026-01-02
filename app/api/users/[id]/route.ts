import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { action, days, notes } = body;

    if (action === 'approve') {
      // Aprovar usuário como Pró
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (days || 30));

      const { error } = await supabaseAdmin
        .from('user_subscriptions')
        .upsert({
          user_id: id,
          status: 'pro',
          approved_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          pro_days_remaining: days || 30,
          admin_notes: notes,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;

      return NextResponse.json({ success: true, message: 'Usuário aprovado como Pró' });
    }

    if (action === 'revoke') {
      // Revogar plano Pró
      const { error } = await supabaseAdmin
        .from('user_subscriptions')
        .upsert({
          user_id: id,
          status: 'free',
          expires_at: null,
          pro_days_remaining: 0,
          admin_notes: notes,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;

      return NextResponse.json({ success: true, message: 'Plano Pró revogado' });
    }

    if (action === 'extend') {
      // Estender dias do plano Pró
      const { data: current } = await supabaseAdmin
        .from('user_subscriptions')
        .select('expires_at, pro_days_remaining')
        .eq('user_id', id)
        .single();

      let newExpiresAt = new Date();
      if (current?.expires_at) {
        newExpiresAt = new Date(current.expires_at);
      }
      newExpiresAt.setDate(newExpiresAt.getDate() + (days || 30));

      const { error } = await supabaseAdmin
        .from('user_subscriptions')
        .update({
          expires_at: newExpiresAt.toISOString(),
          pro_days_remaining: (current?.pro_days_remaining || 0) + (days || 30),
          admin_notes: notes,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', id);

      if (error) throw error;

      return NextResponse.json({ success: true, message: `Plano estendido em ${days || 30} dias` });
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Deletar usuário do auth (isso também deleta dados relacionados via CASCADE)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Usuário removido' });
  } catch (error) {
    console.error('Erro ao remover usuário:', error);
    return NextResponse.json(
      { error: 'Erro ao remover usuário' },
      { status: 500 }
    );
  }
}

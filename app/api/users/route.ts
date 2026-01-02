import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    // Buscar todos os usuários do auth
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      throw authError;
    }

    // Buscar assinaturas
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*');

    if (subError) {
      console.error('Erro ao buscar assinaturas:', subError);
    }

    // Combinar dados
    const users = authUsers.users.map(user => {
      const subscription = subscriptions?.find(s => s.user_id === user.id);
      return {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || 'Sem nome',
        created_at: user.created_at,
        last_sign_in: user.last_sign_in_at,
        status: subscription?.status || 'free',
        expires_at: subscription?.expires_at,
        requested_at: subscription?.requested_at,
        pro_days_remaining: subscription?.pro_days_remaining || 0,
      };
    });

    // Estatísticas
    const stats = {
      total: users.length,
      free: users.filter(u => u.status === 'free').length,
      pending: users.filter(u => u.status === 'pending').length,
      pro: users.filter(u => u.status === 'pro').length,
    };

    return NextResponse.json({ users, stats });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar usuários' },
      { status: 500 }
    );
  }
}

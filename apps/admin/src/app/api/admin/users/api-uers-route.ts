// apps/admin/src/app/api/admin/users/route.ts
// API route chạy server-side — dùng SERVICE_ROLE_KEY để tạo/xóa user

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Service role client — chỉ dùng server-side, KHÔNG expose ra client
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!url || !serviceKey) throw new Error('Missing Supabase env vars');
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Xác minh request đến từ admin đã đăng nhập
async function verifyAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  const supabase = getAdminClient();
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return null;
  const { data: roleData } = await supabase
    .from('user_roles').select('role').eq('user_id', user.id).single();
  if (roleData?.role !== 'admin') return null;
  return user;
}

// GET /api/admin/users — lấy danh sách users + roles
export async function GET(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = getAdminClient();
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Lấy roles cho tất cả users
  const { data: roles } = await supabase.from('user_roles').select('user_id, role');
  const roleMap = Object.fromEntries(roles?.map(r => [r.user_id, r.role]) ?? []);

  const result = users.map(u => ({
    id: u.id,
    email: u.email,
    role: roleMap[u.id] ?? null,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
  }));

  return NextResponse.json({ users: result });
}

// POST /api/admin/users — tạo user mới
export async function POST(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { email, password, role } = await req.json();
  if (!email || !password || !role) {
    return NextResponse.json({ error: 'Thiếu email, password hoặc role' }, { status: 400 });
  }
  if (!['admin', 'editor'].includes(role)) {
    return NextResponse.json({ error: 'Role không hợp lệ' }, { status: 400 });
  }

  const supabase = getAdminClient();

  // Tạo user trong Supabase Auth
  const { data: { user: newUser }, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // bỏ qua bước xác nhận email
  });
  if (createError || !newUser) {
    return NextResponse.json({ error: createError?.message ?? 'Tạo user thất bại' }, { status: 500 });
  }

  // Gán role
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({ user_id: newUser.id, role });
  if (roleError) {
    return NextResponse.json({ error: 'Tạo user thành công nhưng gán role thất bại' }, { status: 500 });
  }

  return NextResponse.json({ success: true, user: { id: newUser.id, email, role } });
}

// DELETE /api/admin/users — xóa user
export async function DELETE(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: 'Thiếu userId' }, { status: 400 });
  if (userId === admin.id) {
    return NextResponse.json({ error: 'Không thể xóa chính mình' }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

// PATCH /api/admin/users — cập nhật role
export async function PATCH(req: NextRequest) {
  const admin = await verifyAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { userId, role } = await req.json();
  if (!userId || !role) return NextResponse.json({ error: 'Thiếu userId hoặc role' }, { status: 400 });
  if (!['admin', 'editor'].includes(role)) {
    return NextResponse.json({ error: 'Role không hợp lệ' }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { error } = await supabase
    .from('user_roles')
    .upsert({ user_id: userId, role }, { onConflict: 'user_id' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
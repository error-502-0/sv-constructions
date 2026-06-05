import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { adminId, password } = await request.json();

    // Secure Hardcoded Credentials
    if (adminId === "svconstructions" && password === "sv@12349876") {
      const response = NextResponse.json({ success: true });
      // Set secure HTTP-only cookie for session
      response.cookies.set('admin_session', 'authenticated_admin_svc', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });
      return response;
    }

    return NextResponse.json({ success: false, error: "Invalid Credentials" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_session');
  return response;
}

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  if (cookieHeader.includes('admin_session=authenticated_admin_svc')) {
    return NextResponse.json({ authenticated: true });
  }
  return NextResponse.json({ authenticated: false }, { status: 401 });
}

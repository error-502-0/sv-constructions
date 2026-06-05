import { NextResponse } from 'next/server';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export async function GET() {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, 'svconstructionsylm@gmail.com', 'svc@12349876');
    return NextResponse.json({ success: true, user: userCredential.user.uid });
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      return NextResponse.json({ success: true, message: 'User already exists' });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

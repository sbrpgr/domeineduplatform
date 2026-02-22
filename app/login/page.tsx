'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { AppShell } from '@/components/layout/app-shell';

export default function LoginPage() {
  const [email, setEmail] = useState('demo@domain-glossary.com');
  const [password, setPassword] = useState('demo1234');
  const [message, setMessage] = useState('');

  return (
    <AppShell title="로그인" subtitle="Credentials 데모 계정: demo@domain-glossary.com / demo1234">
      <form
        className="grid max-w-md gap-3 rounded-2xl border border-slate-200 bg-white p-6"
        onSubmit={async (event) => {
          event.preventDefault();
          const result = await signIn('credentials', {
            email,
            password,
            redirect: false
          });

          if (result?.ok) {
            setMessage('로그인 성공');
          } else {
            setMessage('로그인 실패');
          }
        }}
      >
        <input
          className="rounded-lg border border-slate-300 px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
        />
        <input
          className="rounded-lg border border-slate-300 px-3 py-2"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
        />
        <button className="rounded-lg bg-primary px-4 py-2 text-white" type="submit">
          로그인
        </button>
        {message ? <p className="text-sm text-slate-700">{message}</p> : null}
      </form>
    </AppShell>
  );
}

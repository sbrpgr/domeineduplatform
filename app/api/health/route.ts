import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'domain-glossary-platform',
    date: '2026-02-20'
  });
}

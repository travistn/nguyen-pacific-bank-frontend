import { NextResponse } from 'next/server';

export const proxy = () => {
  return NextResponse.next();
};

import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // No auth checks - all routing handled in components
  return NextResponse.next();
}

export const config = {
  matcher: []
};

import { type NextRequest, NextResponse } from 'next/server'
import { validateSession } from './lib/auth'
import type { SessionData } from './lib/interfaces'

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
}

const publicRoutes = ['/login']

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  if(publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  const session = await validateSession()

  if (!session) return NextResponse.redirect(new URL('/login', req.url))
  if (pathname === '/painel') return NextResponse.redirect(new URL('/painel/associados', req.url))
  if (pathname === '/') return NextResponse.redirect(new URL('/painel/associados', req.url))

  if (pathname.startsWith('/painel/financeiro')) {
    const sessionCookie = req.cookies.get(process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME as string)
    const sessionData = sessionCookie ? JSON.parse(sessionCookie.value) as SessionData : null

    if (sessionData?.user.roleId !== 2) {
      return NextResponse.redirect(new URL('/painel/associados', req.url))
    }
  }

  return NextResponse.next()
}

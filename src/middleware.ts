import { type NextRequest, NextResponse } from 'next/server'
import { validateSession } from './lib/auth'

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
}

const publicRoutes = ['/login']

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const nextUrl = req.nextUrl
  console.log('nextUrl:')
  console.log(nextUrl)

  if(publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  const session = await validateSession()

  if (!session) return NextResponse.redirect(new URL('/login', req.url))
  if (pathname === '/painel') return NextResponse.redirect(new URL('/painel/associados', req.url))
  if (pathname === '/') return NextResponse.redirect(new URL('/painel/associados', req.url))

  return NextResponse.next()
}

export function shouldRedirectAuthenticatedUser(pathname: string): boolean {
  return pathname === '/login' || pathname.startsWith('/login/')
}

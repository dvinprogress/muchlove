import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import {NextRequest, NextResponse} from 'next/server';
import {createServerClient} from '@supabase/ssr';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Run intl middleware first (handles locale detection/redirect)
  const response = intlMiddleware(request);

  // If intl middleware redirected, return immediately
  if (response.headers.get('location')) {
    return response;
  }

  // Now handle Supabase auth on the response from intl middleware
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({name, value, options}) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {data: {user}} = await supabase.auth.getUser();
  const {pathname} = request.nextUrl;

  // Check for protected routes (with or without locale prefix)
  const isProtectedRoute = /^(\/[a-z]{2})?\/dashboard/.test(pathname);
  const isAuthRoute = /^(\/[a-z]{2})?\/(login|signup)$/.test(pathname);

  // Extract locale from path for redirect URLs
  const localeMatch = pathname.match(/^\/([a-z]{2})\//);
  const locale = localeMatch ? localeMatch[1] : '';
  const prefix = locale ? `/${locale}` : '';

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL(`${prefix}/login`, request.url));
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL(`${prefix}/dashboard`, request.url));
  }

  // Onboarding redirect: si user authentifie sur /dashboard (sauf /dashboard/onboarding),
  // verifier si onboarding est complete
  const isOnboardingRoute = /^(\/[a-z]{2})?\/dashboard\/onboarding/.test(pathname);
  if (user && isProtectedRoute && !isOnboardingRoute) {
    const { data: company } = await supabase
      .from('companies')
      .select('onboarding_completed_at')
      .eq('id', user.id)
      .single()

    if (company && !company.onboarding_completed_at) {
      return NextResponse.redirect(new URL(`${prefix}/dashboard/onboarding`, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

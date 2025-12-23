import { createClient } from '~/lib/supabase/server'
import { type LoaderFunctionArgs, redirect } from 'react-router'

/**
 * Handles the OAuth/PKCE callback from Supabase.
 * This route exchanges the authorization code for a session.
 * Used for password reset, magic links, and OAuth flows.
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const { supabase, headers } = createClient(request)
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // For password reset, redirect to a page where they can update password
      // For other flows, redirect to the next page or home
      return redirect(next, { headers })
    }

    return redirect(`/auth/error?error=${encodeURIComponent(error.message)}`)
  }

  return redirect('/auth/error?error=No+authorization+code+provided')
}

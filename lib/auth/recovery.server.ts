import 'server-only'

import { createClient } from '@/lib/supabase/server'
import { hasRecentRecovery } from '@/lib/auth/recovery'

export async function getRecoveryUser(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) return null
  const { data, error } = await supabase.auth.getClaims()
  return !error && hasRecentRecovery(data?.claims, userData.user.id) ? userData.user : null
}

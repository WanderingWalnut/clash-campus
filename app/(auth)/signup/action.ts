'use server'

import { createClient } from "@/lib/supabase/server"

export async function signUpNewUser(email: Email, password: Password): Promise<void> {
    const {data, error } = await supabase.auth.signUp

}
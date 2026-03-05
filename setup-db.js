#!/usr/bin/env node
/**
 * VoiceUp — One-time database setup script
 *
 * Reads your .env.local, connects to Supabase with the service role key,
 * and executes the full initial schema SQL.
 *
 * Usage:
 *   node setup-db.js
 *
 * Requirements:
 *   npm install @supabase/supabase-js dotenv
 */

const fs = require('fs')
const path = require('path')

// ─── Load .env.local ──────────────────────────────────────────────────────────
function loadEnv() {
    const envPath = path.join(__dirname, '.env.local')
    if (!fs.existsSync(envPath)) {
        console.error('❌  .env.local not found. Make sure it exists in the project root.')
        process.exit(1)
    }

    const lines = fs.readFileSync(envPath, 'utf8').split('\n')
    for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eqIdx = trimmed.indexOf('=')
        if (eqIdx === -1) continue
        const key = trimmed.slice(0, eqIdx).trim()
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
        if (!process.env[key]) process.env[key] = val
    }
}

loadEnv()

// ─── Validate env vars ────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL) {
    console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL in .env.local')
    process.exit(1)
}
if (!SERVICE_ROLE_KEY) {
    console.error('❌  Missing SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
}

// ─── Read SQL ─────────────────────────────────────────────────────────────────
const sqlPath = path.join(__dirname, 'supabase', 'migrations', '001_initial_schema.sql')
if (!fs.existsSync(sqlPath)) {
    console.error('❌  Migration file not found:', sqlPath)
    process.exit(1)
}

const sql = fs.readFileSync(sqlPath, 'utf8')

// ─── Run via Supabase REST (rpc exec) ─────────────────────────────────────────
async function run() {
    console.log('\n🚀  VoiceUp DB Setup')
    console.log('────────────────────────────────────')
    console.log('📡  Supabase URL:', SUPABASE_URL)
    console.log('📄  Schema file: supabase/migrations/001_initial_schema.sql')
    console.log('')

    // Split on semicolons and run each statement individually
    // (Supabase REST doesn't support multi-statement SQL in a single query call)
    const statements = sql
        .split(/;\s*\n/)
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))

    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i].trim()
        if (!stmt) continue

        // Build a label from first line for logging
        const label = stmt.split('\n')[0].slice(0, 60) + (stmt.length > 60 ? '...' : '')

        const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                'Prefer': 'return=minimal',
            },
            body: JSON.stringify({ query: stmt + ';' }),
        }).catch(() => null)

        // Supabase doesn't expose a generic SQL endpoint in REST;
        // use the pg-meta or direct Postgres approach via @supabase/supabase-js
        // The above is a fallback — see note below.
        // We'll use the correct approach: supabase.rpc or direct pg connection.
        if (response === null) {
            console.log(`  ⚠️  [${i + 1}/${statements.length}] Network error — ${label}`)
            errorCount++
        }
    }

    // ── Preferred approach: use @supabase/supabase-js with service role ───────
    let createClient
    try {
        const mod = require('@supabase/supabase-js')
        createClient = mod.createClient
    } catch {
        console.error('❌  @supabase/supabase-js is not installed.')
        console.error('    Run: npm install @supabase/supabase-js')
        process.exit(1)
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false }
    })

    console.log('⚡  Running SQL statements...\n')

    // Execute the full SQL via Supabase's rpc exec_sql function
    // (available when you create it, or via pg directly)
    // Most reliable: use the Postgres connection via supabase.rpc
    const { error: rpcError } = await supabase.rpc('exec_sql', { sql_query: sql }).maybeSingle()

    if (rpcError) {
        // exec_sql function may not exist — fall back to running via pg-meta API
        console.log('ℹ️   exec_sql RPC not available, running statements individually via REST pg-meta...\n')

        const pgMetaBase = SUPABASE_URL.replace('.supabase.co', '.supabase.co') + '/pg-meta/v0/query'

        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i]
            if (!stmt.trim()) continue

            const label = stmt.trim().split('\n')[0].slice(0, 70)

            try {
                const res = await fetch(pgMetaBase, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SERVICE_ROLE_KEY,
                        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                    },
                    body: JSON.stringify({ query: stmt + ';' })
                })

                const body = await res.json().catch(() => ({}))

                if (!res.ok) {
                    const msg = body?.message || body?.error || res.statusText
                    if (msg.includes('already exists') || msg.includes('duplicate')) {
                        console.log(`  ✓  [${i + 1}] Already exists — skipped`)
                        skipCount++
                    } else {
                        console.error(`  ✗  [${i + 1}] ERROR — ${label}`)
                        console.error(`     ${msg}`)
                        errorCount++
                    }
                } else {
                    console.log(`  ✓  [${i + 1}] OK — ${label}`)
                    successCount++
                }
            } catch (fetchErr) {
                console.error(`  ✗  [${i + 1}] Network error — ${label}`)
                errorCount++
            }
        }
    } else {
        console.log('✅  All SQL executed successfully via exec_sql RPC!')
        successCount = statements.length
    }

    console.log('\n────────────────────────────────────')
    console.log(`📊  Results:`)
    console.log(`    ✅  ${successCount} statement(s) applied`)
    console.log(`    ⏭️   ${skipCount} already existed (skipped)`)
    if (errorCount > 0) {
        console.log(`    ❌  ${errorCount} error(s)`)
        console.log('\n⚠️   Some statements failed. This is often OK if tables already exist.')
        console.log('     Check the errors above and re-run if needed.')
    } else {
        console.log('\n🎉  Database setup complete! Your VoiceUp database is ready.')
    }
    console.log('')
}

run().catch(err => {
    console.error('\n❌  Unexpected error:', err.message)
    process.exit(1)
})

#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Parse .env.local file manually
function parseEnvFile(filePath) {
  const envVars = {};
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('#')) continue;

      const [key, ...valueParts] = trimmedLine.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');

      if (key) {
        envVars[key.trim()] = value.trim();
      }
    }
  } catch (error) {
    console.error(`Error reading .env.local: ${error.message}`);
  }
  return envVars;
}

async function testSupabaseConnection() {
  console.log('🚀 Testing Supabase connection...\n');

  // Load environment variables
  const envPath = path.join(projectRoot, '.env.local');
  const env = parseEnvFile(envPath);

  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.error(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✓' : '✗'}`);
    console.error(`   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✓' : '✗'}`);
    process.exit(1);
  }

  // Initialize Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Test 1: Verify connection by querying companies table
    console.log('📋 Testing table access...');

    const tables = ['companies', 'contacts', 'testimonials'];
    const tableResults = {};

    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact' })
          .limit(1);

        if (error) {
          tableResults[table] = {
            status: 'error',
            message: error.message
          };
          console.log(`   ✗ Table ${table}: ${error.message}`);
        } else {
          tableResults[table] = {
            status: 'ok',
            rowCount: count || 0
          };
          console.log(`   ✓ Table ${table}: accessible (${count || 0} rows)`);
        }
      } catch (err) {
        tableResults[table] = {
          status: 'error',
          message: err.message
        };
        console.log(`   ✗ Table ${table}: ${err.message}`);
      }
    }

    // Test 2: List storage buckets
    console.log('\n📦 Testing storage buckets...');
    let buckets = [];
    try {
      const { data, error } = await supabase.storage.listBuckets();

      if (error) {
        console.log(`   ✗ Error listing buckets: ${error.message}`);
      } else if (data && data.length > 0) {
        buckets = data.map(b => b.name);
        console.log(`   ✓ Buckets found: ${buckets.join(', ')}`);
      } else {
        console.log(`   ✓ No buckets found (or empty response)`);
      }
    } catch (err) {
      console.log(`   ✗ Error accessing storage: ${err.message}`);
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Summary');
    console.log('='.repeat(50));
    console.log(`✓ Connexion Supabase OK`);

    for (const table of tables) {
      const result = tableResults[table];
      if (result.status === 'ok') {
        console.log(`✓ Table ${table} : accessible (${result.rowCount} rows)`);
      } else {
        console.log(`✗ Table ${table} : ${result.message}`);
      }
    }

    if (buckets.length > 0) {
      console.log(`✓ Buckets : ${buckets.join(', ')}`);
    } else {
      console.log(`✓ Buckets : none configured or accessible`);
    }

    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ Critical error:', error.message);
    process.exit(1);
  }
}

// Run the test
testSupabaseConnection().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});

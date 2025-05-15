import dotenv from 'dotenv';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import type { AcsCode } from '../src/lib/types/acs';

// Define __filename and __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename); // Using scriptDir to avoid any potential __dirname conflicts

// Configure dotenv
dotenv.config({ path: path.resolve(scriptDir, '../.env.local') });

// Ensure environment variables are loaded.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL is not set (checked after dotenv processing).');
  process.exit(1);
}
if (!supabaseServiceRoleKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is not set (checked after dotenv processing).');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const acsDataDir = path.join(scriptDir, '../src/lib/acs-codes'); // Use scriptDir here

async function getAcsCodeFiles(): Promise<string[]> {
  try {
    const files = await fs.readdir(acsDataDir);
    return files.filter((file) => file.endsWith('.ts')).map((file) => path.join(acsDataDir, file));
  } catch (error) {
    console.error(`Error reading ACS data directory ${acsDataDir}:`, error);
    return [];
  }
}

async function seedDatabase() {
  console.log('Starting ACS codes database seeding...');
  const codeFiles = await getAcsCodeFiles();

  if (codeFiles.length === 0) {
    console.log('No ACS code data files found in src/lib/acs-codes/. Exiting.');
    return;
  }

  for (const filePath of codeFiles) {
    const fileName = path.basename(filePath);
    console.log(`Processing ${fileName}...`);

    try {
      const fileUrl = pathToFileURL(filePath).href; // Convert path to file URL
      const importedModule = await import(fileUrl); // Import using the file URL
      const acsCodes: AcsCode[] = importedModule.AcsCodes;

      if (!acsCodes || !Array.isArray(acsCodes)) {
        console.warn(`Warning: No AcsCodes array found or not an array in ${fileName}. Skipping.`);
        continue;
      }

      if (acsCodes.length === 0) {
        console.log(`No codes to seed from ${fileName}.`);
        continue;
      }

      // --- Start: Identify and log duplicate IDs ---
      const idCounts = new Map<string, number>();
      const duplicateIds: string[] = [];
      for (const code of acsCodes) {
        if (code.id) {
          const count = (idCounts.get(code.id) || 0) + 1;
          idCounts.set(code.id, count);
          if (count === 2) {
            // Log only when it becomes a duplicate
            duplicateIds.push(code.id);
          }
        }
      }

      if (duplicateIds.length > 0) {
        console.warn(
          `Warning: Duplicate IDs found in ${fileName}: ${duplicateIds.join(', ')}. These will cause issues with upsert if not unique.`
        );
        // Strategy: Filter out duplicates, keeping the first occurrence.
        const seenIds = new Set<string>();
        const uniqueAcsCodes = acsCodes.filter((code) => {
          if (!code.id || seenIds.has(code.id)) {
            return false;
          }
          seenIds.add(code.id);
          return true;
        });
        console.log(
          `Proceeding with ${uniqueAcsCodes.length} unique codes from ${fileName} after filtering duplicates.`
        );
        // Re-assign acsCodes to the filtered list if you want to proceed with unique ones
        // For now, this log just informs. The original acsCodes is still used below.
        // To actually use the filtered list: acsCodes = uniqueAcsCodes;
      }
      // --- End: Identify and log duplicate IDs ---

      const codesToInsert = acsCodes.map((code) => ({
        id: code.id,
        description: code.description,
        area: code.area,
        task: code.task,
        sub_task: code.sub_task,
        knowledge_area: code.knowledge_area,
        exam_type: code.exam_type,
      }));

      const validCodesToInsert = codesToInsert.filter((code) => code.id && code.exam_type != null);
      const invalidCount = codesToInsert.length - validCodesToInsert.length;

      if (invalidCount > 0) {
        console.warn(
          `Warning: ${invalidCount} records from ${fileName} were missing a valid exam_type and were skipped.`
        );
      }

      if (validCodesToInsert.length === 0) {
        console.log(`No valid codes with exam_type to seed from ${fileName}.`);
        continue;
      }

      const { error } = await supabase
        .from('acs_codes')
        .upsert(validCodesToInsert, { onConflict: 'id', ignoreDuplicates: false });

      if (error) {
        console.error(`Error seeding data from ${fileName}:`, error.message);
      } else {
        console.log(
          `Successfully seeded/updated ${validCodesToInsert.length} codes from ${fileName}.`
        );
      }
    } catch (error: unknown) {
      console.error('An error occurred during the seeding process:');
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        if (error.stack) {
          console.error('Stack trace:', error.stack);
        }
      } else {
        console.error('Non-Error object thrown:', error);
      }
      process.exit(1);
    }
  }

  console.log('Database seeding process finished.');
}

seedDatabase().catch((error) => {
  console.error('Unhandled error during database seeding:', error);
  process.exit(1);
});

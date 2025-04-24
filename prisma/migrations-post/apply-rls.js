// Post-migration script to apply RLS policies
// This script should be run after Prisma migrations
const { PrismaClient } = require('@prisma/client')
const fs = require('fs');
const path = require('path');

// Record migration execution to avoid duplicates
const MIGRATION_MARKER = path.join(__dirname, '.rls-applied');

async function applyRLSPolicies() {
  // Check if RLS has already been applied in this environment
  if (fs.existsSync(MIGRATION_MARKER)) {
    console.log('RLS policies have already been applied. Skipping.');
    return;
  }

  const prisma = new PrismaClient()
  console.log('Applying RLS policies after migration...')

  try {
    // Create user context functions
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION current_user_id()
      RETURNS INTEGER AS $$
      BEGIN
        RETURN NULLIF(current_setting('app.current_user_id', TRUE), '')::INTEGER;
      EXCEPTION
        WHEN OTHERS THEN
          RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `)

    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION current_user_role()
      RETURNS TEXT AS $$
      BEGIN
        RETURN current_setting('app.user_role', TRUE);
      EXCEPTION
        WHEN OTHERS THEN
          RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `)

    // Enable RLS on key tables
    const tables = [
      'Tender', 'Bid', 'Document', 'TenderHistory', 
      'BidEvaluationLog', 'EvaluationCommittee', 'BidEvaluationCriteria'
    ]
    
    for (const table of tables) {
      // Drop any existing policies to avoid conflicts
      try {
        await prisma.$executeRawUnsafe(`
          DROP POLICY IF EXISTS tender_isolation ON "${table}";
          DROP POLICY IF EXISTS bid_tender_ownership ON "${table}";
          DROP POLICY IF EXISTS document_ownership ON "${table}";
          DROP POLICY IF EXISTS tender_history_isolation ON "${table}";
          DROP POLICY IF EXISTS evaluation_log_isolation ON "${table}";
          DROP POLICY IF EXISTS committee_isolation ON "${table}";
          DROP POLICY IF EXISTS criteria_isolation ON "${table}";
        `);
      } catch (e) {
        // Ignore errors from non-existent policies
      }
      
      // Enable RLS
      await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`)
    }
    
    // Create policies for each table
    
    // Tender policy
    await prisma.$executeRawUnsafe(`
      CREATE POLICY tender_isolation ON "Tender"
        FOR ALL
        TO PUBLIC
        USING (
          ("issuerId" = current_user_id() OR "procurementOfficerId" = current_user_id())
        );
    `)
    
    // Bid policy
    await prisma.$executeRawUnsafe(`
      CREATE POLICY bid_tender_ownership ON "Bid"
        FOR ALL
        TO PUBLIC
        USING (
          "tenderId" IN (
            SELECT id FROM "Tender" 
            WHERE "issuerId" = current_user_id() OR "procurementOfficerId" = current_user_id()
          )
        );
    `)
    
    // Document policy
    await prisma.$executeRawUnsafe(`
      CREATE POLICY document_ownership ON "Document"
        FOR ALL
        TO PUBLIC
        USING (
          "userId" = current_user_id() OR
          "tenderId" IN (
            SELECT id FROM "Tender" 
            WHERE "issuerId" = current_user_id() OR "procurementOfficerId" = current_user_id()
          ) OR
          "bidId" IN (
            SELECT id FROM "Bid"
            WHERE "tenderId" IN (
              SELECT id FROM "Tender" 
              WHERE "issuerId" = current_user_id() OR "procurementOfficerId" = current_user_id()
            )
          )
        );
    `)
    
    // TenderHistory policy
    await prisma.$executeRawUnsafe(`
      CREATE POLICY tender_history_isolation ON "TenderHistory"
        FOR ALL
        TO PUBLIC
        USING (
          "tenderId" IN (
            SELECT id FROM "Tender" 
            WHERE "issuerId" = current_user_id() OR "procurementOfficerId" = current_user_id()
          )
        );
    `)
    
    // BidEvaluationLog policy
    await prisma.$executeRawUnsafe(`
      CREATE POLICY evaluation_log_isolation ON "BidEvaluationLog"
        FOR ALL
        TO PUBLIC
        USING (
          "evaluatedBy" = current_user_id() OR
          "tenderId" IN (
            SELECT id FROM "Tender" 
            WHERE "issuerId" = current_user_id() OR "procurementOfficerId" = current_user_id()
          )
        );
    `)
    
    // EvaluationCommittee policy
    await prisma.$executeRawUnsafe(`
      CREATE POLICY committee_isolation ON "EvaluationCommittee"
        FOR ALL
        TO PUBLIC
        USING (
          "userId" = current_user_id() OR
          "tenderId" IN (
            SELECT id FROM "Tender" 
            WHERE "issuerId" = current_user_id() OR "procurementOfficerId" = current_user_id()
          )
        );
    `)
    
    // BidEvaluationCriteria policy
    await prisma.$executeRawUnsafe(`
      CREATE POLICY criteria_isolation ON "BidEvaluationCriteria"
        FOR ALL
        TO PUBLIC
        USING (
          "tenderId" IN (
            SELECT id FROM "Tender" 
            WHERE "issuerId" = current_user_id() OR "procurementOfficerId" = current_user_id()
          )
        );
    `)
    
    console.log('RLS policies successfully applied!')
    
    // Mark migration as applied
    fs.writeFileSync(MIGRATION_MARKER, new Date().toISOString());
    
  } catch (error) {
    console.error('Error applying RLS policies:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Export for import in package.json scripts
module.exports = { applyRLSPolicies }

// Allow direct execution
if (require.main === module) {
  applyRLSPolicies()
    .catch(console.error)
}

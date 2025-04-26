# Innobid Row-Level Security (RLS) Implementation

This directory contains scripts that implement PostgreSQL Row-Level Security (RLS) for the Innobid application. RLS ensures data isolation between procurement officers, so each officer can only see their own tenders and related data.

## How It Works

1. **Post-Migration Hooks**: The RLS policies are automatically applied after each Prisma migration through custom scripts defined in package.json.

2. **User Context**: The implementation uses PostgreSQL session variables to identify the current user:
   - `app.current_user_id`: Contains the logged-in user's ID
   - `app.user_role`: Contains the user's role in the system

3. **Tables Protected**:
   - `Tender`: Only accessible to the issuer or assigned procurement officer
   - `Bid`: Only visible if related to an accessible tender
   - `Document`: Accessible only if owned by user or related to accessible tenders/bids
   - `TenderHistory`: Access limited to the officer's tenders
   - `BidEvaluationLog`: Only logs for tenders the user owns or evaluations they performed
   - `EvaluationCommittee`: Only committees for tenders the user owns or is part of
   - `BidEvaluationCriteria`: Only criteria for tenders the user owns

## Persistence Mechanism

The RLS policies are designed to persist through database schema changes:

1. When you run `npm run migrate` or `npm run db:push`, the RLS policies are automatically re-applied
2. A marker file `.rls-applied` is created to avoid duplicate application in the same environment
3. The script checks for existing policies and only creates missing ones

## Custom Commands

- `npm run db:rls`: Manually apply RLS policies
- `npm run migrate`: Run migrations and apply RLS policies
- `npm run db:push`: Push schema changes and apply RLS policies

## Performance Considerations

RLS adds a small overhead to database queries as each query is filtered based on the user context. This is optimized for the 8GB memory constraint of the development environment by:

1. Using efficient IN clauses for related tables
2. Applying policies only when needed
3. Ensuring proper indexing on foreign key columns

## Interaction with Subscription System

The RLS implementation is independent of the subscription system (Innobid Standard/AI plans), which is handled at the application level. This means:

1. Data isolation works regardless of subscription tier
2. AI feature access is still controlled by the `checkSubscriptionAccess()` function
3. Procurement officers see only their data, regardless of subscription status

## Troubleshooting

If you encounter issues with RLS:

1. Check if the user context is being properly set in Prisma queries
2. Verify that policies exist using: `SELECT * FROM pg_policies;`
3. Test direct database access to confirm policies are working
4. Run `npm run db:rls` to re-apply policies if needed

# Firestore Security Specification - SafeGuard

## Data Invariants
1. A user document must match the authenticated user's ID.
2. A contact must have a valid phone number format.
3. Evidence must include a timestamp and valid type.
4. Users can only access their own data subtree (`/users/{uid}`).

## The "Dirty Dozen" Payloads (Denial Tests)
1. Set `displayName` of another user.
2. Read `contacts` of another user.
3. Write `Evidence` with a fake `timestamp` (not server time).
4. Create a `User` document with someone else's `phoneNumber`.
5. Update `Evidence` after it has been created (Evidence should be immutable).
6. Delete another user's `Contact`.
7. inject 1MB string into `displayName`.
8. Create a `Contact` without a `name`.
9. Set `createdAt` to a future date.
10. Query all `contacts` across all users (Blanket read).
11. Update `phoneNumber` without re-verifying (Immortality check).
12. Add a `Contact` with an invalid ID format.

## Test Runner (Draft)
```typescript
// Tests would be implemented in firestore.rules.test.ts using @firebase/rules-unit-testing
```

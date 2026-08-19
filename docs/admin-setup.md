# Admin dashboard setup

The dashboard lives at `/admin` and is gated by Supabase Auth. There is no
self-service signup: admin access is granted deliberately, in two steps.

## 1. Create the account

In the Supabase dashboard: **Authentication → Users → Add user**, with
"Auto Confirm User" enabled so no email round-trip is needed.

This step is intentionally manual — passwords should be set by you, not
stored anywhere in this repo.

## 2. Grant admin rights

Being able to sign in is not the same as being an admin. Add the user to
`admin_users`, replacing the email:

```sql
insert into admin_users (user_id, email)
select id, email from auth.users where email = 'you@example.com';
```

Sign in at `/admin/login`. A signed-in user who is *not* in `admin_users` is
redirected back with an explanatory message.

## How access is enforced

Three independent layers, so a mistake in one does not expose data:

1. **Middleware** (`src/middleware.ts`) redirects anonymous requests away from
   `/admin/*` before any page renders.
2. **`requireAdmin()`** runs on every admin page and server action, and checks
   `admin_users` membership rather than just a valid session.
3. **Row Level Security** is the real boundary. Admin-only policies use the
   `is_admin()` helper, so even a leaked anon key cannot read enquiries, read
   unapproved reviews, or edit the catalog.

Verified with the anon key: `admin_users` and `enquiries` return `[]`, unapproved
reviews are invisible, and `UPDATE` attempts on `places` and `reviews` are
rejected.

## Removing an admin

```sql
delete from admin_users where email = 'them@example.com';
```

Revoking the row is enough; their login still works but `/admin` will refuse it.

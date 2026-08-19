-- These SECURITY DEFINER functions were reachable over the REST RPC endpoint
-- by anonymous callers. None is meant to be called directly:
--   reviews_rollup      - trigger function, fires as the table owner
--   rls_auto_enable     - event trigger, fires as the owner
--   recalc_place_rating - internal helper invoked by the rollup trigger
--
-- Postgres grants EXECUTE to PUBLIC on new functions, so revoking from
-- anon/authenticated alone is a no-op: the PUBLIC grant must go too.
revoke execute on function public.is_admin() from anon, authenticated, public;
revoke execute on function public.recalc_place_rating(uuid) from anon, authenticated, public;
revoke execute on function public.reviews_rollup() from anon, authenticated, public;
revoke execute on function public.rls_auto_enable() from anon, authenticated, public;

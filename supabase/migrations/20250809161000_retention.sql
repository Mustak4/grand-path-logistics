-- Retention utility: delete routes older than N days (default 7)
create or replace function public.delete_old_routes(_days integer default 7)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.routes r
  where r.datum < (current_date - _days);
  -- stops are deleted via ON DELETE CASCADE
end;
$$;

-- You can schedule this function to run daily via Supabase Scheduled Jobs
-- Dashboard → Database → Schedules → New schedule →
--   call public.delete_old_routes(7);



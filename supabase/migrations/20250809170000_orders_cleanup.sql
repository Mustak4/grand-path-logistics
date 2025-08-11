-- Cleanup finished orders older than N hours (default 24)
-- Logic:
--  1) Remove stops that are completed (zavrseno) and whose route date is older than NOW() - _hours
--  2) Remove orders older than the same threshold that have no remaining stops

create or replace function public.delete_finished_orders_older_than(_hours integer default 24)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Delete completed stops attached to routes older than the threshold
  delete from public.stops s
  using public.routes r
  where s.ruta_id = r.id
    and s.status = 'zavrseno'
    and (r.datum::timestamptz + make_interval(hours => _hours)) < now();

  -- Delete orders older than the threshold that are no longer referenced by any stop
  delete from public.orders o
  where o.datum < (now() - make_interval(hours => _hours))
    and not exists (
      select 1 from public.stops s where s.naracka_id = o.id
    );
end;
$$;

-- To schedule this daily in Supabase (Dashboard → Database → Schedules):
-- call public.delete_finished_orders_older_than(24);



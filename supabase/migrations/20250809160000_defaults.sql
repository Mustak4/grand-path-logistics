-- Set sensible defaults so UI can omit these fields on create

-- Clients: default tip_naplata to 'faktura' (clients no longer choose at onboarding)
alter table public.clients
  alter column tip_naplata set default 'faktura';

-- Backfill any existing nulls just in case
update public.clients set tip_naplata = 'faktura' where tip_naplata is null;

-- Orders: default metod_plakanje to 'gotovo' (cash) if not specified by UI
alter table public.orders
  alter column metod_plakanje set default 'gotovo';



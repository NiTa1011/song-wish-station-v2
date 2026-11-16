-- Adds the "played" status for music requests, so the DJ can mark songs as
-- played and keep the open list short over the evening.

ALTER TABLE public.music_requests
  DROP CONSTRAINT IF EXISTS music_requests_status_check;

ALTER TABLE public.music_requests
  ADD CONSTRAINT music_requests_status_check
  CHECK (status IN ('pending', 'accepted', 'rejected', 'played'));

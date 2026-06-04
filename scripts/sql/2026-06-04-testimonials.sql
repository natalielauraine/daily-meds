-- Testimonials table for public feedback form submissions.
-- Unlike the `reviews` table (tied to auth users), this accepts
-- submissions from anyone via the /testimonials page form.
-- Nat reviews them in admin before they appear anywhere.

CREATE TABLE IF NOT EXISTS public.testimonials (
  id          uuid        NOT NULL DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  email       text        NOT NULL,
  testimonial text        NOT NULL,
  status      text        NOT NULL DEFAULT 'pending'
                          CHECK (status = ANY (ARRAY['pending', 'approved', 'rejected'])),
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT  testimonials_pkey PRIMARY KEY (id)
);

-- RLS: service-role key inserts (API route), no public read needed yet.
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Allow the API route (using service-role key) to insert.
-- No public SELECT policy — testimonials only visible through admin or
-- a future approved-testimonials endpoint.
CREATE POLICY "testimonials_service_insert"
  ON public.testimonials
  FOR INSERT
  WITH CHECK (true);

-- 🚀 Create VIP Experience Inquiries Table
-- Link: guest_id -> public.guests(id)
-- Constraints: cascade deletes to avoid orphans

CREATE TABLE IF NOT EXISTS public.experience_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
    inquiry_type TEXT NOT NULL,          -- e.g. 'Private Inquiry' or 'VIP Potential'
    event_date DATE,
    group_size TEXT,
    occasion TEXT,
    preferred_vibe TEXT,
    budget_range TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index guest_id for rapid joins
CREATE INDEX IF NOT EXISTS idx_experience_inquiries_guest_id ON public.experience_inquiries(guest_id);

-- Enable RLS for security (MANDATORY per schema guidelines)
ALTER TABLE public.experience_inquiries ENABLE ROW LEVEL SECURITY;

-- Anonymous users (public) can insert inquiries via frontend forms
CREATE POLICY "Allow anonymous inserts" ON public.experience_inquiries
    FOR INSERT WITH CHECK (true);

-- No public select/update/delete policies exist, ensuring that inquiries remain strictly private from public eyes.

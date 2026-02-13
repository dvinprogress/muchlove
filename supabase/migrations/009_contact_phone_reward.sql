-- Add phone and reward fields to contacts table
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS reward TEXT;

-- Phone: optional phone number for SMS/WhatsApp
-- Reward: optional text describing the reward offered for testimonial (e.g. "10% discount", "Free month")

-- Add delivery timestamps to espetos table
ALTER TABLE espetos ADD COLUMN "startedAt" TIMESTAMP,
ADD COLUMN "completedAt" TIMESTAMP;

-- Create index for faster queries
CREATE INDEX idx_espetos_startedAt ON espetos("startedAt");
CREATE INDEX idx_espetos_completedAt ON espetos("completedAt");

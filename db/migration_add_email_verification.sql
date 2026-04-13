-- Migration: add email verification columns to users table
-- Run this once against an existing database.

ALTER TABLE users
  ADD COLUMN email              VARCHAR(255) NULL UNIQUE AFTER username,
  ADD COLUMN email_verified     BOOLEAN      NOT NULL DEFAULT FALSE AFTER email,
  ADD COLUMN verification_token VARCHAR(255) NULL AFTER email_verified,
  ADD COLUMN token_expires_at   DATETIME     NULL AFTER verification_token,
  ADD INDEX  idx_email               (email),
  ADD INDEX  idx_verification_token  (verification_token);

-- Mark all existing users (including admin created via /api/auth/setup) as verified
-- so they can still log in without going through email verification.
UPDATE users SET email_verified = TRUE;

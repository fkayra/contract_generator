/*
  # Create contracts and invoices tables

  ## Overview
  This migration creates two tables to store generated contracts and invoices locally within the application.

  ## New Tables
  
  ### `contracts`
  - `id` (uuid, primary key) - Unique identifier for each contract
  - `player_name` (text) - Name of the player
  - `team_name` (text) - Name of the team
  - `season` (text) - Season information
  - `contract_data` (jsonb) - Complete contract form data
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `invoices`
  - `id` (uuid, primary key) - Unique identifier for each invoice
  - `client_name` (text) - Name of the client
  - `invoice_number` (text) - Invoice number
  - `invoice_data` (jsonb) - Complete invoice form data
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - RLS is enabled on both tables
  - Public access is allowed for this local application (no auth required)
  - Anyone can create, read, update, and delete records
*/

-- Create contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL,
  team_name text NOT NULL,
  season text NOT NULL,
  contract_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name text NOT NULL,
  invoice_number text NOT NULL,
  invoice_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create policies for contracts (public access for local app)
CREATE POLICY "Anyone can view contracts"
  ON contracts
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert contracts"
  ON contracts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update contracts"
  ON contracts
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete contracts"
  ON contracts
  FOR DELETE
  USING (true);

-- Create policies for invoices (public access for local app)
CREATE POLICY "Anyone can view invoices"
  ON invoices
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert invoices"
  ON invoices
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update invoices"
  ON invoices
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete invoices"
  ON invoices
  FOR DELETE
  USING (true);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS contracts_player_name_idx ON contracts(player_name);
CREATE INDEX IF NOT EXISTS contracts_created_at_idx ON contracts(created_at DESC);
CREATE INDEX IF NOT EXISTS invoices_client_name_idx ON invoices(client_name);
CREATE INDEX IF NOT EXISTS invoices_invoice_number_idx ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS invoices_created_at_idx ON invoices(created_at DESC);
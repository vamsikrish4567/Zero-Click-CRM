-- BigQuery Schema for Zero-Click CRM
-- Run these commands in Google Cloud Console or using the bq command-line tool

-- Create dataset
CREATE SCHEMA IF NOT EXISTS crm_data;

-- Contacts table
CREATE TABLE IF NOT EXISTS crm_data.contacts (
  id STRING NOT NULL,
  name STRING NOT NULL,
  email STRING,
  phone STRING,
  company_id STRING,
  title STRING,
  source STRING NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Companies table
CREATE TABLE IF NOT EXISTS crm_data.companies (
  id STRING NOT NULL,
  name STRING NOT NULL,
  website STRING,
  industry STRING,
  size STRING,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

-- Interactions table
CREATE TABLE IF NOT EXISTS crm_data.interactions (
  id STRING NOT NULL,
  contact_id STRING NOT NULL,
  type STRING NOT NULL,
  date TIMESTAMP NOT NULL,
  summary STRING NOT NULL,
  raw_content STRING,
  sentiment STRING,
  extracted_entities ARRAY<STRING>,
  created_at TIMESTAMP NOT NULL
);

-- Deals table
CREATE TABLE IF NOT EXISTS crm_data.deals (
  id STRING NOT NULL,
  contact_id STRING NOT NULL,
  company_id STRING,
  title STRING NOT NULL,
  value FLOAT64,
  stage STRING NOT NULL,
  next_step STRING,
  next_step_date TIMESTAMP,
  last_interaction TIMESTAMP,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);





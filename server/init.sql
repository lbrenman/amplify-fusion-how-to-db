-- Create types table
CREATE TABLE IF NOT EXISTS types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default types
INSERT INTO types (name) VALUES 
    ('video'),
    ('blog'),
    ('article'),
    ('podcast'),
    ('tool'),
    ('course'),
    ('documentation'),
    ('tutorial')
ON CONFLICT (name) DO NOTHING;

-- Create resources table
CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    url VARCHAR(2048),
    type_id INTEGER REFERENCES types(id) ON DELETE SET NULL,
    internal BOOLEAN DEFAULT FALSE,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tags TEXT,
    obsolete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_resources_type_id ON resources(type_id);
CREATE INDEX IF NOT EXISTS idx_resources_internal ON resources(internal);
CREATE INDEX IF NOT EXISTS idx_resources_obsolete ON resources(obsolete);
CREATE INDEX IF NOT EXISTS idx_resources_tags ON resources USING gin(to_tsvector('english', tags));

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_resources_updated_at 
    BEFORE UPDATE ON resources 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
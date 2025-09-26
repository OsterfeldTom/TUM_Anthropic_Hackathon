-- Update criteria preferences to new SPRIN-D framework
DELETE FROM criteria_preferences;

-- Insert new criteria with default factors
INSERT INTO criteria_preferences (criterion, factor) VALUES
('Novelty / Originality of Idea', 3),
('Technological Feasibility', 3),
('Scalability', 3),
('Impact Potential (Societal/Economic)', 3),
('Alignment with SPRIN-D "Breakthrough" Spirit', 3),
('Market / Application Potential', 3),
('Time Horizon to Market Readiness', 3),
('Team / Research Excellence', 3),
('Risk/Return Balance', 3),
('Strategic Fit for Germany/Europe', 3);

-- Note: Existing criteria_scores will remain as historical data
-- New evaluations will use the updated criteria list
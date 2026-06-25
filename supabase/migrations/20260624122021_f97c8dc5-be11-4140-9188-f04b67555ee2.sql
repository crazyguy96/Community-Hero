
CREATE TABLE IF NOT EXISTS public.civic_cases (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('Low','Medium','High','Critical')),
  department TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL DEFAULT 'Reported' CHECK (status IN ('Reported','Verified','Acknowledged','In Progress','Resolved')),
  verifications INTEGER NOT NULL DEFAULT 0,
  status_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.civic_cases TO anon, authenticated;
GRANT ALL ON public.civic_cases TO service_role;

ALTER TABLE public.civic_cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view civic cases" ON public.civic_cases;
CREATE POLICY "Anyone can view civic cases" ON public.civic_cases FOR SELECT USING (true);
DROP POLICY IF EXISTS "Anyone can report a civic case" ON public.civic_cases;
CREATE POLICY "Anyone can report a civic case" ON public.civic_cases FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can verify a civic case" ON public.civic_cases;
CREATE POLICY "Anyone can verify a civic case" ON public.civic_cases FOR UPDATE USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS civic_cases_created_at_idx ON public.civic_cases (created_at DESC);

INSERT INTO public.civic_cases (id, category, severity, department, description, location, lat, lng, status, verifications, status_history, created_at)
VALUES
('CH-4012','Road damage · pothole','High','PWD','Deep pothole obstructing the left traffic lane beside a pedestrian crossing.','MG Road · Ward 12, Delhi',28.5675,77.2434,'Acknowledged',24,
  jsonb_build_array(
    jsonb_build_object('status','Reported','at', to_char(now()-interval '4 days','YYYY-MM-DD"T"HH24:MI:SS"Z"')),
    jsonb_build_object('status','Verified','at', to_char(now()-interval '3 days','YYYY-MM-DD"T"HH24:MI:SS"Z"')),
    jsonb_build_object('status','Acknowledged','at', to_char(now()-interval '1 day','YYYY-MM-DD"T"HH24:MI:SS"Z"'))
  ), now()-interval '4 days'),
('CH-4007','Garbage overflow','Medium','MCD Sanitation','Overflowing waste collection point attracting stray animals.','Lajpat Nagar II · Ward 144',28.5677,77.2431,'In Progress',11,
  jsonb_build_array(
    jsonb_build_object('status','Reported','at', to_char(now()-interval '2 days','YYYY-MM-DD"T"HH24:MI:SS"Z"')),
    jsonb_build_object('status','Verified','at', to_char(now()-interval '2 days','YYYY-MM-DD"T"HH24:MI:SS"Z"')),
    jsonb_build_object('status','In Progress','at', to_char(now()-interval '1 day','YYYY-MM-DD"T"HH24:MI:SS"Z"'))
  ), now()-interval '2 days'),
('CH-3988','Streetlight outage','Low','MCD Electrical','Streetlights dark across two blocks near the park entrance.','Vasant Kunj · Sector B',28.5208,77.1581,'Resolved',18,
  jsonb_build_array(
    jsonb_build_object('status','Reported','at', to_char(now()-interval '6 days','YYYY-MM-DD"T"HH24:MI:SS"Z"')),
    jsonb_build_object('status','Verified','at', to_char(now()-interval '5 days','YYYY-MM-DD"T"HH24:MI:SS"Z"')),
    jsonb_build_object('status','Acknowledged','at', to_char(now()-interval '4 days','YYYY-MM-DD"T"HH24:MI:SS"Z"')),
    jsonb_build_object('status','In Progress','at', to_char(now()-interval '2 days','YYYY-MM-DD"T"HH24:MI:SS"Z"')),
    jsonb_build_object('status','Resolved','at', to_char(now(),'YYYY-MM-DD"T"HH24:MI:SS"Z"'))
  ), now()-interval '6 days'),
('CH-4031','Road damage · pothole','Critical','PWD','Large pothole on a highway shoulder, vehicles swerving into traffic.','Highway NH-48 KM 12',28.4861,77.0855,'Reported',6,
  jsonb_build_array(
    jsonb_build_object('status','Reported','at', to_char(now(),'YYYY-MM-DD"T"HH24:MI:SS"Z"'))
  ), now())
ON CONFLICT (id) DO NOTHING;

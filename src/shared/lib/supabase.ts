import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://acwcioidstkmqnldequl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjd2Npb2lkc3RrbXFubGRlcXVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2OTYzODEsImV4cCI6MjA5MTI3MjM4MX0.mNCsCwuwF2JWvclcPdDHLvX5Jk3uPrynj2k8l7fnkIs',
);

export interface ScoreEntry {
  id: number;
  name: string;
  score: number;
  level: number;
  created_at: string;
}

export async function fetchTopScores(limit = 10): Promise<ScoreEntry[]> {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .order('score', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as ScoreEntry[];
}

export async function submitScore(name: string, score: number, level: number): Promise<void> {
  const { error } = await supabase
    .from('scores')
    .insert({ name: name.slice(0, 20), score, level });

  if (error) throw error;
}

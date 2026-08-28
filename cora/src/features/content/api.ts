import { supabase } from '@/lib/supabase';
import type { Database } from '@/shared/types/database.types';

type LifeStage = Database['public']['Enums']['life_stage'];

const ARTICLE_LIST_FIELDS =
  'id, slug, title, summary, category_id, cover_emoji, reading_minutes, importance, reviewed_by_name, min_age';

/**
 * Sin fecha de nacimiento no hay forma de calcular la edad — se trata como
 * adulta (sin restricción de min_age) en vez de ocultar todo el contenido.
 * Desviación documentada del §15 (docs/PLAN_DE_IMPLEMENTACION.md).
 */
export function ageFromBirthYear(birthYear: number | null | undefined): number {
  if (!birthYear) return 99;
  return new Date().getFullYear() - birthYear;
}

export async function fetchCategories() {
  const { data, error } = await supabase.from('content_categories').select('*').order('sort_order');
  if (error) throw error;
  return data;
}

export async function fetchArticles({
  stage,
  age,
  categoryId,
}: {
  stage: LifeStage;
  age: number;
  categoryId?: string;
}) {
  let query = supabase
    .from('educational_content')
    .select(ARTICLE_LIST_FIELDS)
    .contains('life_stages', [stage])
    .lte('min_age', age)
    .order('importance', { ascending: false })
    .order('published_at', { ascending: false });

  if (categoryId) query = query.eq('category_id', categoryId);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function fetchArticleBySlug(slug: string) {
  const { data, error } = await supabase
    .from('educational_content')
    .select('*, content_categories(*), content_sources(*)')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
}

export async function fetchRecommendedArticles({
  stage,
  age,
  limit = 3,
}: {
  stage: LifeStage;
  age: number;
  limit?: number;
}) {
  const { data, error } = await supabase
    .from('educational_content')
    .select(ARTICLE_LIST_FIELDS)
    .contains('life_stages', [stage])
    .lte('min_age', age)
    .order('importance', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function searchArticles({
  query,
  stage,
  age,
}: {
  query: string;
  stage: LifeStage;
  age: number;
}) {
  const { data, error } = await supabase
    .from('educational_content')
    .select(ARTICLE_LIST_FIELDS)
    .contains('life_stages', [stage])
    .lte('min_age', age)
    .textSearch('search_vector', query, { type: 'websearch', config: 'spanish' });

  if (error) throw error;
  return data;
}

/**
 * Fallback semántico (Fase 19, CORA-114): solo se llama cuando searchArticles
 * (full-text, gratis) devuelve 0 resultados — una pregunta parafraseada no
 * comparte lexemas con ningún artículo, pero sí puede ser semánticamente
 * cercana. Requiere GEMINI_API_KEY, que nunca puede tocar el cliente, así
 * que vive en la Edge Function search-articles-semantic. La función solo
 * devuelve id/title/summary/similarity (lo que da la RPC) — se reconsulta
 * ARTICLE_LIST_FIELDS para que la lista de resultados tenga la misma forma
 * que searchArticles (cover_emoji, reading_minutes, etc. para la UI), y se
 * reordena porque `.in()` no conserva el orden de similitud.
 */
export async function searchArticlesSemantic({
  query,
  stage,
  age,
}: {
  query: string;
  stage: LifeStage;
  age: number;
}) {
  const { data, error } = await supabase.functions.invoke('search-articles-semantic', {
    body: { query, stage, age },
  });
  if (error) return [];

  const ranked = (data?.results ?? []) as { id: string }[];
  if (ranked.length === 0) return [];

  const { data: articles, error: articlesError } = await supabase
    .from('educational_content')
    .select(ARTICLE_LIST_FIELDS)
    .in(
      'id',
      ranked.map((r) => r.id)
    );
  if (articlesError || !articles) return [];

  const byId = new Map(articles.map((a) => [a.id, a]));
  return ranked.map((r) => byId.get(r.id)).filter((a): a is NonNullable<typeof a> => a !== undefined);
}

export async function fetchArticlesByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from('educational_content')
    .select('id, slug, title, cover_emoji')
    .in('id', ids);

  if (error) throw error;
  return data;
}

export function getArticleAudioUrl(audioPath: string): string {
  return supabase.storage.from('content-audio').getPublicUrl(audioPath).data.publicUrl;
}

export async function markArticleRead(articleId: string) {
  const { error } = await supabase.rpc('mark_article_read', { p_article_id: articleId });
  if (error) throw error;
}

-- 0007_seed_symptoms.sql
-- ~24 síntomas reales con categoría y etapas aplicables.
-- Se versiona como migración (idempotente, on conflict do nothing) por la
-- misma razón que 0003_seed_avatars.sql: no hay service_role disponible en
-- este entorno para correr supabase/seed/*.sql aparte contra el remoto.

insert into public.symptom_catalog (code, label_es, category, applicable_stages, icon, sort_order)
values
  -- physical
  ('cramps', 'Cólicos', 'physical', array['adolescencia','adultez','perimenopausia']::life_stage[], '🤕', 1),
  ('headache', 'Dolor de cabeza', 'physical', array['adolescencia','adultez','embarazo','perimenopausia','mayor']::life_stage[], '🤯', 2),
  ('bloating', 'Hinchazón abdominal', 'physical', array['adolescencia','adultez','embarazo','perimenopausia']::life_stage[], '🎈', 3),
  ('breast_tenderness', 'Sensibilidad en los senos', 'physical', array['adolescencia','adultez','embarazo','perimenopausia']::life_stage[], '💗', 4),
  ('back_pain', 'Dolor de espalda', 'physical', array['adolescencia','adultez','embarazo','perimenopausia','mayor']::life_stage[], '🦴', 5),
  ('joint_pain', 'Dolor articular', 'physical', array['perimenopausia','mayor']::life_stage[], '🦵', 6),

  -- emotional
  ('irritability', 'Irritabilidad', 'emotional', array['adolescencia','adultez','embarazo','perimenopausia']::life_stage[], '😤', 7),
  ('anxiety', 'Ansiedad', 'emotional', array['adolescencia','adultez','embarazo','perimenopausia','mayor']::life_stage[], '😟', 8),
  ('sadness', 'Tristeza', 'emotional', array['adolescencia','adultez','embarazo','perimenopausia','mayor']::life_stage[], '😢', 9),
  ('mood_swings', 'Cambios de ánimo', 'emotional', array['adolescencia','adultez','embarazo','perimenopausia']::life_stage[], '🎭', 10),

  -- digestive
  ('nausea', 'Náuseas', 'digestive', array['adolescencia','adultez','perimenopausia']::life_stage[], '🤢', 11),
  ('morning_sickness', 'Náuseas matutinas', 'digestive', array['embarazo']::life_stage[], '🌅', 12),
  ('constipation', 'Estreñimiento', 'digestive', array['adultez','embarazo','perimenopausia','mayor']::life_stage[], '🚻', 13),
  ('diarrhea', 'Diarrea', 'digestive', array['adolescencia','adultez','perimenopausia']::life_stage[], '💧', 14),
  ('appetite_changes', 'Cambios de apetito', 'digestive', array['adolescencia','adultez','embarazo','perimenopausia']::life_stage[], '🍽️', 15),

  -- skin
  ('acne', 'Acné', 'skin', array['adolescencia','adultez']::life_stage[], '🔴', 16),
  ('itching', 'Picazón en la piel', 'skin', array['embarazo','perimenopausia','mayor']::life_stage[], '🧴', 17),

  -- sleep
  ('insomnia', 'Insomnio', 'sleep', array['adultez','embarazo','perimenopausia','mayor']::life_stage[], '🌙', 18),
  ('fatigue', 'Fatiga', 'sleep', array['adolescencia','adultez','embarazo','perimenopausia','mayor']::life_stage[], '🥱', 19),

  -- other (síntomas específicos de perimenopausia/menopausia)
  ('hot_flashes', 'Sofocos', 'other', array['perimenopausia','mayor']::life_stage[], '🔥', 20),
  ('night_sweats', 'Sudoración nocturna', 'other', array['perimenopausia','mayor']::life_stage[], '💦', 21),
  ('vaginal_dryness', 'Sequedad vaginal', 'other', array['perimenopausia','mayor']::life_stage[], '🌵', 22),
  ('low_libido', 'Baja del deseo sexual', 'other', array['adultez','embarazo','perimenopausia','mayor']::life_stage[], '💤', 23),
  ('spotting_between_periods', 'Manchado entre periodos', 'other', array['adolescencia','adultez']::life_stage[], '🩸', 24)
on conflict (code) do nothing;

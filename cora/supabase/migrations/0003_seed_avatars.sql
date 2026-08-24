-- 0003_seed_avatars.sql
-- Seed de catálogo público (avatares). Se versiona como migración porque el
-- proyecto no tiene service_role disponible en el entorno de desarrollo para
-- correr supabase/seed/*.sql por separado contra el remoto; el contenido es
-- idéntico a supabase/seed/avatars.sql (que sigue siendo la fuente para
-- `supabase db reset` local) e idempotente (`on conflict do nothing`).

insert into public.avatars
  (code, name_es, species_scientific, habitat_es, fun_fact_es, conservation_status, image_path, sort_order)
values
  ('guardabarranco', 'Guardabarranco', 'Eumomota superciliosa',
   'Barrancos y bordes de bosque en todo el país',
   'Es el ave nacional de Nicaragua. Anida excavando túneles en las paredes de los barrancos.',
   'Preocupación menor', 'avatars/guardabarranco.png', 1),

  ('jaguar', 'Jaguar', 'Panthera onca',
   'Selvas del Caribe nicaragüense, como Bosawás',
   'Es el felino más grande de América. Su mordida es tan fuerte que puede perforar el caparazón de una tortuga.',
   'Casi amenazado', 'avatars/jaguar.png', 2),

  ('perezoso', 'Perezoso de dos dedos', 'Choloepus hoffmanni',
   'Bosques húmedos del Caribe y zonas montañosas',
   'Se mueve tan poco que le crecen algas en el pelaje, lo que le sirve de camuflaje.',
   'Preocupación menor', 'avatars/perezoso.png', 3),

  ('venado_cola_blanca', 'Venado cola blanca', 'Odocoileus virginianus',
   'Bosques secos del Pacífico y sabanas',
   'Cuando se asusta, levanta la cola blanca como señal de alerta para el resto de la manada.',
   'Preocupación menor', 'avatars/venado.png', 4),

  ('tortuga_paslama', 'Tortuga paslama', 'Lepidochelys olivacea',
   'Playas del Pacífico, especialmente La Flor y Chacocente',
   'Llega a las costas nicaragüenses en "arribadas": miles de tortugas desovando juntas en pocos días.',
   'Vulnerable', 'avatars/tortuga_paslama.png', 5),

  ('lapa_roja', 'Lapa roja', 'Ara macao',
   'Bosques del Pacífico y el Caribe',
   'Puede vivir más de 50 años y forma parejas de por vida.',
   'Preocupación menor', 'avatars/lapa_roja.png', 6),

  ('mono_congo', 'Mono congo', 'Alouatta palliata',
   'Bosques húmedos y secos de todo el país',
   'Su aullido se escucha hasta 5 kilómetros de distancia y sirve para marcar territorio.',
   'Preocupación menor', 'avatars/mono_congo.png', 7),

  ('danto', 'Danto (tapir centroamericano)', 'Tapirus bairdii',
   'Selvas de Bosawás y el Río San Juan',
   'Es el mamífero terrestre más grande de Centroamérica y ayuda a dispersar semillas por todo el bosque.',
   'En peligro', 'avatars/danto.png', 8)
on conflict (code) do nothing;

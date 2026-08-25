# Hydra Tattoo

Sitio web editorial y agenda online de Hydra Tattoo. Incluye portada, artista, diseños disponibles, galería, cuidados, reservas, consulta de citas y panel administrativo.

## Configuración de Supabase

1. Ejecuta `supabase-schema.sql` en **Supabase > SQL Editor**.
2. Ejecuta `supabase-storage-policies.sql`.
3. En **Authentication > Users**, crea la usuaria administradora con el correo autorizado.
4. Publica el repositorio con GitHub Pages, Netlify o Vercel.

La contraseña administrativa no se almacena en el frontend. Supabase Auth la gestiona de forma segura.

## Archivos principales

- `index.html`: sitio, agenda y panel administrativo.
- `supabase-schema.sql`: tablas y políticas de la agenda.
- `supabase-storage-policies.sql`: bucket para referencias y comprobantes.
- `assets/` y `disenos/`: recursos visuales.

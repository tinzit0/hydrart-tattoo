# Hydrart Tattoo

Landing y agenda online para Hydrart Tattoo, creada con HTML, CSS, JavaScript y Supabase.

## Puesta en marcha

1. Abre `supabase-schema.sql` en **Supabase → SQL Editor** y ejecútalo una sola vez.
2. Abre `index.html` con un servidor local (por ejemplo, Live Server).
3. Reemplaza los bloques de portada y galería cuando estén listas las fotografías.

La URL y clave publicable de Supabase están en `app.js`. Esta clase de clave está diseñada para frontend; la seguridad depende de RLS. Nunca pongas aquí una `service_role`.

## Agenda

- Calendario mensual y horarios disponibles.
- Bloqueo visual de horarios ya reservados.
- Solicitud con código privado `HYD-XXXXXX`.
- Consulta básica del estado mediante el código.

Las consultas públicas pasan por funciones RPC que solo devuelven fecha, hora y estado; los datos personales permanecen protegidos por RLS.

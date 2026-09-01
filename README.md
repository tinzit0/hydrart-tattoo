# Hydra Tattoo

Sitio web editorial y agenda online de Hydra Tattoo. Incluye portada, presentación de Claudia Medel, catálogo seleccionable de diseños disponibles, cotizador por WhatsApp, galería, cuidados, reservas, consulta de citas y panel administrativo.

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
- `assets/designs/`: catálogo web de 97 diseños disponibles.
- `assets/gallery-new/`: trabajos recientes de Claudia.
- `assets/claudia-medel.jpg`: retrato de la artista.

## Flujo de cotización

Cada diseño tiene un código `HYD-###`. La persona puede agregar varias piezas, completar zona, tamaño, estilo y color, y generar un mensaje de WhatsApp con todos los datos. Si selecciona una referencia local, el sitio le recuerda adjuntarla en el chat.

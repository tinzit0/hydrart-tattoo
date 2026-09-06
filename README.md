# Hydra Tattoo

Sitio web editorial y agenda online de Hydra Tattoo. Incluye portada, presentación de Claudia Medel, catálogo seleccionable de diseños disponibles, cotizador por WhatsApp, galería, cuidados, reservas, consulta de citas y panel administrativo.

## Configuración de Supabase

1. Ejecuta `supabase-schema.sql` en **Supabase > SQL Editor**.
2. Ejecuta `supabase-storage-policies.sql`.
3. En **Authentication > Users**, crea la usuaria administradora con el correo autorizado.
4. Publica el repositorio con GitHub Pages, Netlify o Vercel.

La contraseña administrativa no se almacena en el frontend. Supabase Auth la gestiona de forma segura.

## Edición desde la página

Inicia sesión en Panel Admin y pulsa Hydra Tattoo para volver al sitio. La sesión sigue activa: en Diseños aparece **Editar** y **Añadir diseño**, mientras que en Galería aparece **Añadir imagen**. Desde ahí puedes seleccionar archivos del dispositivo, cambiar título, categoría, precio, tamaño, imagen, disponibilidad y descripción. Los titulares y párrafos de las secciones editoriales muestran **Editar texto**. Cada formulario permite guardar o cancelar; los cambios publicados se almacenan en `hydrart_settings.value.content` mediante las políticas administrativas existentes.

Al pulsar la imagen o **Ver detalle**, se abre una ficha con la descripción y las acciones Agendar y Cotizar. No se inventan significados para los diseños que todavía no tienen descripción. El menú superior permanece fijo durante la navegación.

La ficha utiliza un diálogo dentro del sitio: evita los documentos HTML incrustados en JavaScript que interferían con la inyección de recarga de Live Server y dejaban código visible en pantalla.

Validación local: `node verify-site.cjs` (requiere Playwright y Chrome). Comprueba la ficha, la selección para Agenda, los controles de sesión, la edición, el menú fijo y el diálogo móvil. Las escrituras administrativas se simulan para no modificar datos reales.

## Archivos principales

- `index.html`: sitio, agenda y panel administrativo.
- `supabase-schema.sql`: tablas y políticas de la agenda.
- `supabase-storage-policies.sql`: bucket para referencias y comprobantes.
- `assets/designs/`: catálogo web de 97 diseños disponibles.
- `assets/gallery-new/`: trabajos recientes de Claudia.
- `assets/claudia-medel.jpg`: retrato de la artista.

## Flujo de cotización

Cada diseño tiene un código `HYD-###`. La persona puede agregar varias piezas, completar zona, tamaño, estilo y color, y generar un mensaje de WhatsApp con todos los datos. Si selecciona una referencia local, el sitio le recuerda adjuntarla en el chat.

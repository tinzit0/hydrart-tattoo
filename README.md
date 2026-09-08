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

## Horas acordadas por Instagram o WhatsApp

En **Panel Admin > Citas > Registrar hora tomada**, la tatuadora puede ingresar cliente, teléfono, Instagram o correo opcional, fecha, hora y observaciones. Se guarda como **Confirmada** en la misma agenda y ocupa ese horario en la página, sin exigir que el cliente haga una reserva web ni aplicar el vencimiento de 15 minutos. Permite registrar horarios acordados fuera de los bloques publicados. Se rechazan horarios ya ocupados; si falla el guardado, se conservan los datos para reintentar.

El buscador del panel filtra por nombre, teléfono, Instagram, código y notas, combinado con los filtros de mes y estado. **Limpiar** restablece todos los filtros.

La portada usa un fondo beige sin videos, subtítulos rectos y accesos permanentes a las secciones; los fondos verdes son oliva claro.

Las horas registradas manualmente aparecen como **Ocupado** en la agenda pública y en el calendario del panel, incluso fuera de los bloques publicados. Los días completos se pueden consultar sin permitir reservas. Cancelar una hora manual fuera del horario publicado no crea un nuevo cupo disponible.

El registro manual permite adjuntar varias fotos del dispositivo, previsualizarlas y quitarlas antes de guardar (hasta 10 fotos de 10 MB). Las fotos se suben al almacenamiento existente y se abren individualmente desde la cita. Si una subida falla, se conservan los datos para reintentar. Por compatibilidad con el esquema actual, `image_url` conserva una URL para una foto o una lista JSON para varias; el lector admite ambos formatos sin migración SQL.

El abono sugerido visible en la agenda y en la sección de transferencia es **$30.000 CLP**.

## Archivos del sitio

- `index.html`: sitio, agenda y panel administrativo.
- `supabase-schema.sql`: tablas y políticas de la agenda.
- `supabase-storage-policies.sql`: bucket para referencias y comprobantes.
- `assets/designs/`: catálogo web de 97 diseños disponibles.
- `assets/gallery-new/`: trabajos recientes de Claudia.
- `assets/claudia-medel.jpg`: retrato de la artista.

## Flujo de cotización

Cada diseño tiene un código `HYD-###`. La persona puede agregar varias piezas, completar zona, tamaño, estilo y color, y generar un mensaje de WhatsApp con todos los datos. Si selecciona una referencia local, el sitio le recuerda adjuntarla en el chat.

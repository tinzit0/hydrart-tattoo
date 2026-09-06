/* Public content editing uses the validated Supabase admin session. */
let contentSheet;
let sheetOpener;

// Las imágenes de contenido se eligen con el selector de archivos y se guardan
// en el bucket de Supabase; los campos de URL antiguos se retiran del formulario.
function useStorageImagePickers() {
    ['content-design-image', 'content-gallery-image'].forEach(id => document.getElementById(id)?.closest('div')?.remove());
    document.querySelectorAll('#content-design-file, #content-gallery-file').forEach(input => {
        const label = input.closest('div')?.querySelector('label');
        if (label) label.textContent = 'Seleccionar imagen desde almacenamiento';
    });
    document.getElementById('content-design-code')?.addEventListener('change', () => {
        const code = document.getElementById('content-design-code').value;
        const preview = document.getElementById('content-design-preview');
        if (preview) preview.dataset.existingImage = designOverrides[code]?.image || `assets/designs/diseno-${String(Number(code.replace('HYD-', ''))).padStart(3, '0')}.jpg`;
    });
    document.getElementById('content-gallery-code')?.addEventListener('change', () => {
        const number = document.getElementById('content-gallery-code').value;
        const preview = document.getElementById('content-gallery-preview');
        if (preview) preview.dataset.existingImage = galleryOverrides[number]?.image || `assets/gallery-new/trabajo-${String(number).padStart(2, '0')}.jpg`;
    });
}
useStorageImagePickers();
function closeContentSheet() { contentSheet.close(); sheetOpener?.focus(); }
function openContentSheet(markup) {
    if (!contentSheet) {
        contentSheet = document.createElement('dialog');
        contentSheet.className = 'content-sheet';
        contentSheet.setAttribute('aria-labelledby', 'sheet-title');
        document.body.appendChild(contentSheet);
    }
    sheetOpener = document.activeElement;
    contentSheet.innerHTML = '<button type="button" class="sheet-close" onclick="closeContentSheet()">Cerrar</button>' + markup;
    if (!contentSheet.open) contentSheet.showModal();
}
function showDesignSheet(number, editing = false) {
    const meta = getDesignMeta(number);
    if (meta.deleted) return;
    const field = (key, label) => `<label>${label}<input name="${key}" value="${escapeHTML(meta[key])}" required></label>`;
    const info = editing && currentUser ? `<form id="design-page-form">
        ${field('title', 'Título')}${field('category', 'Categoría')}${field('price', 'Precio')}${field('minSize', 'Tamaño mínimo')}
        <label>Descripción o significado<textarea name="description" rows="5">${escapeHTML(meta.description)}</textarea></label>
        <label>Imagen (URL)<input name="image" type="url" value="${escapeHTML(designOverrides[meta.code]?.image || '')}"></label>
        <label><input type="checkbox" name="available" ${meta.available ? 'checked' : ''}> Disponible</label>
        <p role="status" id="sheet-status"></p><button type="submit">Guardar cambios</button>
        <button type="button" onclick="showDesignSheet(${number})">Cancelar</button></form>` :
        `<p>${escapeHTML(meta.category)}</p><p>${escapeHTML(meta.price)} · ${escapeHTML(meta.minSize)}</p>
        <h3>Descripción y significado</h3><p>${escapeHTML(meta.description || 'Consulta a Claudia los detalles y el significado de este diseño.')}</p>
        <button type="button" ${meta.available ? '' : 'disabled'} onclick="closeContentSheet(); startBookingForDesign('${meta.code}')">${meta.available ? 'Agendar este diseño' : 'No disponible'}</button>
        <button type="button" onclick="closeContentSheet(); startQuoteForDesign('${meta.code}')">Cotizar</button>
        ${currentUser ? `<button type="button" onclick="showDesignSheet(${number}, true)">Editar diseño</button>` : ''}`;
    openContentSheet(`<h2 id="sheet-title">${escapeHTML(meta.title)}</h2><div class="sheet-grid"><img src="${escapeHTML(meta.image)}" alt="${escapeHTML(meta.title)}"><div>${info}</div></div>`);
    document.getElementById('design-page-form')?.addEventListener('submit', async event => {
        event.preventDefault();
        if (!currentUser) return;
        const form = event.currentTarget, button = form.querySelector('[type=submit]');
        button.disabled = true;
        const values = Object.fromEntries(new FormData(form));
        values.available = form.elements.available.checked;
        const previous = designOverrides[meta.code];
        designOverrides[meta.code] = { ...previous, ...values };
        try {
            if (!await saveContentConfig()) throw new Error('No se pudo guardar. Reintenta.');
            showDesignSheet(number);
        } catch (error) {
            if (previous) designOverrides[meta.code] = previous; else delete designOverrides[meta.code];
            document.getElementById('sheet-status').textContent = error.message;
        } finally { button.disabled = false; }
    });
}

function ensurePublicContentActions() {
    const designGrid = document.getElementById('design-grid');
    const galleryTrack = document.getElementById('galeria-track');
    [['public-add-design', designGrid, 'Añadir diseño', showNewDesignSheet], ['public-add-gallery', galleryTrack, 'Añadir imagen', showNewGallerySheet]].forEach(([id, anchor, label, action]) => {
        if (!anchor) return;
        let button = document.getElementById(id);
        if (currentUser && !button) {
            button = document.createElement('button'); button.id = id; button.type = 'button'; button.className = 'page-edit-button public-content-action'; button.textContent = `+ ${label}`; button.onclick = action;
            anchor.parentElement?.insertBefore(button, anchor);
        } else if (!currentUser) button?.remove();
    });
}

function showNewDesignSheet() {
    if (!currentUser) return;
    openContentSheet(`<h2 id="sheet-title">Añadir diseño</h2><form id="new-design-form" class="sheet-form">
      <label>Imagen del diseño<input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" required></label>
      <label>Título<input name="title" required placeholder="Ej: Rama de olivo"></label><label>Categoría<input name="category" placeholder="Botánico / ornamental"></label>
      <label>Precio<input name="price" placeholder="Desde $30.000"></label><label>Tamaño mínimo<input name="minSize" placeholder="Consultar tamaño mínimo"></label>
      <label>Descripción o significado<textarea name="description" rows="4"></textarea></label><p id="sheet-status" role="status"></p><button type="submit">Guardar diseño</button><button type="button" onclick="closeContentSheet()">Cancelar</button></form>`);
    document.getElementById('new-design-form').onsubmit = async event => {
        event.preventDefault(); const form = event.currentTarget, button = form.querySelector('[type=submit]'); button.disabled = true;
        const file = form.elements.image.files[0], number = DESIGN_TOTAL + 1, code = designCode(number), uploaded = await uploadContentImage(file, code);
        if (!uploaded) { document.getElementById('sheet-status').textContent = 'No se pudo subir la imagen al almacenamiento.'; button.disabled = false; return; }
        designOverrides[code] = { title: form.elements.title.value.trim(), category: form.elements.category.value.trim() || 'Por definir', price: form.elements.price.value.trim() || 'Desde $30.000', minSize: form.elements.minSize.value.trim() || 'Consultar tamaño mínimo', description: form.elements.description.value.trim(), image: uploaded, available: true };
        DESIGN_TOTAL = number;
        if (await saveContentConfig()) { closeContentSheet(); renderDesignCatalog(); showToast(`${code} añadido al catálogo.`, 'success'); }
        button.disabled = false;
    };
}

function showNewGallerySheet() {
    if (!currentUser) return;
    openContentSheet(`<h2 id="sheet-title">Añadir imagen a la galería</h2><form id="new-gallery-form" class="sheet-form">
      <label>Imagen<input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" required></label><label>Texto de la imagen<input name="label" required placeholder="Fine line · nuevo trabajo"></label>
      <p id="sheet-status" role="status"></p><button type="submit">Guardar imagen</button><button type="button" onclick="closeContentSheet()">Cancelar</button></form>`);
    document.getElementById('new-gallery-form').onsubmit = async event => {
        event.preventDefault(); const form = event.currentTarget, button = form.querySelector('[type=submit]'); button.disabled = true;
        const file = form.elements.image.files[0], numbers = Object.keys(galleryOverrides).map(Number).filter(Number.isFinite), number = Math.max(0, ...numbers, 10) + 1, uploaded = await uploadContentImage(file, `gallery-${number}`);
        if (!uploaded) { document.getElementById('sheet-status').textContent = 'No se pudo subir la imagen al almacenamiento.'; button.disabled = false; return; }
        galleryOverrides[String(number)] = { label: form.elements.label.value.trim(), image: uploaded };
        if (await saveContentConfig()) { closeContentSheet(); renderGalleryContent(); showToast('Imagen añadida a la galería.', 'success'); }
        button.disabled = false;
    };
}

const editablePageNodes = new Map();
function refreshPageEditing() {
    ensurePublicContentActions();
    if (!editablePageNodes.size) {
        document.querySelectorAll('#landing-container h1, #landing-container h2, #landing-container h3, #landing-container p').forEach((node, index) => {
            if (node.closest('form, #design-grid, #galeria-track, #agendar, #pago-directo, #gestion-citas, #selected-designs') || node.id) return;
            const key = `text-${index}`;
            editablePageNodes.set(key, { node, original: node.innerHTML });
        });
    }
    for (const [key, {node, original}] of editablePageNodes) {
        const value = config.content?.texts?.[key];
        if (typeof value === 'string') node.textContent = value;
        else node.innerHTML = original;
        let button = node.nextElementSibling;
        if (!button?.classList.contains('page-edit-button')) button = null;
        if (currentUser && !button) {
            button = document.createElement('button');
            button.type = 'button'; button.className = 'page-edit-button'; button.textContent = 'Editar texto';
            button.onclick = () => editPageText(key);
            node.after(button);
        } else if (!currentUser) button?.remove();
    }
    if (!currentUser && contentSheet?.open && contentSheet.querySelector('form')) closeContentSheet();
}
function editPageText(key) {
    if (!currentUser) return;
    const {node} = editablePageNodes.get(key);
    openContentSheet(`<h2 id="sheet-title">Editar texto</h2><form id="page-text-form"><label>Texto<textarea name="text" rows="6" required>${escapeHTML(node.textContent)}</textarea></label><p role="status" id="sheet-status"></p><button type="submit">Guardar cambios</button><button type="button" onclick="closeContentSheet()">Cancelar</button></form>`);
    document.getElementById('page-text-form').onsubmit = async event => {
        event.preventDefault();
        if (!currentUser) return;
        const button = event.currentTarget.querySelector('[type=submit]'); button.disabled = true;
        const previous = config.content;
        config.content = { ...previous, texts: { ...previous?.texts, [key]: event.currentTarget.elements.text.value.trim() } };
        if (await saveState()) { refreshPageEditing(); closeContentSheet(); showToast('Texto publicado.', 'success'); }
        else { config.content = previous; document.getElementById('sheet-status').textContent = 'No se pudo publicar. Intenta nuevamente.'; }
        button.disabled = false;
    };
}

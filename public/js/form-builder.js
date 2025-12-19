// Form Builder JavaScript - Drag and Drop Form Creator
let formFields = [];
let selectedFieldId = null;
let fieldIdCounter = 0;

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    initializeBuilder();
});

function initializeBuilder() {
    setupDragAndDrop();
    setupFieldTypeClicks();
    loadExistingForm();
}

function setupDragAndDrop() {
    const fieldTypes = document.querySelectorAll('.field-type');
    const dropZone = document.getElementById('dropZone');
    const formFields = document.getElementById('formFields');

    // Make field types draggable
    fieldTypes.forEach(fieldType => {
        fieldType.addEventListener('dragstart', handleDragStart);
        fieldType.addEventListener('dragend', handleDragEnd);
    });

    // Setup drop zones
    [dropZone, formFields].forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
    });
}

function setupFieldTypeClicks() {
    const fieldTypes = document.querySelectorAll('.field-type');
    fieldTypes.forEach(fieldType => {
        fieldType.addEventListener('click', function() {
            const fieldType = this.dataset.type;
            addField(fieldType);
        });
    });
}

function handleDragStart(e) {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('fieldType', this.dataset.type);
    this.style.opacity = '0.5';
}

function handleDragEnd(e) {
    this.style.opacity = '1';
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    const fieldType = e.dataTransfer.getData('fieldType');
    if (fieldType) {
        addField(fieldType);
    }
}

function addField(type) {
    const fieldId = `field_${fieldIdCounter++}`;
    const field = {
        id: fieldId,
        type: type,
        label: getDefaultLabel(type),
        placeholder: getDefaultPlaceholder(type),
        required: false,
        options: type === 'select' || type === 'radio' || type === 'checkbox' ? ['Option 1', 'Option 2', 'Option 3'] : [],
        validation: {}
    };

    formFields.push(field);
    renderFields();
    selectField(fieldId);
}

function getDefaultLabel(type) {
    const labels = {
        text: 'Text Field',
        email: 'Email Address',
        tel: 'Phone Number',
        url: 'Website URL',
        number: 'Number',
        date: 'Date',
        textarea: 'Message',
        select: 'Select Option',
        radio: 'Choose One',
        checkbox: 'Select All That Apply',
        file: 'Upload File'
    };
    return labels[type] || 'Field';
}

function getDefaultPlaceholder(type) {
    const placeholders = {
        text: 'Enter text...',
        email: 'your@email.com',
        tel: '(555) 123-4567',
        url: 'https://example.com',
        number: 'Enter number...',
        date: 'Select date...',
        textarea: 'Enter your message...',
        file: 'Choose file...'
    };
    return placeholders[type] || '';
}

function renderFields() {
    const container = document.getElementById('formFields');
    container.innerHTML = '';

    formFields.forEach(field => {
        const fieldElement = createFieldElement(field);
        container.appendChild(fieldElement);
    });
}

function createFieldElement(field) {
    const div = document.createElement('div');
    div.className = 'form-field';
    div.dataset.fieldId = field.id;
    if (selectedFieldId === field.id) {
        div.classList.add('selected');
    }

    div.innerHTML = `
        <div class="field-header">
            <div class="field-label">
                ${getFieldIcon(field.type)} ${field.label}
                ${field.required ? '<span class="required-badge">Required</span>' : ''}
            </div>
            <div class="field-actions">
                <button class="field-action-btn" onclick="duplicateField('${field.id}')" title="Duplicate">
                    📋
                </button>
                <button class="field-action-btn" onclick="deleteField('${field.id}')" title="Delete">
                    🗑️
                </button>
            </div>
        </div>
        ${renderFieldPreview(field)}
    `;

    div.addEventListener('click', () => selectField(field.id));
    return div;
}

function getFieldIcon(type) {
    const icons = {
        text: '📝',
        email: '📧',
        tel: '📱',
        url: '🔗',
        number: '🔢',
        date: '📅',
        textarea: '📄',
        select: '📋',
        radio: '🔘',
        checkbox: '☑️',
        file: '📎'
    };
    return icons[type] || '📝';
}

function renderFieldPreview(field) {
    switch (field.type) {
        case 'textarea':
            return `<textarea class="hlpfl-input" placeholder="${field.placeholder}" disabled></textarea>`;
        case 'select':
            return `
                <select class="hlpfl-input" disabled>
                    <option>${field.placeholder || 'Select an option'}</option>
                    ${field.options.map(opt => `<option>${opt}</option>`).join('')}
                </select>
            `;
        case 'radio':
            return `
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${field.options.map((opt, i) => `
                        <label style="display: flex; align-items: center; gap: 0.5rem;">
                            <input type="radio" name="${field.id}" disabled>
                            <span>${opt}</span>
                        </label>
                    `).join('')}
                </div>
            `;
        case 'checkbox':
            return `
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${field.options.map((opt, i) => `
                        <label style="display: flex; align-items: center; gap: 0.5rem;">
                            <input type="checkbox" disabled>
                            <span>${opt}</span>
                        </label>
                    `).join('')}
                </div>
            `;
        default:
            return `<input type="${field.type}" class="hlpfl-input" placeholder="${field.placeholder}" disabled>`;
    }
}

function selectField(fieldId) {
    selectedFieldId = fieldId;
    
    // Update UI
    document.querySelectorAll('.form-field').forEach(el => {
        el.classList.remove('selected');
    });
    const selectedElement = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (selectedElement) {
        selectedElement.classList.add('selected');
    }

    // Show properties
    showFieldProperties(fieldId);
}

function showFieldProperties(fieldId) {
    const field = formFields.find(f => f.id === fieldId);
    if (!field) return;

    const propertiesContent = document.getElementById('propertiesContent');
    
    let optionsHtml = '';
    if (field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') {
        optionsHtml = `
            <div class="property-group">
                <label class="property-label">Options</label>
                <div class="options-list" id="optionsList">
                    ${field.options.map((opt, i) => `
                        <div class="option-item">
                            <input type="text" class="hlpfl-input" value="${opt}" 
                                   onchange="updateOption('${fieldId}', ${i}, this.value)">
                            <button class="remove-option-btn" onclick="removeOption('${fieldId}', ${i})">×</button>
                        </div>
                    `).join('')}
                </div>
                <button class="add-option-btn" onclick="addOption('${fieldId}')">+ Add Option</button>
            </div>
        `;
    }

    propertiesContent.innerHTML = `
        <div class="property-group">
            <label class="property-label">Field Label</label>
            <input type="text" class="hlpfl-input" value="${field.label}" 
                   onchange="updateFieldProperty('${fieldId}', 'label', this.value)">
        </div>

        ${field.type !== 'radio' && field.type !== 'checkbox' && field.type !== 'select' ? `
        <div class="property-group">
            <label class="property-label">Placeholder</label>
            <input type="text" class="hlpfl-input" value="${field.placeholder}" 
                   onchange="updateFieldProperty('${fieldId}', 'placeholder', this.value)">
        </div>
        ` : ''}

        <div class="property-group">
            <div class="checkbox-group">
                <input type="checkbox" id="requiredCheck" ${field.required ? 'checked' : ''}
                       onchange="updateFieldProperty('${fieldId}', 'required', this.checked)">
                <label for="requiredCheck">Required Field</label>
            </div>
        </div>

        ${optionsHtml}

        ${field.type === 'text' || field.type === 'textarea' ? `
        <div class="property-group">
            <label class="property-label">Validation</label>
            <div class="validation-rules">
                <div class="validation-rule">
                    <select class="hlpfl-input">
                        <option>Min Length</option>
                        <option>Max Length</option>
                        <option>Pattern</option>
                    </select>
                    <input type="text" class="hlpfl-input" placeholder="Value">
                </div>
            </div>
        </div>
        ` : ''}

        ${field.type === 'number' ? `
        <div class="property-group">
            <label class="property-label">Number Range</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                <input type="number" class="hlpfl-input" placeholder="Min" 
                       onchange="updateFieldProperty('${fieldId}', 'min', this.value)">
                <input type="number" class="hlpfl-input" placeholder="Max"
                       onchange="updateFieldProperty('${fieldId}', 'max', this.value)">
            </div>
        </div>
        ` : ''}

        ${field.type === 'file' ? `
        <div class="property-group">
            <label class="property-label">Accepted File Types</label>
            <input type="text" class="hlpfl-input" placeholder=".pdf, .doc, .jpg"
                   onchange="updateFieldProperty('${fieldId}', 'accept', this.value)">
        </div>
        <div class="property-group">
            <label class="property-label">Max File Size (MB)</label>
            <input type="number" class="hlpfl-input" placeholder="5"
                   onchange="updateFieldProperty('${fieldId}', 'maxSize', this.value)">
        </div>
        ` : ''}
    `;
}

function updateFieldProperty(fieldId, property, value) {
    const field = formFields.find(f => f.id === fieldId);
    if (field) {
        field[property] = value;
        renderFields();
        selectField(fieldId);
    }
}

function updateOption(fieldId, index, value) {
    const field = formFields.find(f => f.id === fieldId);
    if (field && field.options) {
        field.options[index] = value;
        renderFields();
        selectField(fieldId);
    }
}

function addOption(fieldId) {
    const field = formFields.find(f => f.id === fieldId);
    if (field && field.options) {
        field.options.push(`Option ${field.options.length + 1}`);
        showFieldProperties(fieldId);
        renderFields();
        selectField(fieldId);
    }
}

function removeOption(fieldId, index) {
    const field = formFields.find(f => f.id === fieldId);
    if (field && field.options && field.options.length > 1) {
        field.options.splice(index, 1);
        showFieldProperties(fieldId);
        renderFields();
        selectField(fieldId);
    }
}

function duplicateField(fieldId) {
    const field = formFields.find(f => f.id === fieldId);
    if (field) {
        const newField = {
            ...field,
            id: `field_${fieldIdCounter++}`,
            label: field.label + ' (Copy)'
        };
        formFields.push(newField);
        renderFields();
        selectField(newField.id);
    }
}

function deleteField(fieldId) {
    if (confirm('Delete this field?')) {
        formFields = formFields.filter(f => f.id !== fieldId);
        selectedFieldId = null;
        renderFields();
        document.getElementById('propertiesContent').innerHTML = `
            <p style="color: var(--hlpfl-text-muted); text-align: center; padding: 2rem 0;">
                Select a field to edit its properties
            </p>
        `;
    }
}

async function saveForm() {
    const token = localStorage.getItem('token');
    const formTitle = document.getElementById('formTitle').value;
    const formDescription = document.getElementById('formDescription').value;

    if (!formTitle) {
        alert('Please enter a form title');
        return;
    }

    if (formFields.length === 0) {
        alert('Please add at least one field to your form');
        return;
    }

    const formData = {
        name: formTitle,
        description: formDescription,
        fields: formFields
    };

    try {
        const response = await fetch('/api/forms', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            const result = await response.json();
            alert('Form saved successfully!');
            window.location.href = '/forms.html';
        } else {
            alert('Failed to save form');
        }
    } catch (error) {
        console.error('Error saving form:', error);
        alert('Error saving form');
    }
}

function previewForm() {
    const formTitle = document.getElementById('formTitle').value;
    const formDescription = document.getElementById('formDescription').value;

    // Generate preview HTML
    let previewHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${formTitle} - Preview</title>
            <link rel="stylesheet" href="/css/hlpfl-colors.css">
            <link rel="stylesheet" href="/css/layout.css">
            <style>
                body { padding: 2rem; }
                .form-container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: var(--hlpfl-dark-1);
                    border: 1px solid var(--hlpfl-dark-4);
                    border-radius: var(--hlpfl-radius-lg);
                    padding: 2rem;
                }
                .form-header {
                    margin-bottom: 2rem;
                }
                .form-title {
                    font-size: 2rem;
                    font-weight: 700;
                    margin-bottom: 0.5rem;
                }
                .form-description {
                    color: var(--hlpfl-text-secondary);
                }
            </style>
        </head>
        <body>
            <div class="form-container">
                <div class="form-header">
                    <h1 class="form-title">${formTitle}</h1>
                    <p class="form-description">${formDescription}</p>
                </div>
                <form>
    `;

    formFields.forEach(field => {
        previewHtml += `
            <div class="form-group">
                <label class="form-label">
                    ${field.label}
                    ${field.required ? '<span style="color: var(--hlpfl-red);">*</span>' : ''}
                </label>
        `;

        switch (field.type) {
            case 'textarea':
                previewHtml += `<textarea class="hlpfl-input" placeholder="${field.placeholder}" ${field.required ? 'required' : ''}></textarea>`;
                break;
            case 'select':
                previewHtml += `
                    <select class="hlpfl-input" ${field.required ? 'required' : ''}>
                        <option value="">${field.placeholder || 'Select an option'}</option>
                        ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
                    </select>
                `;
                break;
            case 'radio':
                previewHtml += `<div style="display: flex; flex-direction: column; gap: 0.5rem;">`;
                field.options.forEach((opt, i) => {
                    previewHtml += `
                        <label style="display: flex; align-items: center; gap: 0.5rem;">
                            <input type="radio" name="${field.id}" value="${opt}" ${field.required && i === 0 ? 'required' : ''}>
                            <span>${opt}</span>
                        </label>
                    `;
                });
                previewHtml += `</div>`;
                break;
            case 'checkbox':
                previewHtml += `<div style="display: flex; flex-direction: column; gap: 0.5rem;">`;
                field.options.forEach(opt => {
                    previewHtml += `
                        <label style="display: flex; align-items: center; gap: 0.5rem;">
                            <input type="checkbox" value="${opt}">
                            <span>${opt}</span>
                        </label>
                    `;
                });
                previewHtml += `</div>`;
                break;
            default:
                previewHtml += `<input type="${field.type}" class="hlpfl-input" placeholder="${field.placeholder}" ${field.required ? 'required' : ''}>`;
        }

        previewHtml += `</div>`;
    });

    previewHtml += `
                    <button type="submit" class="hlpfl-button" style="width: 100%; margin-top: 1rem;">
                        Submit
                    </button>
                </form>
            </div>
        </body>
        </html>
    `;

    // Open preview in new window
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(previewHtml);
    previewWindow.document.close();
}

function loadExistingForm() {
    // Check if editing existing form
    const urlParams = new URLSearchParams(window.location.search);
    const formId = urlParams.get('id');
    
    if (formId) {
        // Load form data from API
        // This would be implemented with actual API call
        console.log('Loading form:', formId);
    }
}
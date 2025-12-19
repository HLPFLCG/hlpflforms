// HLPFL Forms - Form Builder JavaScript

let fields = [
    {
        id: 1,
        type: 'text',
        label: 'Name',
        placeholder: 'Enter your name',
        required: true
    },
    {
        id: 2,
        type: 'email',
        label: 'Email',
        placeholder: 'your@email.com',
        required: true
    },
    {
        id: 3,
        type: 'textarea',
        label: 'Message',
        placeholder: 'Your message here...',
        required: true
    }
];

let fieldIdCounter = 4;

// Initialize form builder
document.addEventListener('DOMContentLoaded', function() {
    renderFields();
    updateEmbedCode();
});

// Render all fields
function renderFields() {
    const container = document.getElementById('fieldsContainer');
    container.innerHTML = fields.map(field => renderField(field)).join('');
}

// Render single field
function renderField(field) {
    const fieldTypes = {
        'text': 'Short Answer',
        'textarea': 'Long Answer',
        'email': 'Email',
        'tel': 'Phone',
        'url': 'URL',
        'number': 'Number',
        'date': 'Date',
        'select': 'Dropdown',
        'radio': 'Multiple Choice',
        'checkbox': 'Checkboxes'
    };
    
    return `
        <div class="field-item" data-field-id="${field.id}">
            <div class="field-header">
                <input type="text" 
                       class="field-label-input" 
                       value="${field.label}"
                       onchange="updateFieldLabel(${field.id}, this.value)"
                       placeholder="Question">
                <select class="field-type-select" onchange="updateFieldType(${field.id}, this.value)">
                    ${Object.entries(fieldTypes).map(([value, label]) => 
                        `<option value="${value}" ${field.type === value ? 'selected' : ''}>${label}</option>`
                    ).join('')}
                </select>
            </div>
            
            <div class="field-preview">
                ${renderFieldPreview(field)}
            </div>
            
            ${field.type === 'select' || field.type === 'radio' || field.type === 'checkbox' ? `
                <div class="field-options">
                    <p style="color: var(--text-secondary); margin-bottom: 0.5rem;">Options:</p>
                    ${(field.options || ['Option 1', 'Option 2']).map((opt, idx) => `
                        <div class="field-option-item">
                            <input type="text" 
                                   class="field-option-input" 
                                   value="${opt}"
                                   onchange="updateFieldOption(${field.id}, ${idx}, this.value)">
                            <button class="field-action-btn danger" onclick="removeFieldOption(${field.id}, ${idx})">✕</button>
                        </div>
                    `).join('')}
                    <button class="field-action-btn" onclick="addFieldOption(${field.id})">+ Add Option</button>
                </div>
            ` : ''}
            
            <div class="field-actions">
                <label class="checkbox-label">
                    <input type="checkbox" 
                           ${field.required ? 'checked' : ''}
                           onchange="toggleRequired(${field.id}, this.checked)">
                    Required
                </label>
                <button class="field-action-btn" onclick="duplicateField(${field.id})">📋 Duplicate</button>
                <button class="field-action-btn danger" onclick="deleteField(${field.id})">🗑️ Delete</button>
            </div>
        </div>
    `;
}

// Render field preview
function renderFieldPreview(field) {
    switch(field.type) {
        case 'textarea':
            return `<textarea placeholder="${field.placeholder || 'Your answer'}" rows="4"></textarea>`;
        case 'select':
            return `
                <select>
                    <option>Choose an option</option>
                    ${(field.options || ['Option 1', 'Option 2']).map(opt => 
                        `<option>${opt}</option>`
                    ).join('')}
                </select>
            `;
        case 'radio':
            return (field.options || ['Option 1', 'Option 2']).map((opt, idx) => `
                <label class="checkbox-label">
                    <input type="radio" name="field_${field.id}">
                    ${opt}
                </label>
            `).join('');
        case 'checkbox':
            return (field.options || ['Option 1', 'Option 2']).map((opt, idx) => `
                <label class="checkbox-label">
                    <input type="checkbox">
                    ${opt}
                </label>
            `).join('');
        default:
            return `<input type="${field.type}" placeholder="${field.placeholder || 'Your answer'}">`;
    }
}

// Add new field
function addField() {
    const newField = {
        id: fieldIdCounter++,
        type: 'text',
        label: 'Question',
        placeholder: 'Your answer',
        required: false
    };
    fields.push(newField);
    renderFields();
    updateEmbedCode();
}

// Update field label
function updateFieldLabel(fieldId, label) {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
        field.label = label;
        updateEmbedCode();
    }
}

// Update field type
function updateFieldType(fieldId, type) {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
        field.type = type;
        if (type === 'select' || type === 'radio' || type === 'checkbox') {
            field.options = field.options || ['Option 1', 'Option 2'];
        }
        renderFields();
        updateEmbedCode();
    }
}

// Toggle required
function toggleRequired(fieldId, required) {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
        field.required = required;
        updateEmbedCode();
    }
}

// Add field option
function addFieldOption(fieldId) {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
        field.options = field.options || [];
        field.options.push(`Option ${field.options.length + 1}`);
        renderFields();
        updateEmbedCode();
    }
}

// Update field option
function updateFieldOption(fieldId, optionIndex, value) {
    const field = fields.find(f => f.id === fieldId);
    if (field && field.options) {
        field.options[optionIndex] = value;
        updateEmbedCode();
    }
}

// Remove field option
function removeFieldOption(fieldId, optionIndex) {
    const field = fields.find(f => f.id === fieldId);
    if (field && field.options) {
        field.options.splice(optionIndex, 1);
        renderFields();
        updateEmbedCode();
    }
}

// Duplicate field
function duplicateField(fieldId) {
    const field = fields.find(f => f.id === fieldId);
    if (field) {
        const newField = { ...field, id: fieldIdCounter++ };
        fields.push(newField);
        renderFields();
        updateEmbedCode();
    }
}

// Delete field
function deleteField(fieldId) {
    if (confirm('Are you sure you want to delete this field?')) {
        fields = fields.filter(f => f.id !== fieldId);
        renderFields();
        updateEmbedCode();
    }
}

// Update embed code
function updateEmbedCode() {
    const formTitle = document.getElementById('formTitle').value || 'Untitled Form';
    const formId = 'form_' + Date.now(); // In production, this would be the actual form ID
    
    const embedCode = `<form action="https://hlpflforms.pages.dev/api/submit/${formId}" method="POST" style="max-width: 600px; margin: 0 auto; padding: 2rem; background: #1a1a1a; border-radius: 12px; border: 1px solid #333;">
    <h2 style="color: #D4915D; margin-bottom: 1.5rem;">${formTitle}</h2>
    ${fields.map(field => generateFieldHTML(field)).join('\n    ')}
    <button type="submit" style="width: 100%; padding: 1rem; background: #D4915D; color: #0a0a0a; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; margin-top: 1rem;">Submit</button>
</form>`;
    
    document.getElementById('embedCode').textContent = embedCode;
}

// Generate field HTML
function generateFieldHTML(field) {
    const labelHTML = `<label style="display: block; margin-bottom: 0.5rem; color: #fff; font-weight: 600;">${field.label}${field.required ? ' *' : ''}</label>`;
    const inputStyle = `style="width: 100%; padding: 0.75rem; background: #2a2a2a; border: 1px solid #333; border-radius: 6px; color: #fff; margin-bottom: 1rem;"`;
    
    switch(field.type) {
        case 'textarea':
            return `${labelHTML}\n    <textarea name="${field.label.toLowerCase().replace(/\s+/g, '_')}" ${inputStyle} rows="4" ${field.required ? 'required' : ''}></textarea>`;
        case 'select':
            return `${labelHTML}\n    <select name="${field.label.toLowerCase().replace(/\s+/g, '_')}" ${inputStyle} ${field.required ? 'required' : ''}>
        <option value="">Choose an option</option>
        ${(field.options || []).map(opt => `<option value="${opt}">${opt}</option>`).join('\n        ')}
    </select>`;
        default:
            return `${labelHTML}\n    <input type="${field.type}" name="${field.label.toLowerCase().replace(/\s+/g, '_')}" ${inputStyle} ${field.required ? 'required' : ''}>`;
    }
}

// Copy embed code
function copyEmbedCode() {
    const embedCode = document.getElementById('embedCode').textContent;
    navigator.clipboard.writeText(embedCode).then(() => {
        showMessage('✅ Embed code copied to clipboard!', 'success');
    }).catch(() => {
        showMessage('❌ Failed to copy. Please copy manually.', 'error');
    });
}

// Preview form
function previewForm() {
    const formTitle = document.getElementById('formTitle').value || 'Untitled Form';
    const formDescription = document.getElementById('formDescription').value;
    
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${formTitle} - Preview</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #fff; padding: 2rem; }
                .form-container { max-width: 600px; margin: 0 auto; background: #1a1a1a; padding: 2rem; border-radius: 12px; border: 1px solid #333; }
                h1 { color: #D4915D; margin-bottom: 0.5rem; }
                p { color: #b0b0b0; margin-bottom: 2rem; }
                label { display: block; margin-bottom: 0.5rem; font-weight: 600; }
                input, textarea, select { width: 100%; padding: 0.75rem; background: #2a2a2a; border: 1px solid #333; border-radius: 6px; color: #fff; margin-bottom: 1rem; }
                button { width: 100%; padding: 1rem; background: #D4915D; color: #0a0a0a; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; }
                button:hover { background: #E5A26E; }
            </style>
        </head>
        <body>
            <div class="form-container">
                <h1>${formTitle}</h1>
                ${formDescription ? `<p>${formDescription}</p>` : ''}
                <form>
                    ${fields.map(field => `
                        <div>
                            <label>${field.label}${field.required ? ' *' : ''}</label>
                            ${field.type === 'textarea' ? 
                                `<textarea ${field.required ? 'required' : ''}></textarea>` :
                                `<input type="${field.type}" ${field.required ? 'required' : ''}>`
                            }
                        </div>
                    `).join('')}
                    <button type="submit">Submit</button>
                </form>
            </div>
        </body>
        </html>
    `);
}

// Save form
async function saveForm() {
    const token = localStorage.getItem('hlpfl_token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
    
    const formTitle = document.getElementById('formTitle').value || 'Untitled Form';
    const formDescription = document.getElementById('formDescription').value;
    
    try {
        const response = await fetch('/api/forms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: formTitle,
                description: formDescription,
                fields: fields
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showMessage('✅ Form saved successfully!', 'success');
            setTimeout(() => window.location.href = '/dashboard.html', 2000);
        } else {
            showMessage('❌ ' + (result.error || 'Failed to save form'), 'error');
        }
    } catch (error) {
        showMessage('❌ Network error. Please try again.', 'error');
    }
}

// Show message
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = `<div class="message ${type}">${text}</div>`;
    setTimeout(() => messageDiv.innerHTML = '', 5000);
}

// Update embed code when title or description changes
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('formTitle').addEventListener('input', updateEmbedCode);
    document.getElementById('formDescription').addEventListener('input', updateEmbedCode);
});
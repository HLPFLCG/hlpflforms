/**
 * HLPFL Forms - Embeddable Form Script
 * 
 * Usage:
 * <script src="https://hlpflforms.pages.dev/embed.js" data-form-id="YOUR_FORM_ID"></script>
 * <div id="hlpfl-form-container"></div>
 */

(function() {
    'use strict';

    // Get the script tag that loaded this file
    const scriptTag = document.currentScript || document.querySelector('script[data-form-id]');
    const formId = scriptTag ? scriptTag.getAttribute('data-form-id') : null;
    const containerId = scriptTag ? scriptTag.getAttribute('data-container') || 'hlpfl-form-container' : 'hlpfl-form-container';
    const theme = scriptTag ? scriptTag.getAttribute('data-theme') || 'dark' : 'dark';

    if (!formId) {
        console.error('HLPFL Forms: No form ID provided. Add data-form-id attribute to the script tag.');
        return;
    }

    // Create isolated styles
    const styles = `
        .hlpfl-embed-container {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
            max-width: 100%;
            margin: 0 auto;
        }

        .hlpfl-embed-container * {
            box-sizing: border-box;
        }

        .hlpfl-form {
            background: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'};
            border: 1px solid ${theme === 'dark' ? '#2a2a2a' : '#e0e0e0'};
            border-radius: 12px;
            padding: 2rem;
            color: ${theme === 'dark' ? '#ffffff' : '#000000'};
        }

        .hlpfl-form-header {
            margin-bottom: 2rem;
        }

        .hlpfl-form-title {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            color: ${theme === 'dark' ? '#ffffff' : '#000000'};
        }

        .hlpfl-form-description {
            color: ${theme === 'dark' ? '#b0b0b0' : '#666666'};
            line-height: 1.6;
        }

        .hlpfl-form-group {
            margin-bottom: 1.5rem;
        }

        .hlpfl-form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: ${theme === 'dark' ? '#ffffff' : '#000000'};
        }

        .hlpfl-form-required {
            color: #FF6B6B;
            margin-left: 0.25rem;
        }

        .hlpfl-form-input,
        .hlpfl-form-textarea,
        .hlpfl-form-select {
            width: 100%;
            padding: 0.75rem;
            background: ${theme === 'dark' ? '#16213E' : '#f5f5f5'};
            border: 1px solid ${theme === 'dark' ? '#2a2a2a' : '#d0d0d0'};
            border-radius: 8px;
            color: ${theme === 'dark' ? '#ffffff' : '#000000'};
            font-size: 1rem;
            transition: all 0.15s ease;
        }

        .hlpfl-form-input:focus,
        .hlpfl-form-textarea:focus,
        .hlpfl-form-select:focus {
            outline: none;
            border-color: #c87941;
            box-shadow: 0 0 0 3px rgba(200, 121, 65, 0.1);
        }

        .hlpfl-form-textarea {
            min-height: 120px;
            resize: vertical;
        }

        .hlpfl-form-radio-group,
        .hlpfl-form-checkbox-group {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .hlpfl-form-radio-label,
        .hlpfl-form-checkbox-label {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
        }

        .hlpfl-form-radio-label input,
        .hlpfl-form-checkbox-label input {
            width: 18px;
            height: 18px;
            cursor: pointer;
        }

        .hlpfl-form-submit {
            width: 100%;
            padding: 0.75rem 1.5rem;
            background: linear-gradient(135deg, #c87941 0%, #d4945c 100%);
            color: #ffffff;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 1rem;
        }

        .hlpfl-form-submit:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.5), 0 0 20px rgba(200, 121, 65, 0.3);
        }

        .hlpfl-form-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }

        .hlpfl-form-success {
            background: rgba(78, 205, 196, 0.1);
            border: 1px solid #4ECDC4;
            color: #4ECDC4;
            padding: 1rem;
            border-radius: 8px;
            text-align: center;
            margin-top: 1rem;
        }

        .hlpfl-form-error {
            background: rgba(255, 107, 107, 0.1);
            border: 1px solid #FF6B6B;
            color: #FF6B6B;
            padding: 1rem;
            border-radius: 8px;
            text-align: center;
            margin-top: 1rem;
        }

        .hlpfl-form-loading {
            text-align: center;
            padding: 2rem;
            color: ${theme === 'dark' ? '#b0b0b0' : '#666666'};
        }

        .hlpfl-powered-by {
            text-align: center;
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid ${theme === 'dark' ? '#2a2a2a' : '#e0e0e0'};
            font-size: 0.875rem;
            color: ${theme === 'dark' ? '#808080' : '#999999'};
        }

        .hlpfl-powered-by a {
            color: #c87941;
            text-decoration: none;
            font-weight: 600;
        }

        .hlpfl-powered-by a:hover {
            text-decoration: underline;
        }
    `;

    // Inject styles
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);

    // Load form data and render
    async function loadAndRenderForm() {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`HLPFL Forms: Container with id "${containerId}" not found.`);
            return;
        }

        container.innerHTML = '<div class="hlpfl-embed-container"><div class="hlpfl-form-loading">Loading form...</div></div>';

        try {
            // Fetch form data
            const response = await fetch(`https://hlpflforms.pages.dev/api/forms/${formId}`);
            
            if (!response.ok) {
                throw new Error('Form not found');
            }

            const formData = await response.json();
            renderForm(container, formData);
        } catch (error) {
            container.innerHTML = `
                <div class="hlpfl-embed-container">
                    <div class="hlpfl-form-error">
                        Failed to load form. Please try again later.
                    </div>
                </div>
            `;
            console.error('HLPFL Forms Error:', error);
        }
    }

    function renderForm(container, formData) {
        const formHtml = `
            <div class="hlpfl-embed-container">
                <form class="hlpfl-form" id="hlpfl-form-${formId}">
                    <div class="hlpfl-form-header">
                        <h2 class="hlpfl-form-title">${escapeHtml(formData.name)}</h2>
                        ${formData.description ? `<p class="hlpfl-form-description">${escapeHtml(formData.description)}</p>` : ''}
                    </div>
                    
                    ${renderFields(formData.fields)}
                    
                    <button type="submit" class="hlpfl-form-submit">Submit</button>
                    
                    <div class="hlpfl-powered-by">
                        Powered by <a href="https://hlpflforms.pages.dev" target="_blank">HLPFL Forms</a>
                    </div>
                </form>
            </div>
        `;

        container.innerHTML = formHtml;

        // Setup form submission
        const form = document.getElementById(`hlpfl-form-${formId}`);
        form.addEventListener('submit', handleSubmit);
    }

    function renderFields(fields) {
        if (!fields || !Array.isArray(fields)) {
            return '<p>No fields defined for this form.</p>';
        }

        return fields.map(field => {
            const fieldId = `field-${field.id}`;
            const required = field.required ? 'required' : '';
            const requiredMark = field.required ? '<span class="hlpfl-form-required">*</span>' : '';

            switch (field.type) {
                case 'textarea':
                    return `
                        <div class="hlpfl-form-group">
                            <label class="hlpfl-form-label" for="${fieldId}">
                                ${escapeHtml(field.label)}${requiredMark}
                            </label>
                            <textarea 
                                id="${fieldId}" 
                                name="${field.id}" 
                                class="hlpfl-form-textarea" 
                                placeholder="${escapeHtml(field.placeholder)}"
                                ${required}
                            ></textarea>
                        </div>
                    `;

                case 'select':
                    return `
                        <div class="hlpfl-form-group">
                            <label class="hlpfl-form-label" for="${fieldId}">
                                ${escapeHtml(field.label)}${requiredMark}
                            </label>
                            <select 
                                id="${fieldId}" 
                                name="${field.id}" 
                                class="hlpfl-form-select"
                                ${required}
                            >
                                <option value="">${escapeHtml(field.placeholder || 'Select an option')}</option>
                                ${field.options.map(opt => `<option value="${escapeHtml(opt)}">${escapeHtml(opt)}</option>`).join('')}
                            </select>
                        </div>
                    `;

                case 'radio':
                    return `
                        <div class="hlpfl-form-group">
                            <label class="hlpfl-form-label">
                                ${escapeHtml(field.label)}${requiredMark}
                            </label>
                            <div class="hlpfl-form-radio-group">
                                ${field.options.map((opt, i) => `
                                    <label class="hlpfl-form-radio-label">
                                        <input 
                                            type="radio" 
                                            name="${field.id}" 
                                            value="${escapeHtml(opt)}"
                                            ${required && i === 0 ? 'required' : ''}
                                        >
                                        <span>${escapeHtml(opt)}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    `;

                case 'checkbox':
                    return `
                        <div class="hlpfl-form-group">
                            <label class="hlpfl-form-label">
                                ${escapeHtml(field.label)}${requiredMark}
                            </label>
                            <div class="hlpfl-form-checkbox-group">
                                ${field.options.map(opt => `
                                    <label class="hlpfl-form-checkbox-label">
                                        <input 
                                            type="checkbox" 
                                            name="${field.id}[]" 
                                            value="${escapeHtml(opt)}"
                                        >
                                        <span>${escapeHtml(opt)}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    `;

                default:
                    return `
                        <div class="hlpfl-form-group">
                            <label class="hlpfl-form-label" for="${fieldId}">
                                ${escapeHtml(field.label)}${requiredMark}
                            </label>
                            <input 
                                type="${field.type}" 
                                id="${fieldId}" 
                                name="${field.id}" 
                                class="hlpfl-form-input" 
                                placeholder="${escapeHtml(field.placeholder)}"
                                ${required}
                            >
                        </div>
                    `;
            }
        }).join('');
    }

    async function handleSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitButton = form.querySelector('.hlpfl-form-submit');
        const formData = new FormData(form);
        
        // Disable submit button
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        // Convert FormData to JSON
        const data = {};
        for (let [key, value] of formData.entries()) {
            if (key.endsWith('[]')) {
                const cleanKey = key.slice(0, -2);
                if (!data[cleanKey]) {
                    data[cleanKey] = [];
                }
                data[cleanKey].push(value);
            } else {
                data[key] = value;
            }
        }

        try {
            const response = await fetch(`https://hlpflforms.pages.dev/api/submit/${formId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                // Show success message
                form.innerHTML = `
                    <div class="hlpfl-form-success">
                        ✓ Thank you! Your submission has been received.
                    </div>
                    <div class="hlpfl-powered-by">
                        Powered by <a href="https://hlpflforms.pages.dev" target="_blank">HLPFL Forms</a>
                    </div>
                `;
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            // Show error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'hlpfl-form-error';
            errorDiv.textContent = 'Failed to submit form. Please try again.';
            form.appendChild(errorDiv);

            // Re-enable submit button
            submitButton.disabled = false;
            submitButton.textContent = 'Submit';

            console.error('HLPFL Forms Submission Error:', error);
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadAndRenderForm);
    } else {
        loadAndRenderForm();
    }
})();
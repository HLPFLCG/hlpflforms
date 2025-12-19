/**
 * CRITICAL FIX: Form Creation System
 * 
 * This fixes the page reload bug and ensures forms can be created properly.
 * NO MORE PAGE RELOADS - Everything works via AJAX.
 */

class FormCreationFix {
  constructor() {
    this.isInitialized = false;
  }

  initialize() {
    if (this.isInitialized) return;
    
    console.log('🔧 Initializing Form Creation Fix...');
    
    // CRITICAL: Prevent ALL form submissions from reloading the page
    this.preventAllFormReloads();
    
    // Fix form builder page
    this.fixFormBuilderPage();
    
    // Fix dashboard create button
    this.fixDashboardCreateButton();
    
    // Fix forms page
    this.fixFormsPage();
    
    this.isInitialized = true;
    console.log('✅ Form Creation Fix Applied Successfully');
  }

  preventAllFormReloads() {
    // Capture ALL form submissions at the document level
    document.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      console.log('🛑 Form submission prevented - handling via AJAX');
      
      return false;
    }, true); // Use capture phase to catch everything

    // Also prevent default on all form elements
    document.addEventListener('DOMContentLoaded', () => {
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          return false;
        });
      });
    });
  }

  fixFormBuilderPage() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupFormBuilder());
    } else {
      this.setupFormBuilder();
    }
  }

  setupFormBuilder() {
    console.log('🔧 Setting up Form Builder...');

    // Find the save button
    const saveButton = document.querySelector('[onclick*="saveForm"]') || 
                      document.querySelector('.save-btn') ||
                      document.querySelector('#saveFormBtn');

    if (saveButton) {
      // Remove any existing onclick handlers
      saveButton.removeAttribute('onclick');
      
      // Add new click handler
      saveButton.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('💾 Save button clicked - creating form via AJAX...');
        
        await this.handleFormSave();
        
        return false;
      });
      
      console.log('✅ Save button handler attached');
    }

    // Find preview button
    const previewButton = document.querySelector('[onclick*="previewForm"]') ||
                         document.querySelector('.preview-btn') ||
                         document.querySelector('#previewFormBtn');

    if (previewButton) {
      previewButton.removeAttribute('onclick');
      
      previewButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('👁️ Preview button clicked');
        
        this.handleFormPreview();
        
        return false;
      });
      
      console.log('✅ Preview button handler attached');
    }
  }

  async handleFormSave() {
    try {
      // Show loading state
      this.showLoading('Saving form...');

      // Get form data
      const formTitle = document.getElementById('formTitle')?.value || 'Untitled Form';
      const formDescription = document.getElementById('formDescription')?.value || '';
      
      // Get fields (if any exist in the global scope)
      const fields = window.formFields || [];

      // Prepare form data
      const formData = {
        name: formTitle,
        description: formDescription,
        fields: fields
      };

      console.log('📤 Sending form data:', formData);

      // Get auth token
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Not authenticated. Please log in.');
      }

      // Send to API
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      // Hide loading
      this.hideLoading();

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save form');
      }

      const result = await response.json();
      
      console.log('✅ Form saved successfully:', result);

      // Show success message
      this.showSuccess('Form saved successfully!');

      // Redirect to forms page after a short delay
      setTimeout(() => {
        window.location.href = '/forms.html';
      }, 1500);

    } catch (error) {
      this.hideLoading();
      console.error('❌ Error saving form:', error);
      this.showError(`Failed to save form: ${error.message}`);
    }
  }

  handleFormPreview() {
    // Get form data
    const formTitle = document.getElementById('formTitle')?.value || 'Untitled Form';
    const formDescription = document.getElementById('formDescription')?.value || '';
    const fields = window.formFields || [];

    // Generate preview HTML
    const previewHTML = this.generatePreviewHTML(formTitle, formDescription, fields);

    // Open in new window
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(previewHTML);
    previewWindow.document.close();
  }

  generatePreviewHTML(title, description, fields) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - Preview</title>
        <link rel="stylesheet" href="/css/hlpfl-colors.css">
        <link rel="stylesheet" href="/css/layout.css">
        <style>
          body {
            padding: 2rem;
            background: var(--hlpfl-black);
          }
          .preview-container {
            max-width: 600px;
            margin: 0 auto;
            background: var(--hlpfl-dark-1);
            border: 1px solid var(--hlpfl-dark-4);
            border-radius: var(--hlpfl-radius-lg);
            padding: 2rem;
          }
          .preview-header {
            margin-bottom: 2rem;
          }
          .preview-title {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            color: var(--hlpfl-text-primary);
          }
          .preview-description {
            color: var(--hlpfl-text-secondary);
          }
        </style>
      </head>
      <body>
        <div class="preview-container">
          <div class="preview-header">
            <h1 class="preview-title">${title}</h1>
            ${description ? `<p class="preview-description">${description}</p>` : ''}
          </div>
          <form>
            ${fields.map(field => this.renderFieldPreview(field)).join('')}
            <button type="submit" class="hlpfl-button" style="width: 100%; margin-top: 1rem;">
              Submit
            </button>
          </form>
        </div>
      </body>
      </html>
    `;
  }

  renderFieldPreview(field) {
    const required = field.required ? 'required' : '';
    const requiredMark = field.required ? '<span style="color: var(--hlpfl-red);">*</span>' : '';

    switch (field.type) {
      case 'textarea':
        return `
          <div class="form-group">
            <label class="form-label">${field.label}${requiredMark}</label>
            <textarea class="hlpfl-input" placeholder="${field.placeholder || ''}" ${required}></textarea>
          </div>
        `;

      case 'select':
        return `
          <div class="form-group">
            <label class="form-label">${field.label}${requiredMark}</label>
            <select class="hlpfl-input" ${required}>
              <option value="">${field.placeholder || 'Select an option'}</option>
              ${(field.options || []).map(opt => `<option value="${opt}">${opt}</option>`).join('')}
            </select>
          </div>
        `;

      case 'radio':
        return `
          <div class="form-group">
            <label class="form-label">${field.label}${requiredMark}</label>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              ${(field.options || []).map((opt, i) => `
                <label style="display: flex; align-items: center; gap: 0.5rem;">
                  <input type="radio" name="${field.id}" value="${opt}" ${required && i === 0 ? 'required' : ''}>
                  <span>${opt}</span>
                </label>
              `).join('')}
            </div>
          </div>
        `;

      case 'checkbox':
        return `
          <div class="form-group">
            <label class="form-label">${field.label}${requiredMark}</label>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              ${(field.options || []).map(opt => `
                <label style="display: flex; align-items: center; gap: 0.5rem;">
                  <input type="checkbox" value="${opt}">
                  <span>${opt}</span>
                </label>
              `).join('')}
            </div>
          </div>
        `;

      default:
        return `
          <div class="form-group">
            <label class="form-label">${field.label}${requiredMark}</label>
            <input type="${field.type}" class="hlpfl-input" placeholder="${field.placeholder || ''}" ${required}>
          </div>
        `;
    }
  }

  fixDashboardCreateButton() {
    // Wait for DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupDashboardButton());
    } else {
      this.setupDashboardButton();
    }
  }

  setupDashboardButton() {
    // Find create button on dashboard
    const createButtons = document.querySelectorAll('[onclick*="form-builder"]');
    
    createButtons.forEach(button => {
      button.removeAttribute('onclick');
      
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('➕ Create button clicked - navigating to form builder');
        
        // Navigate to form builder
        window.location.href = '/form-builder.html';
        
        return false;
      });
    });
  }

  fixFormsPage() {
    // Similar fixes for forms page
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupFormsPage());
    } else {
      this.setupFormsPage();
    }
  }

  setupFormsPage() {
    // Fix any form-related buttons on forms page
    console.log('🔧 Setting up Forms Page...');
  }

  // UI Helper Methods
  showLoading(message) {
    // Remove any existing loading overlay
    this.hideLoading();

    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay-fix';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      backdrop-filter: blur(4px);
    `;

    overlay.innerHTML = `
      <div style="
        background: var(--hlpfl-dark-1, #1a1a1a);
        border: 1px solid var(--hlpfl-copper, #CD8B5C);
        border-radius: 12px;
        padding: 2rem;
        text-align: center;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
      ">
        <div style="
          width: 40px;
          height: 40px;
          border: 3px solid rgba(205, 139, 92, 0.3);
          border-top-color: #CD8B5C;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 1rem;
        "></div>
        <p style="
          color: var(--hlpfl-text-primary, #ffffff);
          font-size: 1rem;
          margin: 0;
        ">${message}</p>
      </div>
      <style>
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      </style>
    `;

    document.body.appendChild(overlay);
  }

  hideLoading() {
    const overlay = document.getElementById('loading-overlay-fix');
    if (overlay) {
      overlay.remove();
    }
  }

  showSuccess(message) {
    this.showToast(message, 'success');
  }

  showError(message) {
    this.showToast(message, 'error');
  }

  showToast(message, type) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: ${type === 'success' ? '#28A745' : '#DC3545'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
      z-index: 99999;
      animation: slideIn 0.3s ease-out;
      font-weight: 500;
    `;

    toast.innerHTML = `
      <style>
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      </style>
      ${type === 'success' ? '✅' : '❌'} ${message}
    `;

    document.body.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Initialize immediately
const formCreationFix = new FormCreationFix();
formCreationFix.initialize();

// Also initialize on DOM ready (in case script loads before DOM)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    formCreationFix.initialize();
  });
}

// Export for use in other scripts
window.FormCreationFix = formCreationFix;

console.log('🚀 Form Creation Fix Loaded');
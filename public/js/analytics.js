// Analytics Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    // Initialize analytics
    loadAnalytics();
    setupEventListeners();
});

function setupEventListeners() {
    // Form selector
    const formSelect = document.getElementById('formSelect');
    if (formSelect) {
        formSelect.addEventListener('change', loadAnalytics);
    }

    // Date range selector
    const dateRange = document.getElementById('dateRange');
    if (dateRange) {
        dateRange.addEventListener('change', loadAnalytics);
    }

    // Compare range selector
    const compareRange = document.getElementById('compareRange');
    if (compareRange) {
        compareRange.addEventListener('change', loadAnalytics);
    }

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            loadAnalytics();
        });
    });
}

async function loadAnalytics() {
    const token = localStorage.getItem('token');
    const formId = document.getElementById('formSelect')?.value || 'all';
    const dateRange = document.getElementById('dateRange')?.value || '7d';

    try {
        // Load forms for selector
        await loadFormsList();

        // Load key metrics
        await loadKeyMetrics(formId, dateRange);

        // Load form comparison
        await loadFormComparison();

        // Simulate chart data loading
        console.log('Analytics loaded for form:', formId, 'range:', dateRange);
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

async function loadFormsList() {
    const token = localStorage.getItem('token');
    const formSelect = document.getElementById('formSelect');
    
    if (!formSelect) return;

    try {
        const response = await fetch('/api/forms', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const forms = await response.json();
            
            // Clear existing options except "All Forms"
            formSelect.innerHTML = '<option value="all">All Forms</option>';
            
            // Add form options
            forms.forEach(form => {
                const option = document.createElement('option');
                option.value = form.id;
                option.textContent = form.name;
                formSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading forms list:', error);
    }
}

async function loadKeyMetrics(formId, dateRange) {
    // Simulate loading metrics
    // In production, this would fetch from API
    const metrics = {
        totalViews: Math.floor(Math.random() * 10000),
        totalSubmissions: Math.floor(Math.random() * 1000),
        conversionRate: (Math.random() * 30 + 10).toFixed(1),
        avgTime: Math.floor(Math.random() * 120 + 30)
    };

    // Update UI
    document.getElementById('totalViews').textContent = metrics.totalViews.toLocaleString();
    document.getElementById('totalSubmissions').textContent = metrics.totalSubmissions.toLocaleString();
    document.getElementById('conversionRate').textContent = metrics.conversionRate + '%';
    document.getElementById('avgTime').textContent = metrics.avgTime + 's';
}

async function loadFormComparison() {
    const token = localStorage.getItem('token');
    const tbody = document.getElementById('comparisonTableBody');
    
    if (!tbody) return;

    try {
        const response = await fetch('/api/forms', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const forms = await response.json();
            
            if (forms.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; color: var(--hlpfl-text-muted);">
                            No forms available for comparison
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = forms.map(form => {
                const views = Math.floor(Math.random() * 1000);
                const submissions = Math.floor(Math.random() * 100);
                const conversion = ((submissions / views) * 100).toFixed(1);
                const avgTime = Math.floor(Math.random() * 120 + 30);
                const trend = Math.random() > 0.5 ? 'up' : 'down';
                const trendValue = (Math.random() * 20).toFixed(1);

                return `
                    <tr>
                        <td><strong>${form.name}</strong></td>
                        <td>${views.toLocaleString()}</td>
                        <td>${submissions.toLocaleString()}</td>
                        <td>${conversion}%</td>
                        <td>${avgTime}s</td>
                        <td>
                            <span class="trend-indicator trend-${trend}">
                                ${trend === 'up' ? '↑' : '↓'} ${trendValue}%
                            </span>
                        </td>
                    </tr>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error loading form comparison:', error);
    }
}

function exportAnalytics() {
    const formId = document.getElementById('formSelect')?.value || 'all';
    const dateRange = document.getElementById('dateRange')?.value || '7d';
    
    alert(`Exporting analytics report for form: ${formId}, range: ${dateRange}`);
    // In production, this would generate and download a report
}

function exportChart(chartType) {
    alert(`Exporting ${chartType} chart data`);
    // In production, this would export the specific chart data
}
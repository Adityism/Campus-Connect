document.addEventListener('DOMContentLoaded', async () => {
    if (!window.facultyAuth.isAuthenticated()) {
        window.location.href = '/faculty_portal/login';
        return;
    }
    
    try {
        await loadDashboardData();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        alert('Failed to load dashboard data. Please try again later.');
    }
});

// ...rest of the dashboard.js code...

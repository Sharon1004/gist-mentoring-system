// GIST Mentoring System - Main Application JavaScript

// ===== AUTHENTICATION SYSTEM =====
const Auth = {
    apiBase: '',

    getToken: function() {
        return sessionStorage.getItem('token');
    },

    setSession: function({ token, user }) {
        if (token) sessionStorage.setItem('token', token);
        if (user) sessionStorage.setItem('user', JSON.stringify(user));
    },

    clearSession: function() {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
    },

    // Check if user is logged in
    isLoggedIn: function() {
        return sessionStorage.getItem('token') !== null || sessionStorage.getItem('user') !== null;
    },

    // Get current user
    getCurrentUser: function() {
        const userStr = sessionStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Login function
    login: async function(credentials, userType) {
        const res = await fetch(`${this.apiBase}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: credentials.username,
                password: credentials.password,
                userType
            })
        }).catch(() => null);

        if (!res || !res.ok) return false;
        const data = await res.json();
        this.setSession({ token: data.token, user: data.user });
        return true;
    },

    refreshMe: async function() {
        const token = this.getToken();
        if (!token) return this.getCurrentUser();

        const res = await fetch(`${this.apiBase}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return this.getCurrentUser();

        const data = await res.json();
        this.setSession({ token, user: data.user });
        return data.user;
    },

    getStudentProgress: async function() {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');
        const res = await fetch(`${this.apiBase}/api/students/me/progress`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Failed to load progress');
        return data;
    },

    getCourseRecommendations: async function(limit = 10) {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');
        const res = await fetch(`${this.apiBase}/api/students/me/course-recommendations?limit=${limit}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Failed to load recommendations');
        return data.recommendations || [];
    },

    getAICareerRecommendations: async function() {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');
        const res = await fetch(`${this.apiBase}/api/students/me/ai-career-recommendations`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Failed to load AI recommendations');
        return data.recommendation;
    },

    updateStudentProfile: async function({ careerGoal, interests, aspirations, swot }) {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');
        const res = await fetch(`${this.apiBase}/api/students/me/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ careerGoal, interests, aspirations, swot })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Failed to update profile');
        this.setSession({ token, user: data.user });
        return data.user;
    },

    // ----- Admin: students list -----
    adminGetStudents: async function() {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');
        const res = await fetch(`${this.apiBase}/api/admin/students`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Failed to load students');
        return data.students || [];
    },

    // ----- Admin APIs -----
    adminGetMentors: async function() {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');
        const res = await fetch(`${this.apiBase}/api/admin/mentors`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Failed to load mentors');
        return data.mentors || [];
    },

    adminCreateMentor: async function(mentor) {
        const token = this.getToken();
        if (!token) throw new Error('Backend token missing');
        const res = await fetch(`${this.apiBase}/api/admin/mentors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(mentor)
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Failed to create mentor');
        return data.mentor;
    },

    adminDeleteMentor: async function(id) {
        const token = this.getToken();
        if (!token) throw new Error('Backend token missing');
        const res = await fetch(`${this.apiBase}/api/admin/mentors/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Failed to delete mentor');
        return data.deleted;
    },

    adminAssignMentor: async function(rollNo, mentorId) {
        const token = this.getToken();
        if (!token) throw new Error('Backend token missing');
        const res = await fetch(`${this.apiBase}/api/admin/students/${encodeURIComponent(rollNo)}/assign-mentor`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ mentorId })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Failed to assign mentor');
        return data.student;
    },

    // ----- Mentor APIs -----
    mentorGetMyStudents: async function() {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');
        const res = await fetch(`${this.apiBase}/api/mentor/students`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Failed to load students');
        return data.students || [];
    },

   mentorUpsertSemesterRecord: async function(rollNo, semester, subjects) {
        const token = this.getToken();
        if (!token) throw new Error('Backend token missing');
        
        const res = await fetch(`${this.apiBase}/api/mentor/students/${encodeURIComponent(rollNo)}/academic-records`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ semester, subjects })
        });
        
        const data = await res.json().catch(() => ({}));
        
        if (!res.ok) {
            console.error("Backend Error Response:", data); // Helpful for debugging
            throw new Error(data.error || 'Failed to save academic record');
        }
        
        return data.academicRecord;
    },

    mentorAddFeedback: async function(rollNo, payload) {
        const token = this.getToken();
        if (!token) throw new Error('Backend token missing');
        const res = await fetch(`${this.apiBase}/api/students/${encodeURIComponent(rollNo)}/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload || {})
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Failed to save feedback');
        return data.feedback;
    },

    mentorGetFeedbackHistory: async function() {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');
        const res = await fetch(`${this.apiBase}/api/mentor/feedback`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Failed to load feedback history');
        return data.feedback || [];
    },

    getMyFeedback: async function() {
        const token = this.getToken();
        if (!token) throw new Error('Not authenticated');
        const res = await fetch(`${this.apiBase}/api/students/me/feedback`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Failed to load feedback');
        return data.feedback || [];
    },

    // Logout function
    logout: function() {
        this.clearSession();
        window.location.href = 'index.html';
    },

    // Check authentication and redirect if not logged in
    requireAuth: function(requiredType) {
        const user = this.getCurrentUser();
        if (!user || user.userType !== requiredType) {
            window.location.href = requiredType + '-login.html';
            return false;
        }
        return true;
    }
};

// ===== NOTIFICATION SYSTEM =====
const Notification = {
    show: function(message, type = 'success') {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 16px 24px;
                background: ${type === 'success' ? '#dcfce7' : type === 'error' ? '#fee2e2' : '#dbeafe'};
                color: ${type === 'success' ? '#166534' : type === 'error' ? '#991b1b' : '#1e40af'};
                border-radius: 8px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                z-index: 9999;
                font-weight: 500;
                animation: slideIn 0.3s ease;
            ">
                ${message}
            </div>
        `;
        
        // Add CSS animation
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(400px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
};

// ===== LOCAL STORAGE DATA MANAGEMENT =====
const DataStore = {
    // Initialize default data if not exists
    init: function() {
        if (!localStorage.getItem('mentorFeedback')) {
            localStorage.setItem('mentorFeedback', JSON.stringify({}));
        }
        if (!localStorage.getItem('studentGoals')) {
            localStorage.setItem('studentGoals', JSON.stringify([]));
        }
        if (!localStorage.getItem('careerSuggestions')) {
            localStorage.setItem('careerSuggestions', JSON.stringify({}));
        }
    },

    // Get feedback for a student (with optional rollNo filter)
    getFeedback: function(rollNo = null) {
        const allFeedback = JSON.parse(localStorage.getItem('mentorFeedback') || '{}');
        if (rollNo) {
            return allFeedback[rollNo] || [];
        }
        return allFeedback;
    },

    // Add feedback for a student
    addFeedback: function(rollNo, feedback) {
        const allFeedback = JSON.parse(localStorage.getItem('mentorFeedback') || '{}');
        if (!allFeedback[rollNo]) {
            allFeedback[rollNo] = [];
        }
        feedback.id = Date.now();
        feedback.date = feedback.date || new Date().toISOString();
        allFeedback[rollNo].unshift(feedback);
        localStorage.setItem('mentorFeedback', JSON.stringify(allFeedback));
    },

    // Get goals
    getGoals: function() {
        return JSON.parse(localStorage.getItem('studentGoals') || '[]');
    },

    // Add goal
    addGoal: function(goal) {
        const goals = this.getGoals();
        goal.id = Date.now();
        goal.assignedDate = new Date().toISOString();
        goals.unshift(goal);
        localStorage.setItem('studentGoals', JSON.stringify(goals));
    },

    // Get career suggestions for a student
    getCareerSuggestions: function(rollNo) {
        const allSuggestions = JSON.parse(localStorage.getItem('careerSuggestions') || '{}');
        return allSuggestions[rollNo] || [];
    },

    // Add career suggestion for a student
    addCareerSuggestion: function(rollNo, suggestion) {
        const allSuggestions = JSON.parse(localStorage.getItem('careerSuggestions') || '{}');
        if (!allSuggestions[rollNo]) {
            allSuggestions[rollNo] = [];
        }
        suggestion.id = Date.now();
        allSuggestions[rollNo].push(suggestion);
        localStorage.setItem('careerSuggestions', JSON.stringify(allSuggestions));
    },

    // Get all career suggestions for current student
    getMyCareerSuggestions: function(rollNo) {
        return this.getCareerSuggestions(rollNo);
    }
};

// Initialize data store
DataStore.init();

// ===== UTILITY FUNCTIONS =====
const Utils = {
    // Format date
    formatDate: function(date) {
        const d = new Date(date);
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return d.toLocaleDateString('en-US', options);
    },

    // Show loading
    showLoading: function() {
        const loader = document.createElement('div');
        loader.id = 'loader';
        loader.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            ">
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 8px;
                    text-align: center;
                ">
                    <div style="
                        border: 4px solid #f3f4f6;
                        border-top: 4px solid #2563eb;
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 15px;
                    "></div>
                    <div style="color: #1f2937; font-weight: 500;">Loading...</div>
                </div>
            </div>
        `;
        
        // Add spin animation
        if (!document.querySelector('#spin-animation')) {
            const style = document.createElement('style');
            style.id = 'spin-animation';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(loader);
    },

    // Hide loading
    hideLoading: function() {
        const loader = document.getElementById('loader');
        if (loader) loader.remove();
    }
};

// ===== FORM VALIDATION =====
const Validator = {
    validateEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    validateRollNumber: function(rollNo) {
        // Format: year(2) + 2U1A + branch code(2) + number(2+), e.g. 222U1A0522
        const re = /^\d{2}2U1A\d{2}\d{2,}$/;
        return re.test(String(rollNo || '').trim());
    },

    validatePassword: function(password) {
        return password.length >= 6;
    },

    showError: function(input, message) {
        const formGroup = input.closest('.form-group');
        let error = formGroup.querySelector('.error-message');
        
        if (!error) {
            error = document.createElement('div');
            error.className = 'error-message';
            error.style.cssText = 'color: #ef4444; font-size: 0.75rem; margin-top: 0.25rem;';
            formGroup.appendChild(error);
        }
        
        error.textContent = message;
        input.style.borderColor = '#ef4444';
    },

    clearError: function(input) {
        const formGroup = input.closest('.form-group');
        const error = formGroup.querySelector('.error-message');
        if (error) error.remove();
        input.style.borderColor = '';
    }
};
// --- Scroll to Top Logic ---
window.addEventListener('scroll', function() {
    const scrollBtn = document.getElementById('scrollTopBtn');
    if (scrollBtn) {
        // Show button if scrolled down more than 300px
        if (window.scrollY > 300) {
            scrollBtn.classList.add('show');
        } else {
            scrollBtn.classList.remove('show');
        }
    }
});

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Creates the gliding effect
    });
}

// ===== EXPORT FOR USE IN OTHER FILES =====
window.Auth = Auth;
window.Notification = Notification;
window.DataStore = DataStore;
window.Utils = Utils;
window.Validator = Validator;

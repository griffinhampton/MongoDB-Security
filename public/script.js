document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('dataForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    const alert = document.getElementById('alert');
    const messageTextarea = document.getElementById('message');
    const charCount = document.getElementById('char-count');
    const loadSubmissionsBtn = document.getElementById('loadSubmissions');
    const submissionsList = document.getElementById('submissions-list');

    // Character counter for message textarea
    messageTextarea.addEventListener('input', function() {
        const count = this.value.length;
        charCount.textContent = count;
        
        if (count > 1000) {
            charCount.style.color = '#e53e3e';
        } else if (count > 900) {
            charCount.style.color = '#f56500';
        } else {
            charCount.style.color = '#718096';
        }
    });

    // Form validation functions
    function validateName(name) {
        if (!name.trim()) return 'Name is required';
        if (name.length < 2) return 'Name must be at least 2 characters';
        if (name.length > 100) return 'Name must be less than 100 characters';
        if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
        return null;
    }

    function validateEmail(email) {
        if (!email.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'Please enter a valid email address';
        if (email.length > 255) return 'Email must be less than 255 characters';
        return null;
    }

    function validateMessage(message) {
        if (!message.trim()) return 'Message is required';
        if (message.length < 10) return 'Message must be at least 10 characters';
        if (message.length > 1000) return 'Message must be less than 1000 characters';
        return null;
    }

    // Show error message
    function showError(fieldName, message) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    // Clear error messages
    function clearErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.style.display = 'none';
            element.textContent = '';
        });
    }

    // Show alert
    function showAlert(message, type = 'success') {
        alert.textContent = message;
        alert.className = `alert ${type}`;
        alert.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            alert.style.display = 'none';
        }, 5000);
        
        // Scroll to top to show alert
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Set loading state
    function setLoading(loading) {
        submitBtn.disabled = loading;
        if (loading) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline-block';
        } else {
            btnText.style.display = 'inline-block';
            btnLoading.style.display = 'none';
        }
    }

    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        clearErrors();
        
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        };

        // Client-side validation
        let hasErrors = false;
        
        const nameError = validateName(data.name);
        if (nameError) {
            showError('name', nameError);
            hasErrors = true;
        }

        const emailError = validateEmail(data.email);
        if (emailError) {
            showError('email', emailError);
            hasErrors = true;
        }

        const messageError = validateMessage(data.message);
        if (messageError) {
            showError('message', messageError);
            hasErrors = true;
        }

        if (hasErrors) return;

        setLoading(true);

        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                showAlert('Your data has been saved successfully!', 'success');
                form.reset();
                charCount.textContent = '0';
                charCount.style.color = '#718096';
            } else {
                if (result.errors && Array.isArray(result.errors)) {
                    // Handle validation errors from server
                    result.errors.forEach(error => {
                        const fieldName = error.param || error.path;
                        if (fieldName) {
                            showError(fieldName, error.msg);
                        }
                    });
                } else {
                    showAlert(result.message || 'An error occurred. Please try again.', 'error');
                }
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            showAlert('Network error. Please check your connection and try again.', 'error');
        } finally {
            setLoading(false);
        }
    });

    // Load submissions
    loadSubmissionsBtn.addEventListener('click', async function() {
        const originalText = this.textContent;
        this.textContent = 'Loading...';
        this.disabled = true;

        try {
            const response = await fetch('/api/submissions');
            const result = await response.json();

            if (result.success && result.data) {
                displaySubmissions(result.data);
            } else {
                submissionsList.innerHTML = '<p style="color: #e53e3e;">Error loading submissions.</p>';
            }
        } catch (error) {
            console.error('Error loading submissions:', error);
            submissionsList.innerHTML = '<p style="color: #e53e3e;">Network error loading submissions.</p>';
        } finally {
            this.textContent = originalText;
            this.disabled = false;
        }
    });

    // Display submissions
    function displaySubmissions(submissions) {
        if (submissions.length === 0) {
            submissionsList.innerHTML = '<p style="color: #718096;">No submissions found.</p>';
            return;
        }

        const html = submissions.map(submission => `
            <div class="submission-item">
                <div class="submission-meta">
                    <strong>${escapeHtml(submission.name)}</strong> &bull; 
                    ${escapeHtml(submission.email)} &bull; 
                    ${new Date(submission.createdAt).toLocaleString()}
                </div>
                <div class="submission-content">
                    ${escapeHtml(submission.message)}
                </div>
            </div>
        `).join('');

        submissionsList.innerHTML = html;
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Real-time validation feedback
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');

    nameInput.addEventListener('blur', function() {
        const error = validateName(this.value);
        if (error) {
            showError('name', error);
        } else {
            document.getElementById('name-error').style.display = 'none';
        }
    });

    emailInput.addEventListener('blur', function() {
        const error = validateEmail(this.value);
        if (error) {
            showError('email', error);
        } else {
            document.getElementById('email-error').style.display = 'none';
        }
    });

    messageTextarea.addEventListener('blur', function() {
        const error = validateMessage(this.value);
        if (error) {
            showError('message', error);
        } else {
            document.getElementById('message-error').style.display = 'none';
        }
    });
});
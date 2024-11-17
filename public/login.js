document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const adminId = document.getElementById('adminId').value;
    const password = document.getElementById('password').value;

    // Send login request to the server
    fetch('http://localhost:3000/admin-login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminId, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Login successful') {
            // Redirect to dashboard
            window.location.href = 'index.html';
        } else {
            // Show error message
            const alertBox = document.getElementById('alert');
            alertBox.textContent = data.message;
            alertBox.style.display = 'block';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        const alertBox = document.getElementById('alert');
        alertBox.textContent = 'An error occurred. Please try again.';
        alertBox.style.display = 'block';
    });
});

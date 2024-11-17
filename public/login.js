document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default GET request
    const adminId = document.getElementById('adminId').value;
    const password = document.getElementById('password').value;

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
            window.location.href = 'index.html'; // Redirect if successful
        } else {
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

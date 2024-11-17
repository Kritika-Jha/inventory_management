document.addEventListener('DOMContentLoaded', function () {
    // Fetch all data initially
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
    fetchProductInventory();
    fetchSupplierProductData();

    // Product Form Submission Handler
    const addProductForm = document.getElementById('add-product-form');
    addProductForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const productName = document.getElementById('product-name').value;
        const productStock = document.getElementById('product-stock').value;
        const productPrice = document.getElementById('product-price').value;
        const productExpiry = document.getElementById('product-expiry').value;
        const categoryId = document.getElementById('product-category').value;
        const supplierId = document.getElementById('product-supplier').value;
        
        // Validate input fields
        if (!productName || !productStock || !productPrice || !productExpiry || !categoryId || !supplierId) {
            alert("Please fill in all fields.");
            return;
        }

        // Add new product to the database
        fetch('/add-product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: productName,
                stock_level: productStock,
                price: productPrice,
                expiry_date: productExpiry,
                category_id: categoryId,
                supplier_id: supplierId,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    fetchProducts(); // Refresh the product list
                    addProductForm.reset(); // Reset the form fields
                } else {
                    alert('Failed to add product: ' + data.message);
                }
            })
            .catch((error) => {
                console.error('Error adding product:', error);
            });
    });

    // Fetch and display products
    function fetchProducts() {
        fetch('/get-products')
            .then((response) => response.json())
            .then((data) => {
                data.sort((a, b) => a.id - b.id);
                const inventoryTableBody = document.querySelector('#inventory-table tbody');
                inventoryTableBody.innerHTML = '';

                if (data.length === 0) {
                    inventoryTableBody.innerHTML = '<tr><td colspan="8">No products available.</td></tr>';
                    return;
                }

                data.forEach((product) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${product.id}</td>
                        <td>${product.name}</td>
                        <td>${product.category}</td>
                        <td>${product.supplier}</td>
                        <td>${product.stock_level}</td>
                        <td>${product.price}</td>
                        <td>${product.expiry_date}</td>
                        <td><button class="delete-btn" onclick="deleteProduct(${product.id})">Delete</button></td>
                    `;
                    inventoryTableBody.appendChild(row);
                });
            })
            .catch((error) => {
                console.error('Error fetching products:', error);
            });
    }

    // Fetch and display categories
    function fetchCategories() {
        fetch('/get-categories')
            .then((response) => response.json())
            .then((data) => {
                const categorySelect = document.getElementById('product-category');
                categorySelect.innerHTML = '';

                if (data.length === 0) {
                    categorySelect.innerHTML = '<option value="">No categories available</option>';
                } else {
                    data.forEach((category) => {
                        const option = document.createElement('option');
                        option.value = category.id;
                        option.textContent = category.name;
                        categorySelect.appendChild(option);
                    });
                }

                const categoryTableBody = document.querySelector('#category-table tbody');
                categoryTableBody.innerHTML = '';

                if (data.length === 0) {
                    categoryTableBody.innerHTML = '<tr><td colspan="3">No categories available.</td></tr>';
                } else {
                    data.forEach((category) => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${category.id}</td>
                            <td>${category.name}</td>
                            <td><button class="delete-btn" onclick="deleteCategory(${category.id})">Delete</button></td>
                        `;
                        categoryTableBody.appendChild(row);
                    });
                }
            })
            .catch((error) => {
                console.error('Error fetching categories:', error);
            });
    }

// Fetch and display suppliers
function fetchSuppliers() {
    fetch('/get-suppliers')
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to fetch suppliers.');
            }
            return response.json();
        })
        .then((data) => {
            const supplierSelect = document.getElementById('product-supplier');
            const suppliersTableBody = document.querySelector('#suppliers-table tbody');
            supplierSelect.innerHTML = ''; // Clear previous dropdown options
            suppliersTableBody.innerHTML = ''; // Clear previous table rows

            console.log('Suppliers fetched:', data); // Debugging log

            if (!data.success || !data.suppliers || data.suppliers.length === 0) {
                supplierSelect.innerHTML = '<option value="">No suppliers available</option>';
                suppliersTableBody.innerHTML = '<tr><td colspan="3">No suppliers available</td></tr>';
            } else {
                data.suppliers.forEach((supplier) => {
                    // Populate dropdown
                    const option = document.createElement('option');
                    option.value = supplier.id;
                    option.textContent = supplier.name;
                    supplierSelect.appendChild(option);

                    // Populate table
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${supplier.id}</td>
                        <td>${supplier.name}</td>
                        <td>
                            <button onclick="deleteSupplier(${supplier.id})" class="delete-btn">Delete</button>
                        </td>
                    `;
                    suppliersTableBody.appendChild(row);
                });
            }
        })
        .catch((error) => {
            console.error('Error fetching suppliers:', error);
            alert('Error fetching suppliers. Please try again later.');
        });
}

    // Add new supplier
    const addSupplierForm = document.getElementById('add-supplier-form');
    addSupplierForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const supplierName = document.getElementById('supplier-name').value;

        if (!supplierName.trim()) {
            alert('Please enter a supplier name.');
            return;
        }

        fetch('/add-supplier', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: supplierName }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to add supplier.');
                }
                return response.json();
            })
            .then((data) => {
                if (data.success) {
                    alert('Supplier added successfully!');
                    fetchSuppliers(); // Refresh supplier list
                    addSupplierForm.reset(); // Clear form
                } else {
                    alert('Failed to add supplier: ' + data.message);
                }
            })
            .catch((error) => {
                console.error('Error adding supplier:', error);
                alert('Error adding supplier. Please try again later.');
            });
    });
    // Delete product by ID
    window.deleteProduct = function (id) {
        console.log('Delete button clicked for product ID:', id);  // Log the ID being passed
        fetch(`/delete-product/${id}`, {
            method: 'DELETE',
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to delete product');
            }
            return response.json();
        })
        .then(() => {
            console.log('Product deleted successfully');  // Log success message
            fetchProducts(); // Refresh the product list
        })
        .catch((error) => {
            console.error('Error deleting product:', error);  // Log any errors
        });
    };
    

    // Delete category by ID
    window.deleteCategory = function (id) {
        fetch(`/delete-category/${id}`, {
            method: 'DELETE',
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to delete category');
                }
                return response.json();
            })
            .then(() => {
                fetchCategories(); // Refresh the category list
            })
            .catch((error) => {
                console.error('Error deleting category:', error);
            });
    };

    window.deleteSupplier = function (id) {
        fetch(`/delete-supplier/${id}`, {
            method: 'DELETE',
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to delete supplier');
                }
                return response.json();
            })
            .then(() => {
                fetchSuppliers(); // Refresh the category list
            })
            .catch((error) => {
                console.error('Error deleting supplier:', error);
            });
    };

    function fetchProductInventory() {
        fetch('http://localhost:3000/api/product-inventory')
            .then(response => response.json())  // Parsing the JSON response
            .then(data => {
                console.log('Fetched data:', data);  // Log the raw response data to inspect its structure
                
                // Check if the 'suppliers' array exists in the response and is indeed an array
                if (data.suppliers && Array.isArray(data.suppliers)) {
                    displayProductInventory(data.suppliers);  // Pass the suppliers array to the display function
                } else {
                    console.error('Invalid data format received from server');
                }
            })
            .catch(error => console.error('Error fetching data:', error));  // Log any error if the fetch fails
    }
    
    
    
    
    
    
    function displayProductInventory(suppliers) {
        console.log('Displaying inventory:', suppliers);  // Ensure data is here
        const tableBody = document.querySelector('#inventory-table-2 tbody');
        console.log('Clearing table body');  // Debug if the table body is cleared prematurely
        tableBody.innerHTML = '';  // Clear the table
    
        suppliers.forEach(supplier => {
            console.log('Adding row for:', supplier);  // Debug individual row addition
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${supplier.product_id}</td>
                <td>${supplier.product_name}</td>
                <td>${supplier.price}</td>
                <td>${supplier.stock_level}</td>
                <td>${supplier.supplier_name}</td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    
    function fetchSupplierProductData() {
        fetch('http://localhost:3000/api/supplier-product')
            .then(response => response.json())  // Parse JSON response
            .then(data => {
                console.log('Fetched supplier-product data:', data);  // Log the raw response data to inspect its structure
                
                if (data.success && Array.isArray(data.data)) {
                    displaySupplierProductData(data.data);  // Pass data to display function
                } else {
                    console.error('Invalid data format received from server');
                }
            })
            .catch(error => console.error('Error fetching data:', error));  // Log any error if the fetch fails
    }
    
    // Function to display supplier-product data in a table
    function displaySupplierProductData(supplierProducts) {
        const tableBody = document.querySelector('#supplier-product-table tbody');  // Targeting the table body
    
        // Clearing any existing rows in the table
        tableBody.innerHTML = '';
    
        // Loop through the data and create table rows
        supplierProducts.forEach(item => {
            const row = document.createElement('tr');  // Create a new row
    
            // Add the supplier and product data to the cells
            row.innerHTML = `
                <td>${item.supplier_name}</td>
                <td>${item.product_name}</td>
                <td>${item.product_price}</td>
            `;
    
            // Append the row to the table body
            tableBody.appendChild(row);
        });
    }
    // Function to fetch data and display it in the table
function fetchStockData() {
    // Send a GET request to the backend API endpoint
    fetch('/api/product-stock-status') // Your Express API endpoint
      .then(response => {
        // Check if the response is ok (status code 200-299)
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the JSON data from the response
      })
      .then(data => {
        // Get the table body element where rows will be added
        const tableBody = document.querySelector('#stockTable tbody');
        tableBody.innerHTML = ''; // Clear any existing rows in the table
  
        // Iterate over each product data and create a table row for each
        data.forEach(product => {
          // Create a new table row
          const row = document.createElement('tr');
          
          // Fill the row with product details
          row.innerHTML = `
            <td>${product.product_name}</td>
            <td>${product.stock_level}</td>
            <td>${product.stock_threshold}</td>
            <td>${product.stock_status}</td>
          `;
          
          // Append the row to the table body
          tableBody.appendChild(row);
        });
      })
      .catch(error => {
        // If there's an error (e.g., network issue), log it to the console
        console.error('There was an error fetching the data:', error);
      });
  }
  
  // Call the fetchStockData function when the page loads
  window.onload = fetchStockData;
  
});
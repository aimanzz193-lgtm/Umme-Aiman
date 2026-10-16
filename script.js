document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Cart State & Management ---
    let cart = [];

    const cartListElement = document.getElementById('cart-items-list');
    const cartTotalElement = document.getElementById('cart-total-amount');

    // Add items to cart from menu cards
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const name = button.getAttribute('data-name');
            const price = parseInt(button.getAttribute('data-price'), 10);

            const existingItem = cart.find(item => item.name === name);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ name, price, quantity: 1 });
            }

            updateCartUI();
        });
    });

    // Render Cart Items and Calculate Total
    function updateCartUI() {
        if (!cartListElement || !cartTotalElement) return;

        if (cart.length === 0) {
            cartListElement.innerHTML = '<p class="empty-cart-msg">No items added yet. Click "+ Add to Order" on menu items above.</p>';
            cartTotalElement.innerText = '0';
            return;
        }

        let total = 0;
        cartListElement.innerHTML = '';

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            const row = document.createElement('div');
            row.className = 'cart-item-row';
            row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding:10px 14px; background:#f4f6f4; border-radius:8px;';

            row.innerHTML = `
                <div>
                    <strong>${item.name}</strong> <small style="color:#666;">(x${item.quantity})</small>
                    <br>
                    <span style="font-size:0.9rem; color:#4A6B4A;">PKR ${itemTotal.toLocaleString()}</span>
                </div>
                <button type="button" onclick="removeCartItem(${index})" style="background:none; border:none; color:#c93b3b; cursor:pointer; font-size:1.1rem; font-weight:bold;">✕</button>
            `;

            cartListElement.appendChild(row);
        });

        cartTotalElement.innerText = total.toLocaleString();
    }

    // Global function to remove an item from cart
    window.removeCartItem = function(index) {
        cart.splice(index, 1);
        updateCartUI();
    };

    // --- 2. Table Reservation & Pre-order Form Submission ---
    const reservationForm = document.querySelector('.reservation-form');
    if (reservationForm) {
        reservationForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = reservationForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;

            const inputs = reservationForm.querySelectorAll('input, select');
            
            const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            const reservationData = {
                fullName: inputs[0].value,
                phone: inputs[1].value,
                date: inputs[2].value,
                time: inputs[3].value,
                guests: inputs[4].value,
                cartItems: cart,
                totalAmount: totalAmount
            };

            submitBtn.innerText = "Processing...";
            submitBtn.style.opacity = "0.7";
            submitBtn.disabled = true;

            try {
                const response = await fetch('http://localhost:5000/api/reservations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(reservationData) // FIXED: Changed formData to reservationData
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    alert("🎉 Thank you! Your table reservation and pre-order request at Morrow Espress Co. have been submitted successfully.");
                    reservationForm.reset();
                    cart = [];
                    updateCartUI();
                } else {
                    alert("❌ Reservation failed: " + (result.message || "Please check your inputs."));
                }
            } catch (error) {
                console.error('Error submitting reservation:', error);
                alert("⚠️ Cannot connect to the backend server. Make sure node server.js is running!");
            } finally {
                submitBtn.innerText = originalText;
                submitBtn.style.opacity = "1";
                submitBtn.disabled = false;
            }
        });
    }
});
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Local JSON database file path
const DATA_FILE = path.join(__dirname, 'reservations.json');

// Reservation Endpoint
app.post('/api/reservations', (req, res) => {
    try {
        console.log('📥 Received incoming payload:', req.body);

        const { fullName, phone, date, time, guests, cartItems, totalAmount } = req.body;

        if (!fullName || !phone || !date || !time || !guests) {
            return res.status(400).json({ 
                success: false, 
                message: 'All required reservation fields must be filled.' 
            });
        }

        // Read existing reservations or initialize empty array
        let reservations = [];
        if (fs.existsSync(DATA_FILE)) {
            const fileData = fs.readFileSync(DATA_FILE, 'utf8');
            try {
                reservations = JSON.parse(fileData);
            } catch (e) {
                reservations = [];
            }
        }

        const newReservation = {
            id: Date.now(),
            fullName,
            phone,
            date,
            time,
            guests,
            cartItems: cartItems || [],
            totalAmount: totalAmount || 0,
            createdAt: new Date().toISOString()
        };

        reservations.push(newReservation);
        fs.writeFileSync(DATA_FILE, JSON.stringify(reservations, null, 2));

        console.log('✅ Reservation Saved Successfully to Local Database!');

        return res.status(201).json({
            success: true,
            message: 'Table reservation and pre-order submitted successfully!',
            data: newReservation
        });

    } catch (error) {
        console.error('❌ Error saving reservation:', error.message);
        return res.status(500).json({ 
            success: false, 
            message: `Server error: ${error.message}` 
        });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
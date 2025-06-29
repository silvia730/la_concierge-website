g# Le Concierge - Luxury Lifestyle Concierge Service

A premium concierge service website with PayPal integration for consultation bookings.

## Features

- **User Authentication**: Secure login/signup system with JWT tokens
- **PayPal Integration**: Seamless payment processing for consultations
- **Consultation Booking**: $80 consultation fee with PayPal payment
- **User Dashboard**: Manage services, payments, and account settings
- **Responsive Design**: Modern, luxury-focused UI
- **MySQL Database**: Secure data storage for users and consultations

## Project Structure

```
la concierge website/
├── Frontend/
│   ├── index.html          # Main website
│   ├── style.css           # Styling
│   ├── script.js           # Frontend logic
│   └── images/
│       └── logo.png        # Company logo
└── backend/
    ├── app.py              # Flask API server
    ├── setup_database.py   # Database setup script
    ├── run_backend.bat     # Windows batch file for easy setup
    ├── requirements.txt    # Python dependencies
    └── env_example.txt     # Environment variables template
```

## Database Configuration

**Your MySQL Credentials:**
- Host: 
- Port:
- Username: 
- Password: 
- Database: le_concierge

## Quick Setup (Windows)

### Option 1: One-Click Setup (Recommended)
1. Navigate to the `backend` folder
2. Double-click `run_backend.bat`
3. The script will automatically:
   - Install Python dependencies
   - Create the database and tables
   - Start the backend server

### Option 2: Manual Setup

#### Step 1: Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Step 2: Set Up Database
```bash
python setup_database.py
```

#### Step 3: Run Backend Server
```bash
python app.py
```

The API will run on `http://localhost:5000`

## Manual Database Setup (if needed)

If you prefer to set up the database manually in MySQL Workbench:

1. **Open MySQL Workbench**
2. **Connect to your MySQL server:**
   - Host: 
   - Port:
   - Username: 
   - Password:

3. **Create the database:**
   ```sql
   CREATE DATABASE le_concierge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE le_concierge;
   ```

4. **Run the backend** - it will automatically create all tables:
   ```bash
   cd backend
   python app.py
   ```

## Frontend Setup

### Update PayPal Client ID
1. Open `Frontend/index.html`
2. Replace `YOUR_PAYPAL_CLIENT_ID` with your actual PayPal Client ID

### Run Frontend
1. Open `Frontend/index.html` in your browser
2. Or serve it using a local server:
   ```bash
   cd Frontend
   python -m http.server 3000
   ```

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile (requires JWT)
- `PUT /api/profile` - Update user profile (requires JWT)

### Consultations
- `POST /api/consultation` - Create consultation request
- `GET /api/consultations` - Get user consultations (requires JWT)

### PayPal Integration
- `POST /api/paypal/create-order` - Create PayPal order
- `POST /api/paypal/capture-payment` - Capture PayPal payment

## PayPal Integration Flow

1. **User fills consultation form** → Creates consultation record
2. **System creates PayPal order** → Redirects to PayPal
3. **User completes payment** → PayPal redirects back
4. **System captures payment** → Updates consultation status
5. **Confirmation** → User receives confirmation

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Flask Configuration
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# Database Configuration (already configured)
DATABASE_URL=mysql://root:#07silvia,njeri@localhost:3306/le_concierge

# PayPal Configuration
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_ENVIRONMENT=sandbox  # Change to 'live' for production
```

## Database Tables

The system will automatically create these tables:

- **users** - User accounts and authentication
- **consultations** - Consultation requests and details
- **payments** - PayPal payment records

## Troubleshooting

### Common Issues:

1. **MySQL Connection Error:**
   - Ensure MySQL is running on localhost
   - Verify credentials:your password

2. **Port Already in Use:**
   - Change port in `app.py` line: `app.run(debug=True, host='0.0.0.0', port=5001)`

3. **Module Not Found:**
   - Run: `pip install -r requirements.txt`

4. **Database Access Denied:**
   - Check MySQL user permissions
   - Verify password is correct

## Security Features

- JWT token authentication
- Password hashing with Werkzeug
- CORS protection
- Input validation
- Secure PayPal integration

## Testing PayPal Integration

1. Use PayPal Sandbox for testing
2. Create sandbox buyer and seller accounts
3. Test the complete payment flow
4. Switch to live environment for production

## Production Deployment

1. Set `PAYPAL_ENVIRONMENT=live`
2. Use production PayPal credentials
3. Configure proper CORS settings
4. Set up HTTPS
5. Use production database
6. Configure proper logging

## Support

For technical support or questions about the PayPal integration, please refer to:
- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

## License

This project is proprietary software for Le Concierge. 

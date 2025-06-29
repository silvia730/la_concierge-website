from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
import os
import requests
from datetime import datetime, timedelta
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)

# PayPal Configuration
PAYPAL_CLIENT_ID = os.environ.get('PAYPAL_CLIENT_ID', 'Ae4Ffb7ogDVVb4ZbVpouoCPOB5-jZ0QU0ODza3poXpNqIpkcCoV78lI6MHvYDNDXpGyL9hnTZSkmsDyY')
PAYPAL_CLIENT_SECRET = os.environ.get('PAYPAL_CLIENT_SECRET', 'EOkYbxsoOHRkqTsJEmN8ZyU3_JBGYx-41vOxYdCYH4e-ksXDl-uRcL-fSLGY0cxWRgO4BeNfUSXLhyzK')
PAYPAL_BASE_URL = 'https://api-m.paypal.com'  # Use production PayPal API

CORS(app)
db = SQLAlchemy(app)
jwt = JWTManager(app)

# Database Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    consultations = db.relationship('Consultation', backref='user', lazy=True)

class Consultation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    requirements = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='pending')
    payment_status = db.Column(db.String(20), default='pending')
    payment_id = db.Column(db.String(100), nullable=True)
    amount = db.Column(db.Float, default=80.00)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    consultation_id = db.Column(db.Integer, db.ForeignKey('consultation.id'), nullable=False)
    paypal_order_id = db.Column(db.String(100), nullable=False)
    paypal_payment_id = db.Column(db.String(100), nullable=True)
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# PayPal Helper Functions
def get_paypal_access_token():
    """Get PayPal access token"""
    try:
        auth = (PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET)
        data = {'grant_type': 'client_credentials'}
        
        print(f"Requesting PayPal access token from: {PAYPAL_BASE_URL}/v1/oauth2/token")
        print(f"Client ID: {PAYPAL_CLIENT_ID[:10]}...")
        
        response = requests.post(f'{PAYPAL_BASE_URL}/v1/oauth2/token', auth=auth, data=data)
        response.raise_for_status()
        
        token_data = response.json()
        print(f"PayPal access token received: {token_data.get('access_token', '')[:10]}...")
        
        return token_data['access_token']
    except requests.exceptions.RequestException as e:
        print(f"PayPal access token error: {e}")
        print(f"Response status: {e.response.status_code if hasattr(e, 'response') else 'N/A'}")
        print(f"Response text: {e.response.text if hasattr(e, 'response') else 'N/A'}")
        raise

def create_paypal_order(amount, description, consultation_id):
    """Create a PayPal order"""
    try:
        access_token = get_paypal_access_token()
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'intent': 'CAPTURE',
            'purchase_units': [{
                'amount': {
                    'currency_code': 'USD',
                    'value': str(amount)
                },
                'description': description,
                'custom_id': str(consultation_id)
            }],
            'application_context': {
                'return_url': 'http://localhost:3000/success',
                'cancel_url': 'http://localhost:3000/cancel'
            }
        }
        
        print(f"Creating PayPal order with payload: {payload}")
        
        response = requests.post(f'{PAYPAL_BASE_URL}/v2/checkout/orders', headers=headers, json=payload)
        response.raise_for_status()
        
        order_data = response.json()
        print(f"PayPal order created: {order_data.get('id', 'N/A')}")
        
        return order_data
    except requests.exceptions.RequestException as e:
        print(f"PayPal order creation error: {e}")
        print(f"Response status: {e.response.status_code if hasattr(e, 'response') else 'N/A'}")
        print(f"Response text: {e.response.text if hasattr(e, 'response') else 'N/A'}")
        raise

def capture_paypal_payment(order_id):
    """Capture a PayPal payment"""
    try:
        access_token = get_paypal_access_token()
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        print(f"Capturing PayPal payment for order: {order_id}")
        
        response = requests.post(f'{PAYPAL_BASE_URL}/v2/checkout/orders/{order_id}/capture', headers=headers)
        response.raise_for_status()
        
        capture_data = response.json()
        print(f"PayPal payment captured: {capture_data.get('id', 'N/A')}")
        
        return capture_data
    except requests.exceptions.RequestException as e:
        print(f"PayPal payment capture error: {e}")
        print(f"Response status: {e.response.status_code if hasattr(e, 'response') else 'N/A'}")
        print(f"Response text: {e.response.text if hasattr(e, 'response') else 'N/A'}")
        raise

# API Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    # Create new user
    user = User(
        name=data['name'],
        email=data['email'],
        phone=data['phone'],
        password_hash=generate_password_hash(data['password'])
    )
    
    db.session.add(user)
    db.session.commit()
    
    # Create access token
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        'access_token': access_token,
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'phone': user.phone
        }
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    if user and check_password_hash(user.password_hash, data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'phone': user.phone
            }
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'phone': user.phone
        }
    })

@app.route('/api/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    data = request.get_json()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user.name = data.get('name', user.name)
    user.email = data.get('email', user.email)
    user.phone = data.get('phone', user.phone)
    
    if 'password' in data and data['password']:
        user.password_hash = generate_password_hash(data['password'])
    
    db.session.commit()
    
    return jsonify({
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'phone': user.phone
        }
    })

@app.route('/api/consultation/placeholder', methods=['POST'])
def create_consultation_placeholder():
    """Create a consultation placeholder for payment processing"""
    data = request.get_json()
    
    consultation = Consultation(
        name=data['name'],
        email=data['email'],
        phone=data['phone'],
        requirements=data.get('requirements', ''),
        status='pending',
        payment_status='pending'
    )
    
    db.session.add(consultation)
    db.session.commit()
    
    return jsonify({
        'consultation_id': consultation.id,
        'message': 'Consultation placeholder created for payment'
    }), 201

@app.route('/api/consultation', methods=['POST'])
def create_consultation():
    data = request.get_json()
    
    # Check if user has a completed payment for this consultation
    # For now, we'll check if there's a completed payment record
    payment = Payment.query.filter_by(
        consultation_id=data.get('consultation_id'),
        status='completed'
    ).first()
    
    if not payment:
        return jsonify({
            'error': 'Payment required',
            'message': 'Please complete payment first before booking consultation'
        }), 402
    
    # Create consultation with payment confirmed
    consultation = Consultation(
        name=data['name'],
        email=data['email'],
        phone=data['phone'],
        requirements=data.get('requirements', ''),
        status='confirmed',
        payment_status='completed'
    )
    
    db.session.add(consultation)
    db.session.commit()
    
    return jsonify({
        'consultation_id': consultation.id,
        'message': 'Consultation booked successfully! We will contact you within 24 hours.',
        'status': 'confirmed'
    }), 201

@app.route('/api/consultation/<int:consultation_id>/confirm', methods=['POST'])
def confirm_consultation():
    """Confirm a consultation after payment is completed"""
    consultation_id = request.view_args['consultation_id']
    consultation = Consultation.query.get(consultation_id)
    
    if not consultation:
        return jsonify({'error': 'Consultation not found'}), 404
    
    # Check if payment is completed
    payment = Payment.query.filter_by(consultation_id=consultation_id, status='completed').first()
    
    if not payment:
        return jsonify({'error': 'Payment not completed'}), 400
    
    # Update consultation status
    consultation.status = 'confirmed'
    consultation.payment_status = 'completed'
    db.session.commit()
    
    return jsonify({
        'consultation_id': consultation.id,
        'message': 'Consultation confirmed successfully!',
        'status': 'confirmed'
    })

@app.route('/api/paypal/create-order', methods=['POST'])
def create_paypal_order_route():
    data = request.get_json()
    
    try:
        # Validate required fields
        if not all(key in data for key in ['amount', 'description', 'consultation_id']):
            return jsonify({'error': 'Missing required fields: amount, description, consultation_id'}), 400
        
        # Create PayPal order
        paypal_response = create_paypal_order(
            amount=data['amount'],
            description=data['description'],
            consultation_id=data['consultation_id']
        )
        
        # Store payment record
        payment = Payment(
            consultation_id=data['consultation_id'],
            paypal_order_id=paypal_response['id'],
            amount=data['amount']
        )
        db.session.add(payment)
        db.session.commit()
        
        # Find approval URL
        approval_url = None
        for link in paypal_response.get('links', []):
            if link['rel'] == 'approve':
                approval_url = link['href']
                break
        
        return jsonify({
            'order_id': paypal_response['id'],
            'approval_url': approval_url,
            'status': paypal_response['status']
        })
        
    except requests.exceptions.RequestException as e:
        print(f"PayPal API Error: {e}")
        return jsonify({'error': f'PayPal API error: {str(e)}'}), 500
    except Exception as e:
        print(f"General Error: {e}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/paypal/capture-payment', methods=['POST'])
def capture_paypal_payment_route():
    data = request.get_json()
    
    try:
        # Validate required fields
        if not all(key in data for key in ['order_id', 'consultation_id']):
            return jsonify({'error': 'Missing required fields: order_id, consultation_id'}), 400
        
        # Capture PayPal payment
        capture_response = capture_paypal_payment(data['order_id'])
        
        # Update payment record
        payment = Payment.query.filter_by(paypal_order_id=data['order_id']).first()
        if payment:
            payment.status = 'completed'
            payment.paypal_payment_id = capture_response.get('id')
            db.session.commit()
        
        # Update consultation
        consultation = Consultation.query.get(data['consultation_id'])
        if consultation:
            consultation.payment_status = 'completed'
            consultation.payment_id = capture_response.get('id')
            consultation.status = 'confirmed'
            db.session.commit()
        
        return jsonify({
            'consultation_id': data['consultation_id'],
            'payment_id': capture_response.get('id'),
            'status': 'completed'
        })
        
    except requests.exceptions.RequestException as e:
        print(f"PayPal capture API Error: {e}")
        return jsonify({'error': f'PayPal API error: {str(e)}'}), 500
    except Exception as e:
        print(f"General capture error: {e}")
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@app.route('/api/consultations', methods=['GET'])
@jwt_required()
def get_consultations():
    user_id = get_jwt_identity()
    consultations = Consultation.query.filter_by(user_id=user_id).order_by(Consultation.created_at.desc()).all()
    
    return jsonify({
        'consultations': [{
            'id': c.id,
            'name': c.name,
            'email': c.email,
            'phone': c.phone,
            'requirements': c.requirements,
            'status': c.status,
            'payment_status': c.payment_status,
            'amount': c.amount,
            'created_at': c.created_at.isoformat()
        } for c in consultations]
    })

# Health check
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Le Concierge API is running'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    port = int(os.environ.get('PORT', 5000))  # Get from .env or use 5000
    app.run(debug=True, host='0.0.0.0', port=port)
    

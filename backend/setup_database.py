#!/usr/bin/env python3
"""
Database Setup Script for Le Concierge
This script will automatically create the database and all tables.
"""

import pymysql
import sys
from sqlalchemy import create_engine, text
from app import app, db

def create_database():
    """Create the database if it doesn't exist"""
    try:
        # Connect to MySQL without specifying a database
        connection = pymysql.connect(
            host='localhost',
            port=3306,
            user='root',
            password='#07silvia,njeri',
            charset='utf8mb4'
        )
        
        cursor = connection.cursor()
        
        # Create database if it doesn't exist
        cursor.execute("CREATE DATABASE IF NOT EXISTS le_concierge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        print("✅ Database 'le_concierge' created successfully!")
        
        cursor.close()
        connection.close()
        
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        sys.exit(1)

def create_tables():
    """Create all tables using SQLAlchemy"""
    try:
        with app.app_context():
            # Create all tables
            db.create_all()
            print("✅ All tables created successfully!")
            
            # Verify tables were created
            engine = create_engine('mysql+pymysql://root:#07silvia,njeri@localhost:3306/le_concierge')
            with engine.connect() as conn:
                result = conn.execute(text("SHOW TABLES"))
                tables = [row[0] for row in result]
                print(f"📋 Created tables: {', '.join(tables)}")
                
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        sys.exit(1)

def test_connection():
    """Test database connection"""
    try:
        with app.app_context():
            # Test connection by executing a simple query
            result = db.session.execute(text("SELECT 1"))
            print("✅ Database connection test successful!")
            
    except Exception as e:
        print(f"❌ Database connection test failed: {e}")
        sys.exit(1)

def main():
    """Main setup function"""
    print("🚀 Setting up Le Concierge Database...")
    print("=" * 50)
    
    # Step 1: Create database
    print("\n1. Creating database...")
    create_database()
    
    # Step 2: Create tables
    print("\n2. Creating tables...")
    create_tables()
    
    # Step 3: Test connection
    print("\n3. Testing connection...")
    test_connection()
    
    print("\n" + "=" * 50)
    print("🎉 Database setup completed successfully!")
    print("\nYou can now run the backend with: python app.py")
    print("The database will be accessible in MySQL Workbench at:")
    print("Host: localhost")
    print("Port: 3306")
    print("Username: root")
    print("Password: #07silvia,njeri")
    print("Database: le_concierge")

if __name__ == "__main__":
    main() 
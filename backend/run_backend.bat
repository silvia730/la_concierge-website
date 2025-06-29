@echo off
echo ========================================
echo    Le Concierge Backend Setup
echo ========================================
echo.

echo Step 1: Installing Python dependencies...
pip install -r requirements.txt
echo.

echo Step 2: Setting up database...
python setup_database.py
echo.

echo Step 3: Starting the backend server...
echo The API will be available at: http://localhost:5000
echo Press Ctrl+C to stop the server
echo.
python app.py

pause 
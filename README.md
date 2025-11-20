# Aspira | Public Service Feedback Tracker

## Project Overview
Aspira is a citizen-focused feedback tracking system that enables citizens to provide feedback on public services and allows administrators to manage and respond to that feedback effectively.

## Features

### Citizen Features
- **Registration**: Citizens can register with their full name, phone number, ID number, and address
- **Login**: Secure login using ID number and password
- **Feedback Submission**: Submit feedback about public services
- **Feedback Tracking**: View and track the status of submitted feedback

### Admin Features
- **Secure Login**: Admin authentication with username and password
- **Feedback Management**: View all submitted feedback
- **Response Management**: Respond to citizen feedback
- **Report Generation**: Generate feedback reports

## Project Structure
```
Aspira/
├── README.md
├── requirements.txt
├── schema.sql
├── setup.py
└── src/
    └── app/
        ├── config.py          # Database configuration
        ├── auth.py            # Authentication module
        ├── main.py            # Entry point
        ├── citizen.py         # Citizen features
        ├── admin.py           # Admin features
        ├── services.py        # Service utilities
```

## Installation & Setup

### 1. Prerequisites
- Python 3.7 or higher
- pip (Python package manager)
- MySQL database access

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Database Setup
The database configuration is stored in `src/app/config.py` with the following credentials:
- **Host**: mysql-31a57ee8-alustudent-e6a9.f.aivencloud.com
- **Port**: 23446
- **User**: avnadmin
- **Password**: AVNS_fN2SjjA096YJG9VsSfv
- **Database**: aspira

### 4. Initialize Database Schema
Run the SQL schema to create tables:
```bash
mysql -h mysql-31a57ee8-alustudent-e6a9.f.aivencloud.com -P 23446 -u avnadmin -p < schema.sql
```

## Running the Application

### Start the Application
```bash
cd src/app
python main.py
```

## Usage Guide

### Authentication System

#### Citizen Registration
1. Select "1. Citizen" from the main menu
2. Select "1. Register"
3. Enter your details:
   - Full Name (minimum 3 characters)
   - Phone Number (9-13 digits)
   - ID Number (minimum 5 characters)
   - Address (location/district)
   - Password (minimum 6 characters)
4. Confirm your password
5. Your Citizen ID will be displayed upon successful registration

#### Citizen Login
1. Select "1. Citizen" from the main menu
2. Select "2. Login"
3. Enter your phone number
4. Enter your password
5. Upon successful login, you'll see a welcome message with your name

#### Admin Login
1. Select "2. Admin" from the main menu
2. Select "1. Login"
3. Enter your admin username
4. Enter your admin password
5. Upon successful login, you'll have access to admin features

## Code Structure

### Authentication Module (`auth.py`)

#### DatabaseConnection Class
Handles all database connections and queries:
- `connect()`: Establish connection to the database
- `close()`: Close the database connection
- `execute_query()`: Execute SQL queries
- `fetch_one()`: Fetch a single result
- `fetch_all()`: Fetch all results

#### CitizenAuth Class
Manages citizen registration and login:
- `hash_password()`: Hash passwords using SHA-256
- `validate_phone()`: Validate phone number format
- `validate_id()`: Validate ID number format
- `validate_password()`: Validate password strength
- `register()`: Register a new citizen
- `login()`: Authenticate a citizen

#### AdminAuth Class
Manages admin authentication:
- `hash_password()`: Hash passwords using SHA-256
- `login()`: Authenticate an admin

#### AuthenticationMenu Class
Provides menu-driven interface:
- `display_main_menu()`: Main menu
- `citizen_menu()`: Citizen options
- `admin_menu()`: Admin options
- `start()`: Start the authentication system

## Database Schema

### Tables Created:
- **citizen**: Stores citizen information
- **admin**: Stores admin credentials
- **services**: List of public services
- **feedback**: Citizen feedback submissions
- **comments**: Comments on feedback

## Security Features
- **Password Hashing**: All passwords are hashed using SHA-256
- **Input Validation**: Phone numbers, ID numbers, and passwords are validated
- **Database Connection**: Secure connection to remote database
- **Error Handling**: Comprehensive error handling and user feedback

## Error Handling
The application includes robust error handling:
- Database connection errors
- Invalid input validation
- Duplicate registration prevention
- User-friendly error messages

## Future Enhancements
- Feedback submission module
- Feedback tracking and status updates
- Report generation
- Email notifications
- SMS alerts
- Dashboard analytics

## Contact & Support
For issues or suggestions, please contact the development team.

## License
This project is developed for educational purposes.
import mysql.connector
from mysql.connector import Error
from config import DB_CONFIG
import hashlib
import re


class DatabaseConnection:
    """Handles database connection and queries"""
    
    def __init__(self):
        self.connection = None
    
    def connect(self):
        """Establish database connection"""
        try:
            self.connection = mysql.connector.connect(**DB_CONFIG)
            if self.connection.is_connected():
                print("✓ Database connection successful!")
            return self.connection
        except Error as e:
            print(f"✗ Error connecting to database: {e}")
            return None
    
    def close(self):
        """Close database connection"""
        if self.connection and self.connection.is_connected():
            self.connection.close()
    
    def execute_query(self, query, params=None):
        """Execute a query and return results"""
        try:
            # Use a buffered cursor so results are fetched client-side
            # and the server-side resultset is freed immediately. This
            # prevents "Unread result found" errors when running multiple
            # consecutive queries on the same connection.
            cursor = self.connection.cursor(dictionary=True, buffered=True)
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            # Only commit for modifying queries. Avoid committing after
            # SELECT queries because some MySQL drivers can raise
            # "Unread result found" when a commit is attempted while
            # there are un-fetched results on the connection.
            if not query.strip().lower().startswith('select'):
                try:
                    self.connection.commit()
                except Error:
                    # commit is best-effort here; failures will be handled
                    # by the caller via returned None
                    pass
            return cursor
        except Error as e:
            print(f"Error executing query: {e}")
            return None
    
    def fetch_one(self, query, params=None):
        """Fetch a single result"""
        cursor = self.execute_query(query, params)
        if cursor:
            try:
                result = cursor.fetchone()
                return result
            finally:
                try:
                    cursor.close()
                except Exception:
                    pass
        return None
    
    def fetch_all(self, query, params=None):
        """Fetch all results"""
        cursor = self.execute_query(query, params)
        if cursor:
            try:
                results = cursor.fetchall()
                return results
            finally:
                try:
                    cursor.close()
                except Exception:
                    pass
        return None


class CitizenAuth:
    """Handles citizen registration and login"""
    
    def __init__(self, db_connection):
        self.db = db_connection
    
    @staticmethod
    def hash_password(password):
        """Hash password using SHA-256"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    @staticmethod
    def validate_phone(phone):
        """Validate phone number format"""
        phone = phone.strip()
        if len(phone) < 9 or len(phone) > 13:
            return False
        return phone.replace('+', '').isdigit()
    
    @staticmethod
    def validate_id(id_number):
        """Validate ID number format"""
        return len(id_number.strip()) >= 5
    
    @staticmethod
    def validate_password(password):
        """Validate password (minimum 6 characters)"""
        return len(password) >= 6
    
    def register(self):
        """Register a new citizen"""
        print("\n" + "="*50)
        print("CITIZEN REGISTRATION")
        print("="*50)
        
        try:
            # Get citizen details
            full_name = input("Enter full name: ").strip()
            if not full_name:
                print("✗ Full name cannot be empty!")
                return False
            
            phone = input("Enter phone number (9-13 digits): ").strip()
            if not self.validate_phone(phone):
                print("✗ Invalid phone number!")
                return False
            
            id_number = input("Enter ID number: ").strip()
            if not self.validate_id(id_number):
                print("✗ Invalid ID number! Must be at least 5 characters.")
                return False
            
            address = input("Enter address (location/district): ").strip()
            if not address:
                print("✗ Address cannot be empty!")
                return False
            
            password = input("Enter password (minimum 6 characters): ").strip()
            if not self.validate_password(password):
                print("✗ Password must be at least 6 characters!")
                return False
            
            confirm_password = input("Confirm password: ").strip()
            if password != confirm_password:
                print("✗ Passwords do not match!")
                return False
            
            # Check if citizen already exists
            query = "SELECT citizenId FROM citizen WHERE phoneNumber = %s"
            existing = self.db.fetch_one(query, (phone,))
            if existing:
                print("✗ Citizen with this phone number already exists!")
                return False
            
            # Check if ID number already exists
            query = "SELECT citizenId FROM citizen WHERE idNumber = %s"
            existing = self.db.fetch_one(query, (id_number,))
            if existing:
                print("✗ ID number already registered!")
                return False
            
            # Hash password and insert into database
            hashed_password = self.hash_password(password)
            insert_query = """
                INSERT INTO citizen (fullName, phoneNumber, idNumber, password, address)
                VALUES (%s, %s, %s, %s, %s)
            """
            cursor = self.db.execute_query(insert_query, 
                                          (full_name, phone, id_number, hashed_password, address))
            if not cursor:
                print("✗ Registration failed: database error during insert")
                return False

            try:
                last_id = getattr(cursor, 'lastrowid', None)
            finally:
                try:
                    cursor.close()
                except Exception:
                    pass

            print("\n✓ Registration successful!")
            print(f"Your Citizen ID: {last_id}")
            return True
            
        except Exception as e:
            print(f"✗ Registration failed: {e}")
            return False
    
    def login(self):
        """Login an existing citizen"""
        print("\n" + "="*50)
        print("CITIZEN LOGIN")
        print("="*50)
        
        try:
            phone = input("Enter phone number: ").strip()
            password = input("Enter password: ").strip()
            
            # Fetch citizen from database
            query = "SELECT citizenId, fullName, password FROM citizen WHERE phoneNumber = %s"
            citizen = self.db.fetch_one(query, (phone,))
            
            if not citizen:
                print("✗ Citizen not found!")
                return None
            
            # Verify password
            hashed_input = self.hash_password(password)
            if citizen['password'] != hashed_input:
                print("✗ Incorrect password!")
                return None
            
            print(f"\n✓ Login successful! Welcome, {citizen['fullName']}!")
            return citizen['citizenId']
            
        except Exception as e:
            print(f"✗ Login failed: {e}")
            return None


class AdminAuth:
    """Handles admin login"""
    
    def __init__(self, db_connection):
        self.db = db_connection
    
    @staticmethod
    def hash_password(password):
        """Hash password using SHA-256"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def login(self):
        """Login an admin"""
        print("\n" + "="*50)
        print("ADMIN LOGIN")
        print("="*50)

        try:
            username = input("Enter username: ").strip()
            password = input("Enter password: ").strip()
            
            # Fetch admin from database
            query = "SELECT adminId, username, password FROM admin WHERE username = %s"
            admin = self.db.fetch_one(query, (username,))
            
            if not admin:
                print("✗ Admin not found!")
                return None
            
            # Verify password
            hashed_input = self.hash_password(password)
            if admin['password'] != hashed_input:
                print("✗ Incorrect password!")
                return None
            
            print(f"\n✓ Login successful! Welcome, {admin['username']}!")
            return admin['adminId']
            
        except Exception as e:
            print(f"✗ Login failed: {e}")
            return None


class AuthenticationMenu:
    """Main authentication menu handler"""
    
    def __init__(self):
        self.db_connection = DatabaseConnection()
        self.db_connection.connect()
        self.citizen_auth = CitizenAuth(self.db_connection)
        self.admin_auth = AdminAuth(self.db_connection)
        self.current_user_id = None
        self.current_user_type = None
    
    def display_main_menu(self):
        """Display main authentication menu"""
        while True:
            print("\n" + "="*50)
            print("ASPIRA - PUBLIC SERVICE FEEDBACK TRACKER")
            print("="*50)
            print("Who are you?")
            print("1. Citizen")
            print("2. Admin")
            print("3. Exit")
            print("="*50)
            
            choice = input("Enter your choice (1-3): ").strip()
            
            if choice == '1':
                self.citizen_menu()
            elif choice == '2':
                self.admin_menu()
            elif choice == '3':
                print("\n✓ Thank you for using Aspira. Goodbye!")
                self.db_connection.close()
                break
            else:
                print("✗ Invalid choice! Please try again.")
    
    def citizen_menu(self):
        """Display citizen menu"""
        while True:
            print("\n" + "="*50)
            print("CITIZEN MENU")
            print("="*50)
            print("1. Register")
            print("2. Login")
            print("3. Back to Main Menu")
            print("="*50)
            
            choice = input("Enter your choice (1-3): ").strip()
            
            if choice == '1':
                self.citizen_auth.register()
                input("\nPress Enter to continue...")
            elif choice == '2':
                citizen_id = self.citizen_auth.login()
                if citizen_id:
                    self.current_user_id = citizen_id
                    self.current_user_type = 'citizen'
                    print("\n✓ You are now logged in as a Citizen.")
    
                    print("(Note: Additional citizen features can be accessed here)")
                    input("\nPress Enter to continue...")
                    from citizen import citizen_dashboard
                    citizen_dashboard(self.db_connection, citizen_id)
                    # You can return here or call citizen dashboard
                input("\nPress Enter to continue...")
            elif choice == '3':
                break
            else:
                print("✗ Invalid choice! Please try again.")
    
    def admin_menu(self):
        """Display admin menu"""
        while True:
            print("\n" + "="*50)
            print("ADMIN MENU")
            print("="*50)
            print("1. Login")
            print("2. Back to Main Menu")
            print("="*50)
            
            choice = input("Enter your choice (1-2): ").strip()
            
            if choice == '1':
                admin_id = self.admin_auth.login()
                if admin_id:
                    self.current_user_id = admin_id
                    self.current_user_type = 'admin'
                    print("\n✓ You are now logged in as an Admin.")
                    print("(Note: Additional admin features can be accessed here)")
                    input("\nPress Enter to continue...")
                    # You can return here or call admin dashboard
                input("\nPress Enter to continue...")
            elif choice == '2':
                break
            else:
                print("✗ Invalid choice! Please try again.")
    
    def get_current_user(self):
        """Get current logged-in user info"""
        return {
            'user_id': self.current_user_id,
            'user_type': self.current_user_type
        }
    
    def start(self):
        """Start the authentication system"""
        self.display_main_menu()


# Function to initialize authentication menu
def initialize_auth():
    """Initialize and start authentication"""
    auth_menu = AuthenticationMenu()
    auth_menu.start()

"""
Setup script for Aspira database initialization
Run this once to set up the database and create tables
"""

import mysql.connector
from mysql.connector import Error


def setup_database():
    """Create database and tables"""
    
    try:
        # Connect to MySQL server
        connection = mysql.connector.connect(
            host='localhost',
            user='root',
            password=''  # Change this to your MySQL root password if needed
        )
        
        cursor = connection.cursor()
        
        # Create database
        cursor.execute("CREATE DATABASE IF NOT EXISTS aspira")
        print("✓ Database created successfully")
        
        # Use the database
        cursor.execute("USE aspira")
        
        # Create citizen table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS citizen (
                citizenId INT PRIMARY KEY AUTO_INCREMENT,
                fullName VARCHAR(255),
                phoneNumber VARCHAR(255) UNIQUE,
                idNumber VARCHAR(255),
                password VARCHAR(255),
                address VARCHAR(255)
            )
        """)
        print("✓ Citizen table created")
        
        # Create services table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS services (
                serviceId INT PRIMARY KEY AUTO_INCREMENT,
                serviceName VARCHAR(255)
            )
        """)
        print("✓ Services table created")
        
        # Create feedback table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS feedback (
                feedbackId INT PRIMARY KEY AUTO_INCREMENT,
                citizenId INT,
                serviceId INT,
                feedback VARCHAR(255),
                location VARCHAR(255),
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                frequency INT,
                upVotes INT DEFAULT 0,
                status VARCHAR(255) DEFAULT 'pending',
                FOREIGN KEY (citizenId) REFERENCES citizen(citizenId),
                FOREIGN KEY (serviceId) REFERENCES services(serviceId)
            )
        """)
        print("✓ Feedback table created")
        
        # Create comments table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS comments (
                commentId INT PRIMARY KEY AUTO_INCREMENT,
                feedbackId INT,
                comment VARCHAR(255),
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (feedbackId) REFERENCES feedback(feedbackId)
            )
        """)
        print("✓ Comments table created")
        
        # Create admin table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS admin (
                adminId INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(255) UNIQUE,
                password VARCHAR(255)
            )
        """)
        print("✓ Admin table created")
        
        # Insert sample admin (username: admin, password: admin123)
        import hashlib
        admin_password = hashlib.sha256('admin123'.encode()).hexdigest()
        cursor.execute(
            "INSERT IGNORE INTO admin (username, password) VALUES (%s, %s)",
            ('admin', admin_password)
        )
        print("✓ Sample admin created (username: admin, password: admin123)")
        
        connection.commit()
        cursor.close()
        connection.close()
        
        print("\n✓ Database setup completed successfully!")
        print("You can now run the application.")
        
    except Error as e:
        print(f"❌ Error: {e}")
        print("\nMake sure MySQL is running and accessible.")


if __name__ == "__main__":
    print("Setting up Aspira database...\n")
    setup_database()

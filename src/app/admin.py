# admin.py

import csv
from datetime import datetime

class AdminActions:
    """Handles all admin functionalities"""

    def __init__(self, db_connection, admin_id):
        self.db = db_connection
        self.admin_id = admin_id

    # ---------------------------------------------------
    # VIEW ALL FEEDBACK
    # ---------------------------------------------------
    def view_all_feedback(self):
        print("\n--- ALL CITIZEN FEEDBACK ---")

        query = """
            SELECT f.feedbackId, c.fullName, s.serviceName, f.location, 
                   f.frequency, f.date, f.feedback, f.upVotes, f.status
            FROM feedback f
            JOIN citizen c ON f.citizenId = c.citizenId
            JOIN services s ON f.serviceId = s.serviceId
            ORDER BY f.upVotes DESC
        """

        feedbacks = self.db.fetch_all(query)

        if not feedbacks:
            print("No feedback available.")
            input("\nPress Enter to return to the dashboard...")
            return

        for fb in feedbacks:
            print("\n-------------------------------")
            print(f"Feedback ID: {fb['feedbackId']}")
            print(f"Citizen: {fb['fullName']}")
            print(f"Service: {fb['serviceName']}")
            print(f"Location: {fb['location']}")
            print(f"Frequency: {fb['frequency']}")
            print(f"Date: {fb['date']}")
            print(f"Feedback: {fb['feedback']}")
            print(f"Upvotes: {fb['upVotes']}")
            print(f"Status: {fb['status']}")

        input("\nPress Enter to return to the dashboard...")

    # ---------------------------------------------------
    # UPDATE FEEDBACK STATUS 
    # ---------------------------------------------------
    def update_feedback_status(self):
        print("\n--- UPDATE FEEDBACK STATUS ---")

        feedbacks = self.db.fetch_all("""
            SELECT feedbackId, feedback, status
            FROM feedback
        """)

        if not feedbacks:
            print("No feedback available.")
            input("\nPress Enter to return to the dashboard...")
            return

        for fb in feedbacks:
            print(f"\nID: {fb['feedbackId']} | Status: {fb['status']}")
            print(f"Feedback: {fb['feedback']}")

        try:
            feedback_id = int(input("\nEnter Feedback ID to update: "))
        except ValueError:
            print("Invalid input!")
            input("\nPress Enter to return to the dashboard...")
            return

        print("\nChoose new status:")
        print("1. Pending")
        print("2. In-Progress")
        print("3. Resolved")
        print("4. Cancelled")

        status_choice = input("Select (1-4): ").strip()

        statuses = {
            "1": "Pending",
            "2": "In-Progress",
            "3": "Resolved",
            "4": "Cancelled"
        }

        if status_choice not in statuses:
            print("Invalid status!")
            input("\nPress Enter to return to the dashboard...")
            return

        update_query = """
            UPDATE feedback SET status = %s WHERE feedbackId = %s
        """
        self.db.execute_query(update_query, (statuses[status_choice], feedback_id))

        print("\n✓ Status updated successfully!")
        input("\nPress Enter to return to the dashboard...")

    # ---------------------------------------------------
    # VIEW AND RESPOND TO FEEDBACK 
    # ---------------------------------------------------
    def view_and_respond_feedback(self):
        print("\n--- VIEW AND RESPOND TO FEEDBACK ---")

        query = """
            SELECT f.feedbackId, c.fullName, s.serviceName, f.location, 
                   f.frequency, f.date, f.feedback, f.upVotes, f.status
            FROM feedback f
            JOIN citizen c ON f.citizenId = c.citizenId
            JOIN services s ON f.serviceId = s.serviceId
            ORDER BY f.upVotes DESC
        """

        feedbacks = self.db.fetch_all(query)

        if not feedbacks:
            print("No feedback available.")
            input("\nPress Enter to return to the dashboard...")
            return

        # Display all feedbacks
        for fb in feedbacks:
            print("\n-------------------------------")
            print(f"Feedback ID: {fb['feedbackId']}")
            print(f"Citizen: {fb['fullName']}")
            print(f"Service: {fb['serviceName']}")
            print(f"Feedback: {fb['feedback']}")
            print(f"Upvotes: {fb['upVotes']}")
            print(f"Status: {fb['status']}")

        try:
            feedback_id = int(input("\nEnter Feedback ID to respond: "))
        except ValueError:
            print("Invalid input!")
            input("\nPress Enter to return to the dashboard...")
            return

        # Verify feedback exists
        check_query = "SELECT feedbackId FROM feedback WHERE feedbackId = %s"
        exists = self.db.fetch_one(check_query, (feedback_id,))
        
        if not exists:
            print("Feedback ID not found!")
            input("\nPress Enter to return to the dashboard...")
            return

        print("\nChoose response status:")
        print("1. In-Progress")
        print("2. Solved")
        print("3. Cancelled")

        status_choice = input("Select (1-3): ").strip()

        statuses = {
            "1": "In-Progress",
            "2": "Solved",
            "3": "Cancelled"
        }

        if status_choice not in statuses:
            print("Invalid status!")
            input("\nPress Enter to return to the dashboard...")
            return

        # Get comment from admin
        comment = input("\nEnter your comment/response: ").strip()
        
        if not comment:
            print("Comment cannot be empty!")
            input("\nPress Enter to return to the dashboard...")
            return

        # Update feedback status and add response
        update_query = """
            UPDATE feedback 
            SET status = %s 
            WHERE feedbackId = %s
        """
        self.db.execute_query(update_query, (statuses[status_choice], feedback_id))

        # Insert admin response (assuming you have an admin_responses table)
        # If not, you might need to add a response column to feedback table
        response_query = """
            INSERT INTO admin_responses (feedbackId, adminId, response, responseDate)
            VALUES (%s, %s, %s, NOW())
        """
        try:
            self.db.execute_query(response_query, (feedback_id, self.admin_id, comment))
            print("\n✓ Response added successfully!")
        except:
            # If table doesn't exist, just update status
            print("\n✓ Status updated successfully!")
            print("Note: Response storage requires admin_responses table.")

        input("\nPress Enter to return to the dashboard...")

    # ---------------------------------------------------
    # VIEW FEEDBACK REPORT 
    # ---------------------------------------------------
    def view_feedback_report(self):
        print("\n--- FEEDBACK REPORT BY SERVICE ---")

        query = """
            SELECT s.serviceId, s.serviceName, COUNT(f.feedbackId) as totalFeedbacks,
                   SUM(f.upVotes) as totalUpvotes
            FROM services s
            LEFT JOIN feedback f ON s.serviceId = f.serviceId
            GROUP BY s.serviceId, s.serviceName
            ORDER BY totalUpvotes DESC
        """

        services_report = self.db.fetch_all(query)

        if not services_report:
            print("No feedback data available.")
            input("\nPress Enter to return to the dashboard...")
            return

        print("\n{:<5} {:<30} {:<15} {:<15}".format("ID", "Service Name", "Total Feedback", "Total Upvotes"))
        print("-" * 70)

        for service in services_report:
            print("{:<5} {:<30} {:<15} {:<15}".format(
                service['serviceId'],
                service['serviceName'],
                service['totalFeedbacks'],
                service['totalUpvotes'] or 0
            ))

        print("\n" + "=" * 70)
        print("Options:")
        print("1. View feedbacks for a specific service")
        print("2. Download full report")
        print("3. Return to dashboard")
        
        choice = input("\nEnter your choice (1-3): ").strip()

        if choice == "1":
            self.view_service_feedback_report()
        elif choice == "2":
            self.download_feedback_report()
        elif choice == "3":
            return
        else:
            print("Invalid choice!")
            input("\nPress Enter to return to the dashboard...")

    # ---------------------------------------------------
    # SERVICE-SPECIFIC FEEDBACK REPORT 
    # ---------------------------------------------------
    def view_service_feedback_report(self):
        print("\n--- SERVICE-SPECIFIC FEEDBACK REPORT ---")

        try:
            service_id = int(input("Enter Service ID: "))
        except ValueError:
            print("Invalid input!")
            input("\nPress Enter to return to the dashboard...")
            return

        # Get service name
        service_query = "SELECT serviceName FROM services WHERE serviceId = %s"
        service = self.db.fetch_one(service_query, (service_id,))

        if not service:
            print("Service not found!")
            input("\nPress Enter to return to the dashboard...")
            return

        print(f"\n--- Feedback for: {service['serviceName']} ---")

        # Get all feedback for this service
        query = """
            SELECT f.feedbackId, c.fullName, f.location, f.frequency, 
                   f.date, f.feedback, f.upVotes, f.status
            FROM feedback f
            JOIN citizen c ON f.citizenId = c.citizenId
            WHERE f.serviceId = %s
            ORDER BY f.upVotes DESC
        """

        feedbacks = self.db.fetch_all(query, (service_id,))

        if not feedbacks:
            print("No feedback found for this service.")
            input("\nPress Enter to return to the dashboard...")
            return

        for fb in feedbacks:
            print("\n" + "-" * 50)
            print(f"Feedback ID: {fb['feedbackId']}")
            print(f"Citizen: {fb['fullName']}")
            print(f"Location: {fb['location']}")
            print(f"Frequency: {fb['frequency']}")
            print(f"Date: {fb['date']}")
            print(f"Feedback: {fb['feedback']}")
            print(f"Upvotes: {fb['upVotes']}")
            print(f"Status: {fb['status']}")

        print("\n" + "=" * 50)
        download = input("\nDownload this report? (y/n): ").strip().lower()
        
        if download == 'y':
            self.download_service_report(service_id, service['serviceName'])

        input("\nPress Enter to return to the dashboard...")

    # ---------------------------------------------------
    # DOWNLOAD FULL FEEDBACK REPORT 
    # ---------------------------------------------------
    def download_feedback_report(self):
        print("\n--- DOWNLOADING FULL REPORT ---")

        query = """
            SELECT f.feedbackId, c.fullName, s.serviceName, f.location, 
                   f.frequency, f.date, f.feedback, f.upVotes, f.status
            FROM feedback f
            JOIN citizen c ON f.citizenId = c.citizenId
            JOIN services s ON f.serviceId = s.serviceId
            ORDER BY s.serviceName, f.upVotes DESC
        """

        feedbacks = self.db.fetch_all(query)

        if not feedbacks:
            print("No feedback data to download.")
            input("\nPress Enter to return to the dashboard...")
            return

        # Generate filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"feedback_report_{timestamp}.csv"

        try:
            with open(filename, 'w', newline='', encoding='utf-8') as file:
                writer = csv.writer(file)
                
                # Write header
                writer.writerow([
                    'Feedback ID', 'Citizen Name', 'Service', 'Location',
                    'Frequency', 'Date', 'Feedback', 'Upvotes', 'Status'
                ])
                
                # Write data
                for fb in feedbacks:
                    writer.writerow([
                        fb['feedbackId'],
                        fb['fullName'],
                        fb['serviceName'],
                        fb['location'],
                        fb['frequency'],
                        fb['date'],
                        fb['feedback'],
                        fb['upVotes'],
                        fb['status']
                    ])
            
            print(f"\n✓ Report downloaded successfully: {filename}")
        except Exception as e:
            print(f"\n✗ Error downloading report: {str(e)}")

        input("\nPress Enter to return to the dashboard...")

    # ---------------------------------------------------
    # DOWNLOAD SERVICE-SPECIFIC REPORT 
    # ---------------------------------------------------
    def download_service_report(self, service_id, service_name):
        query = """
            SELECT f.feedbackId, c.fullName, f.location, f.frequency, 
                   f.date, f.feedback, f.upVotes, f.status
            FROM feedback f
            JOIN citizen c ON f.citizenId = c.citizenId
            WHERE f.serviceId = %s
            ORDER BY f.upVotes DESC
        """

        feedbacks = self.db.fetch_all(query, (service_id,))

        if not feedbacks:
            print("No feedback data to download.")
            return

        # Generate filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_service_name = service_name.replace(' ', '').replace('/', '')
        filename = f"feedback_{safe_service_name}_{timestamp}.csv"

        try:
            with open(filename, 'w', newline='', encoding='utf-8') as file:
                writer = csv.writer(file)
                
                # Write header
                writer.writerow([
                    'Feedback ID', 'Citizen Name', 'Location', 'Frequency',
                    'Date', 'Feedback', 'Upvotes', 'Status'
                ])
                
                # Write data
                for fb in feedbacks:
                    writer.writerow([
                        fb['feedbackId'],
                        fb['fullName'],
                        fb['location'],
                        fb['frequency'],
                        fb['date'],
                        fb['feedback'],
                        fb['upVotes'],
                        fb['status']
                    ])
            
            print(f"\n✓ Report downloaded successfully: {filename}")
        except Exception as e:
            print(f"\n✗ Error downloading report: {str(e)}")

    # ---------------------------------------------------
    # VIEW SERVICES
    # ---------------------------------------------------
    def view_services(self):
        print("\n--- AVAILABLE SERVICES ---")

        services = self.db.fetch_all("SELECT serviceId, serviceName FROM services")

        if not services:
            print("No services found.")
            input("\nPress Enter to return to the dashboard...")
            return

        for s in services:
            print(f"{s['serviceId']}. {s['serviceName']}")

        input("\nPress Enter to return to the dashboard...")

    # ---------------------------------------------------
    # ADD NEW SERVICE
    # ---------------------------------------------------
    def add_service(self):
        print("\n--- ADD NEW SERVICE ---")
        name = input("Enter new service name: ").strip()

        if not name:
            print("Service name cannot be empty!")
            input("\nPress Enter to return to the dashboard...")
            return

        query = "INSERT INTO services (serviceName) VALUES (%s)"

        cursor = self.db.execute_query(query, (name,))
        if cursor:
            print("✓ Service added successfully!")
        else:
            print("✗ Failed to add service.")

        input("\nPress Enter to return to the dashboard...")

# ======================================================
# ADMIN DASHBOARD 
# ======================================================

def admin_dashboard(db_connection, admin_id):
    admin_actions = AdminActions(db_connection, admin_id)

    while True:
        print("\n" + "=" * 50)
        print("ADMIN DASHBOARD")
        print("=" * 50)
        print("1. View All Feedback")
        print("2. Update Feedback Status")
        print("3. View and Respond to Feedback")
        print("4. View Feedback Report")
        print("5. View Services")
        print("6. Add Service")
        print("7. Logout")
        print("=" * 50)

        choice = input("Enter your choice: ").strip()

        if choice == "1":
            admin_actions.view_all_feedback()
        elif choice == "2":
            admin_actions.update_feedback_status()
        elif choice == "3":
            admin_actions.view_and_respond_feedback()
        elif choice == "4":
            admin_actions.view_feedback_report()
        elif choice == "5":
            admin_actions.view_services()
        elif choice == "6":
            admin_actions.add_service()
        elif choice == "7":
            print("\nLogging out...")
            break
        else:
            print("Invalid choice! Try again.")
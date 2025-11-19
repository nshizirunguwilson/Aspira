# admin.py

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

        status_choice = input("Select (1-3): ").strip()

        statuses = {
            "1": "Pending",
            "2": "In-Progress",
            "3": "Resolved"
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
        print("3. View Services")
        print("4. Add Service")
        print("5. Logout")
        print("=" * 50)

        choice = input("Enter your choice: ").strip()

        if choice == "1":
            admin_actions.view_all_feedback()
        elif choice == "2":
            admin_actions.update_feedback_status()
        elif choice == "3":
            admin_actions.view_services()
        elif choice == "4":
            admin_actions.add_service()
        elif choice == "5":
            print("\nLogging out...")
            break
        else:
            print("Invalid choice! Try again.")
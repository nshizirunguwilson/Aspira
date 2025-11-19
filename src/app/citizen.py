# citizen.py
from datetime import datetime

class CitizenFeedback:
    """Handles feedback actions for logged-in citizens"""

    def __init__(self, db_connection, citizen_id):
        self.db = db_connection
        self.citizen_id = citizen_id

    # -------------------------------------------
    # PROVIDE FEEDBACK
    # -------------------------------------------
    def provide_feedback(self):
        print("\n--- PROVIDE FEEDBACK ---")

        # Fetch services from database
        services = self.db.fetch_all("SELECT serviceId, serviceName FROM services")
        if not services:
            print("No services available.")
            return

        print("\nAvailable Services:")
        for s in services:
            print(f"{s['serviceId']}. {s['serviceName']}")

        try:
            service_id = int(input("\nEnter service ID: "))
        except:
            print("Invalid input!")
            return

        location = input("Location of the issue: ").strip()
        frequency = input("How many time has this occured ").strip()
        feedback = input("Describe the issue: ").strip()

        # Auto date
        date= datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # Insert into database
        query = """
            INSERT INTO feedback
            (citizenId, serviceId, location, frequency, date, feedback, upVotes, status)
            VALUES (%s, %s, %s, %s, %s, %s, 0, 'Pending')
        """

        params = (self.citizen_id, service_id, location, frequency, date, feedback)
        cursor = self.db.execute_query(query, params)

        if cursor:
            print("\n✓ Feedback submitted successfully!")
        else:
            print("✗ Failed to submit feedback.")

   
# ==================================================
# CITIZEN DASHBOARD (called after login)
# ==================================================

def citizen_dashboard(db_connection, citizen_id):
    """Menu displayed AFTER successful citizen login"""

    feedback_system = CitizenFeedback(db_connection, citizen_id)

    while True:
        print("\n" + "="*50)
        print("CITIZEN DASHBOARD")
        print("="*50)
        print("1. Provide Feedback")
        print("2. View & Upvote Feedback")
        print("3. View Feedback Progress")
        print("4. Logout")
        print("="*50)

        choice = input("Enter your choice: ").strip()

        if choice == "1":
            feedback_system.provide_feedback()
        elif choice == "2":
            feedback_system.view_and_upvote()
        elif choice == "3":
            feedback_system.view_progress()
        elif choice == "4":
            print("\nLogging out...")
            break
        else:
            print("Invalid choice! Try again.")

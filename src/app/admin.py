# admin.py
from datetime import datetime
import csv

class AdminActions:
    """Handles all admin functionalities"""

    def __init__(self, db_connection, admin_id):
        self.db = db_connection
        self.admin_id = admin_id

    # ---------------------------------------------------
    # VIEW FEEDBACK REPORT
    # ---------------------------------------------------
    def view_feedback_report(self):
        print("\n--- FEEDBACK REPORT ---")
        services = self.db.fetch_all("SELECT serviceId, serviceName FROM services")
        if not services:
            print("No services found.")
            input("\nPress Enter to return to the dashboard...")
            return

        # Calculate total feedbacks and upvotes per service
        service_stats = []
        for s in services:
            stats = self.db.fetch_one(
                "SELECT COUNT(*) as total_feedbacks, SUM(upVotes) as total_upvotes FROM feedback WHERE serviceId = %s",
                (s['serviceId'],)
            )
            total_feedbacks = stats['total_feedbacks'] or 0
            total_upvotes = stats['total_upvotes'] or 0
            service_stats.append({
                'serviceId': s['serviceId'],
                'serviceName': s['serviceName'],
                'total_feedbacks': total_feedbacks,
                'total_upvotes': total_upvotes
            })

        # Sort services by total_upvotes descending
        service_stats.sort(key=lambda x: x['total_upvotes'], reverse=True)

        print("\nOverall Feedback Report (sorted by total upvotes):")
        print(f"{'Service ID':10} | {'Service Name':25} | {'Total Feedbacks':15} | {'Total Upvotes'}")
        print("-" * 70)
        for s in service_stats:
            print(f"{s['serviceId']:<10} | {s['serviceName']:25} | {s['total_feedbacks']:<15} | {s['total_upvotes']}")

        # Options for admin
        print("\nOptions:")
        print("Enter a service ID to view detailed feedback for that service")
        print("Enter 'D' to download the overall report")
        print("Press Enter to skip")
        choice = input("Your choice: ").strip()

        # Download overall report
        if choice.upper() == 'D':
            filename = f"feedback_overall_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            with open(filename, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(["Service ID", "Service Name", "Total Feedbacks", "Total Upvotes"])
                for s in service_stats:
                    writer.writerow([s['serviceId'], s['serviceName'], s['total_feedbacks'], s['total_upvotes']])
            print(f"✓ Overall report downloaded as {filename}")
            input("\nPress Enter to return to the dashboard...")
            return

        elif choice:
            try:
                service_id = int(choice)
            except ValueError:
                print("Invalid service ID!")
                input("\nPress Enter to return to the dashboard...")
                return

            detailed_feedbacks = self.db.fetch_all("""
                SELECT f.feedbackId, f.citizenId, f.feedback, f.location, f.frequency, f.date, f.status, f.upVotes
                FROM feedback f
                WHERE f.serviceId = %s
                ORDER BY f.upVotes DESC
            """, (service_id,))

            if not detailed_feedbacks:
                print("No feedback found for this service.")
                input("\nPress Enter to return to the dashboard...")
                return

            for fb in detailed_feedbacks:
                print("\n-----------------------------")
                print(f"Feedback ID: {fb['feedbackId']}")
                print(f"Citizen ID: {fb['citizenId']}")
                print(f"Description: {fb['feedback']}")
                print(f"Location: {fb['location']}")
                print(f"Frequency: {fb['frequency']}")
                print(f"Timestamp: {fb['date']}")
                print(f"Status: {fb['status']}")
                print(f"Upvotes: {fb['upVotes']}")

            # Option to download service report
            download = input("\nDownload this service report? (y/n): ").strip().lower()
            if download == 'y':
                filename = f"feedback_service_{service_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
                with open(filename, 'w', newline='', encoding='utf-8') as f:
                    writer = csv.writer(f)
                    writer.writerow(["Feedback ID", "Citizen ID", "Description", "Location", "Frequency", "Timestamp", "Status", "Upvotes"])
                    for fb in detailed_feedbacks:
                        writer.writerow([fb['feedbackId'], fb['citizenId'], fb['feedback'], fb['location'], fb['frequency'], fb['date'], fb['status'], fb['upVotes']])
                print(f"✓ Service report downloaded as {filename}")
            input("\nPress Enter to return to the dashboard...")

    
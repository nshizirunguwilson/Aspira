"""
Main entry point for Aspira - Public Service Feedback Tracker
"""

from auth import AuthenticationMenu
from citizen import citizen_dashboard



def main():
    """Main function to start the application"""
    try:
        auth_menu = AuthenticationMenu()
        auth_menu.start()
        current_user = auth_menu.get_current_user()

        # Open citizen menu only if logged in as a citizen
        if current_user["user_type"] == "citizen":
            citizen = citizen_dashboard(current_user["user_id"])
            citizen.start_menu()
    except KeyboardInterrupt:
        print("\n\n✓ Application interrupted by user. Goodbye!")
    except Exception as e:
        print(f"\n✗ An unexpected error occurred: {e}")


if __name__ == "__main__":
    main()

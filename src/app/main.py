"""
Main entry point for Aspira - Public Service Feedback Tracker
"""

from auth import AuthenticationMenu


def main():
    """Main function to start the application"""
    try:
        auth_menu = AuthenticationMenu()
        auth_menu.start()

    except KeyboardInterrupt:
        print("\n\n✓ Application interrupted by user. Goodbye!")
    except Exception as e:
        print(f"\n✗ An unexpected error occurred: {e}")


if __name__ == "__main__":
    main()

# Movie Booking Website

A full-stack Movie Booking Website built with **ReactJS** for the frontend and **Django REST Framework** for the backend. This application allows users to browse movies, view showtimes, select seats, and securely book tickets online.

## Features

- Browse and search movies
- View showtimes and movie details
- Select seats for chosen shows
- Secure payment integration with Razorpay
- Booking history and confirmation

## Technology Stack

- Frontend: ReactJS, Axios, CSS
- Backend: Django, Django REST Framework
- Payment Gateway: Razorpay
- Database: SQLite (default) or configurable for other DBs


## Setup and Installation

### Backend

1. Navigate to the backend directory:
    ```
    cd movie_apis
    ```
2. Apply migrations and start the Django server:
    ```
    python manage.py migrate
    python manage.py runserver
    ```

### Frontend

1. Navigate to the frontend directory:
    ```
    cd frontend/movie_booking
    ```
2. Install dependencies:
    ```
    npm install
    ```
3. Start the React development server:
    ```
    npm run dev
    ```

---

## Usage

- Open the React app in your browser (usually at `http://localhost:3000`).
- Browse or search movies.
- Select a movie, pick showtimes and seats.
- Proceed to payment via Razorpay integration.
- After successful payment, booking confirmation is provided.

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests.

## License

This project is open source and available under the MIT License.

---

## Contact

For questions or support, please reach out at [madhuban211998@gmail.com].

from langchain.tools import tool
from .models import Movie, Show, Booking
from django.utils import timezone
from datetime import datetime

@tool
def fetch_movies(query: str):
    """Returns the all movies, theatre name, show dates & show timings from the database."""
    movies = Movie.objects.select_related('currentshow__theatre').values(
                    'name', 
                    'currentshow__theatre__name', 
                    'currentshow__date',
                    'currentshow__time'
                )
    formatted_movies = []
    for movie in movies:
        formatted_date = movie['currentshow__date'].strftime('%d %b %Y')
        readable_time = movie['currentshow__time'].strftime('%I:%M %p')  # 02:30 PM
        formatted_movies.append({
            'name': movie['name'],
            'theatre': movie['currentshow__theatre__name'],
            'date': formatted_date,
            'time': readable_time
        })
    # print("MOVIES: ",movies)
    # print("FORMATTED MOVIES: ",formatted_movies[0])
    return formatted_movies

# @tool
# def book_movie_tickets(movie_name: str, theatre_name: str, show_time: str, ticket_count: int):
#     """
#     Use this tool to book tickets. 
#     It requires the movie name, theatre name, show time (e.g., '06:00 PM'), and number of tickets.
#     """
#     try:
#         # 1. Logic to find the specific movie and theatre in your DB
#         # This is a simplified example of how you might save the booking
#         booking = Booking.objects.create(
#             movie_name=movie_name,
#             theatre=theatre_name,
#             time=show_time,
#             count=ticket_count
#         )
        
#         return f"Successfully booked {ticket_count} tickets for '{movie_name}' at {theatre_name} for the {show_time} show."
#     except Exception as e:
#         return f"Error processing booking: {str(e)}"


# tools = [fetch_movies, book_movie_tickets]
tools = [fetch_movies]

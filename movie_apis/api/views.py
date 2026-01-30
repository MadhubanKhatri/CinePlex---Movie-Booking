from .serializers import MovieSerializer,ShowSerializer,BookingSerializer, UserSerializer
from .models import Movie,Show,Booking
from rest_framework.generics import ListAPIView, RetrieveAPIView,CreateAPIView
from django.contrib.auth.models import User
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from django.conf import settings
import razorpay
# from google import genai
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
import json
from meta_ai_api import MetaAI
from .ai_agent import agent, memory
from dotenv import load_dotenv
load_dotenv()
# Razorpay client initialization
razorpay_client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)

class MoviesListView(ListAPIView):
    queryset = Movie.objects.all().order_by('-created_at')
    serializer_class = MovieSerializer

class MovieDetailView(RetrieveAPIView):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer

class ShowsListView(ListAPIView):
    queryset = Show.objects.all()
    serializer_class = ShowSerializer


class SeatBooking(CreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

    def perform_create(self, serializer):
        serializer.save()

class UserCreateView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        serializer.save()

class UserListView(ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserDetailView(RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'email'



class CustomAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})  

        print("request.data: ",request.data)  
        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data['user']
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
            'token': token.key,
            'user_id': user.id,
            'email': user.email,
            'username': user.username
            })
            
        except ValidationError as e:
            # Custom validation response
            return Response({
                'error': 'Invalid login credentials.',
                'details': e.detail
            }, status=status.HTTP_400_BAD_REQUEST)


class BookedSeatsAPIView(APIView):
    def get(self, request):
        # Get query params
        movie_id = request.query_params.get('movie_id')
        theatre_id = request.query_params.get('theatre_id')
        show_date = request.query_params.get('date')
        show_time = request.query_params.get('time')

        # Validate parameters
        if not (movie_id and theatre_id and show_date and show_time):
            return Response(
                {'error': 'Please provide movie_id, theatre_id, date, and time'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get the show matching the criteria
        show = Show.objects.filter(
            movie_id=movie_id,
            theatre_id=theatre_id,
            date=show_date,
            time=show_time
        ).first()

        if not show:
            return Response({'error': 'Show not found'}, status=status.HTTP_404_NOT_FOUND)

        # Get bookings for that show
        bookings = Booking.objects.filter(show=show)

        # Collect all booked seats
        booked_seats = []
        for booking in bookings:
            seats = booking.seats.split(',')
            booked_seats.extend([seat.strip() for seat in seats if seat.strip()])

        # Remove duplicates
        booked_seats = list(set(booked_seats))

        return Response({'booked_seats': booked_seats}, status=status.HTTP_200_OK)



class BookingHistoryApi(APIView):
    def get(self, request):
        email = request.query_params.get('email')
        user = User.objects.get(email=email)
        bookings = Booking.objects.filter(user=user).select_related('show__movie')

        booking_history = []
        for booking in bookings:
            booking_history.append({
                'id': booking.id,
                'movie': booking.show.movie.name,
                'theatre': booking.show.theatre.name,
                'date': booking.show.date,
                'time': booking.show.time,
                'seats': booking.seats,
                'created_at': booking.created_at,
                'amount': booking.amount,
                'status': booking.status
            })

        return Response(booking_history, status=status.HTTP_200_OK)


class CreateRazorpayOrderAPIView(APIView):
    """
    API to create a Razorpay order.
    Expects: amount (in rupees), currency (default 'INR'), receipt (optional)
    """
    def post(self, request):
        amount = request.data.get('amount')
        currency = request.data.get('currency', 'INR')
        receipt = request.data.get('receipt', None)
        
        if not amount:
            return Response({'error': 'Amount is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            # Razorpay expects amount in paise
            order_data = {
                'amount': int(amount),
                'currency': currency,
                'payment_capture': 1,
            }
            if receipt:
                order_data['receipt'] = receipt
            order = razorpay_client.order.create(data=order_data)
            return Response({'order': order}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def metaai_recommend(request):
    user = request.user
    
    # Get User History
    bookings = Booking.objects.select_related('movie')
    booked_ids = bookings.values_list('movie_id', flat=True)
    
    history_str = ', '.join([f"{b.movie.name} ({b.movie.genre})" for b in bookings[:10]])

    # Get Candidates (Unseen movies from YOUR DB)
    candidates = Movie.objects.exclude(id__in=booked_ids).values('id', 'name', 'genre')[:50]
    
    if not candidates:
        return Response({"message": "No new movies to recommend!"})

    # Format candidates for the prompt
    candidates_str = "\n".join([f"ID: {m['id']} | Title: {m['name']} | Genre: {m['genre']}" for m in candidates])

    # Construct the Prompt with strict constraints
    prompt = f"""
    ROLE: You are a movie recommendation engine for a streaming app.
    
    USER HISTORY (Movies they liked):
    {history_str}

    AVAILABLE INVENTORY (You MUST pick from this list ONLY):
    {candidates_str}

    TASK:
    Select 3 movies from the "AVAILABLE INVENTORY" that best match the user's history styles/genres.
    
    OUTPUT FORMAT:
    Return a strict JSON array of objects. include the exact database ID from the list.
    Example: [{{"id": 12, "title": "Movie Name", "reason": "Because you liked X..."}}]
    """
    

    meta_ai = MetaAI()
    response = meta_ai.prompt(message=prompt)
    
    # client = genai.Client()
    # response = client.models.generate_content(
    # model="gemini-2.5-flash-lite", contents=prompt, config={
    #         'response_mime_type': 'application/json'
    #     })  
    try:
        # recs_data = json.loads(response.text)
        recs_data = json.loads(response['message'])
        
        # Verify & Fetch (Optional but Recommended)
        rec_ids = [item['id'] for item in recs_data]
        recommended_movies = Movie.objects.filter(id__in=rec_ids)
        
        # serialize `recommended_movies` using your Serializer
        serializer = MovieSerializer(recommended_movies, many=True, context={'request': request})
        return Response(serializer.data)

    except Exception as e:
        print(f"Error parsing Gemini response: {e}")
        return Response({"error": "Recommendation failed"}, status=500)
    



@api_view(['POST'])
def ai_agent_test(request):
    user_query = request.data.get('message', '')
    
    inputs = {
        "messages": memory.messages + [
            ("user", user_query)
        ]
    }

    result = agent.invoke(inputs)
    memory.add_user_message(user_query)
    memory.add_ai_message(result["messages"][-1].content)
    return Response({"reply": result["messages"][-1].content})
 

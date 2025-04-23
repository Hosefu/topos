from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from desks.models import Desk, Area
from reservations.models import Reservation, ReservationStatus


class OfficeStatsView(APIView):
    """Представление для получения статистики по офису."""
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Обработка GET-запроса для получения статистики."""
        now = timezone.now()
        today = now.date()
        
        # Статистика по столам
        total_desks = Desk.objects.count()
        available_desks = Desk.objects.filter(status='available').count()
        reserved_desks = Desk.objects.filter(status='reserved').count()
        occupied_desks = Desk.objects.filter(status='occupied').count()
        maintenance_desks = Desk.objects.filter(status='maintenance').count()
        
        # Статистика по зонам
        areas = Area.objects.all()
        area_stats = []
        
        for area in areas:
            area_desks = Desk.objects.filter(area=area)
            area_stats.append({
                'id': area.id,
                'name': area.name,
                'total_desks': area_desks.count(),
                'available_desks': area_desks.filter(status='available').count(),
                'occupied_desks': area_desks.filter(status__in=['occupied', 'reserved']).count()
            })
        
        # Статистика по бронированиям
        today_reservations = Reservation.objects.filter(
            start_time__date=today,
            status=ReservationStatus.ACTIVE
        ).count()
        
        active_reservations = Reservation.objects.filter(
            start_time__lte=now,
            end_time__gte=now,
            status=ReservationStatus.ACTIVE
        ).count()
        
        upcoming_reservations = Reservation.objects.filter(
            start_time__date=today,
            start_time__gt=now,
            status=ReservationStatus.ACTIVE
        ).count()
        
        # Статистика по пользователю
        user_reservations_today = Reservation.objects.filter(
            user=request.user,
            start_time__date=today
        ).count()
        
        user_active_reservation = Reservation.objects.filter(
            user=request.user,
            start_time__lte=now,
            end_time__gte=now,
            status=ReservationStatus.ACTIVE
        ).exists()
        
        # Формируем ответ
        data = {
            'desk_stats': {
                'total': total_desks,
                'available': available_desks,
                'reserved': reserved_desks,
                'occupied': occupied_desks,
                'maintenance': maintenance_desks
            },
            'area_stats': area_stats,
            'reservation_stats': {
                'today_total': today_reservations,
                'active_now': active_reservations,
                'upcoming_today': upcoming_reservations
            },
            'user_stats': {
                'reservations_today': user_reservations_today,
                'has_active_reservation': user_active_reservation
            },
            'timestamp': now.isoformat()
        }
        
        return Response(data)
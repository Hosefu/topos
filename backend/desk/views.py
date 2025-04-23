from django.utils import timezone
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Area, Desk, DeskStatus
from .serializers import (
    AreaSerializer, 
    DeskSerializer, 
    DeskDetailSerializer,
    DeskUpdateSerializer
)
from reservations.models import Reservation


class AreaViewSet(viewsets.ModelViewSet):
    """ViewSet для работы с зонами офиса."""
    
    queryset = Area.objects.all()
    serializer_class = AreaSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['floor']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'floor']
    ordering = ['floor', 'name']


class DeskViewSet(viewsets.ModelViewSet):
    """ViewSet для работы с рабочими местами."""
    
    queryset = Desk.objects.all()
    serializer_class = DeskSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['area', 'status', 'desk_type']
    search_fields = ['name', 'desk_number', 'notes']
    ordering_fields = ['name', 'desk_number', 'status']
    ordering = ['desk_number']
    
    def get_serializer_class(self):
        """Выбор сериализатора в зависимости от действия."""
        if self.action == 'retrieve':
            return DeskDetailSerializer
        if self.action in ['update', 'partial_update']:
            return DeskUpdateSerializer
        return self.serializer_class
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        """Получить список доступных столов на указанную дату."""
        date_str = request.query_params.get('date')
        time_from_str = request.query_params.get('time_from')
        time_to_str = request.query_params.get('time_to')
        
        # Если даты нет, используем текущую
        if not date_str:
            date = timezone.now().date()
        else:
            try:
                date = timezone.datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {"error": "Неверный формат даты. Используйте YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Установка времени по умолчанию (весь рабочий день)
        if not time_from_str:
            time_from = timezone.datetime.combine(date, timezone.datetime.min.time())
            time_from = time_from.replace(hour=9, minute=0)  # 9:00
        else:
            try:
                hours, minutes = map(int, time_from_str.split(':'))
                time_from = timezone.datetime.combine(date, timezone.datetime.min.time())
                time_from = time_from.replace(hour=hours, minute=minutes)
            except (ValueError, TypeError):
                return Response(
                    {"error": "Неверный формат времени. Используйте HH:MM."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        if not time_to_str:
            time_to = timezone.datetime.combine(date, timezone.datetime.min.time())
            time_to = time_to.replace(hour=18, minute=0)  # 18:00
        else:
            try:
                hours, minutes = map(int, time_to_str.split(':'))
                time_to = timezone.datetime.combine(date, timezone.datetime.min.time())
                time_to = time_to.replace(hour=hours, minute=minutes)
            except (ValueError, TypeError):
                return Response(
                    {"error": "Неверный формат времени. Используйте HH:MM."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Проверим, что время_до > время_от
        if time_to <= time_from:
            return Response(
                {"error": "Время окончания должно быть позже времени начала."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Находим занятые столы в указанный период времени
        occupied_desk_ids = Reservation.objects.filter(
            status='active',
            start_time__lt=time_to,
            end_time__gt=time_from
        ).values_list('desk_id', flat=True)
        
        # Получаем доступные столы
        available_desks = Desk.objects.exclude(
            id__in=occupied_desk_ids
        ).exclude(
            status__in=[DeskStatus.MAINTENANCE, DeskStatus.OCCUPIED]
        )
        
        # Применяем фильтры, если они есть
        area = request.query_params.get('area')
        if area:
            available_desks = available_desks.filter(area=area)
        
        desk_type = request.query_params.get('desk_type')
        if desk_type:
            available_desks = available_desks.filter(desk_type=desk_type)
        
        # Сериализуем результат
        serializer = self.get_serializer(available_desks, many=True)
        return Response(serializer.data)
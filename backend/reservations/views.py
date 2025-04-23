from django.utils import timezone
from django.db.models import Q
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Reservation, ReservationStatus
from .serializers import (
    ReservationSerializer,
    ReservationCreateSerializer,
    ReservationUpdateSerializer
)


class ReservationViewSet(viewsets.ModelViewSet):
    """ViewSet для работы с бронированиями."""
    
    serializer_class = ReservationSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['desk', 'status', 'reservation_type', 'recurrence_pattern']
    search_fields = ['notes']
    ordering_fields = ['start_time', 'end_time', 'created_at']
    ordering = ['-start_time']
    
    def get_queryset(self):
        """Получение списка бронирований в зависимости от пользователя."""
        user = self.request.user
        if user.is_staff:
            # Администраторы видят все бронирования
            return Reservation.objects.all()
        # Обычные пользователи видят только свои бронирования
        return Reservation.objects.filter(user=user)
    
    def get_serializer_class(self):
        """Выбор сериализатора в зависимости от действия."""
        if self.action in ['create']:
            return ReservationCreateSerializer
        if self.action in ['update', 'partial_update']:
            return ReservationUpdateSerializer
        return self.serializer_class
    
    def create(self, request, *args, **kwargs):
        """Создание бронирования."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    @action(detail=True, methods=['post'])
    def check_in(self, request, pk=None):
        """Отметка о прибытии."""
        reservation = self.get_object()
        success = reservation.check_in()
        
        if success:
            return Response({'status': 'checked-in'})
        return Response(
            {'error': 'Невозможно отметиться. Бронирование не активно.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Отмена бронирования."""
        reservation = self.get_object()
        success = reservation.cancel()
        
        if success:
            return Response({'status': 'cancelled'})
        return Response(
            {'error': 'Невозможно отменить. Бронирование не активно.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Получить текущее активное бронирование пользователя."""
        now = timezone.now()
        
        current_reservation = Reservation.objects.filter(
            user=request.user,
            status=ReservationStatus.ACTIVE,
            start_time__lte=now,
            end_time__gte=now
        ).first()
        
        if current_reservation:
            serializer = self.get_serializer(current_reservation)
            return Response(serializer.data)
        return Response(
            {'message': 'Нет активных бронирований в данный момент.'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Получить предстоящие бронирования пользователя."""
        now = timezone.now()
        
        upcoming_reservations = Reservation.objects.filter(
            user=request.user,
            status=ReservationStatus.ACTIVE,
            start_time__gt=now
        ).order_by('start_time')
        
        page = self.paginate_queryset(upcoming_reservations)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(upcoming_reservations, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def calendar(self, request):
        """Получить бронирования для календаря."""
        # Получаем параметры фильтрации
        start_date = request.query_params.get('start')
        end_date = request.query_params.get('end')
        desk_id = request.query_params.get('desk')
        
        # Фильтр по умолчанию - активные бронирования текущего пользователя
        queryset = Reservation.objects.filter(status=ReservationStatus.ACTIVE)
        
        # Если пользователь администратор, может видеть все бронирования
        if not request.user.is_staff:
            queryset = queryset.filter(user=request.user)
        
        # Применяем фильтры дат, если они указаны
        if start_date:
            try:
                start_date = timezone.datetime.fromisoformat(start_date)
                queryset = queryset.filter(end_time__gte=start_date)
            except ValueError:
                pass
        
        if end_date:
            try:
                end_date = timezone.datetime.fromisoformat(end_date)
                queryset = queryset.filter(start_time__lte=end_date)
            except ValueError:
                pass
        
        # Фильтр по столу
        if desk_id:
            queryset = queryset.filter(desk_id=desk_id)
        
        # Сериализуем данные
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
from rest_framework import serializers
from .models import Area, Desk


class AreaSerializer(serializers.ModelSerializer):
    """Сериализатор для зон офиса."""
    
    class Meta:
        model = Area
        fields = ['id', 'name', 'description', 'floor']


class DeskSerializer(serializers.ModelSerializer):
    """Сериализатор для рабочих мест."""
    
    area_name = serializers.ReadOnlyField(source='area.name')
    
    class Meta:
        model = Desk
        fields = [
            'id', 'name', 'desk_number', 'area', 'area_name',
            'x_coordinate', 'y_coordinate', 'status', 'desk_type',
            'features', 'notes'
        ]


class DeskDetailSerializer(serializers.ModelSerializer):
    """Детальный сериализатор для рабочих мест."""
    
    area = AreaSerializer(read_only=True)
    current_reservation = serializers.SerializerMethodField()
    
    class Meta:
        model = Desk
        fields = [
            'id', 'name', 'desk_number', 'area',
            'x_coordinate', 'y_coordinate', 'status', 'desk_type',
            'features', 'notes', 'current_reservation'
        ]
    
    def get_current_reservation(self, obj):
        """Получить текущее бронирование стола."""
        from reservations.models import Reservation
        from reservations.serializers import ReservationSerializer
        
        # Получаем текущее бронирование для стола
        from django.utils import timezone
        now = timezone.now()
        
        current_reservation = Reservation.objects.filter(
            desk=obj,
            start_time__lte=now,
            end_time__gte=now,
            status='active'
        ).first()
        
        if current_reservation:
            return ReservationSerializer(current_reservation).data
        
        # Проверяем будущее бронирование
        future_reservation = Reservation.objects.filter(
            desk=obj,
            start_time__gt=now,
            status='active'
        ).order_by('start_time').first()
        
        if future_reservation:
            return ReservationSerializer(future_reservation).data
        
        return None


class DeskUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для обновления рабочих мест."""
    
    class Meta:
        model = Desk
        fields = ['status', 'notes']
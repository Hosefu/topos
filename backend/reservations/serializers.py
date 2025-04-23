from rest_framework import serializers
from django.utils import timezone
from .models import Reservation, ReservationStatus, ReservationType, RecurrencePattern
from desks.models import Desk
from users.serializers import UserSerializer


class ReservationSerializer(serializers.ModelSerializer):
    """Сериализатор для бронирований."""
    
    user_details = UserSerializer(source='user', read_only=True)
    desk_number = serializers.ReadOnlyField(source='desk.desk_number')
    desk_name = serializers.ReadOnlyField(source='desk.name')
    
    class Meta:
        model = Reservation
        fields = [
            'id', 'user', 'user_details', 'desk', 'desk_number', 'desk_name',
            'start_time', 'end_time', 'status', 'reservation_type',
            'recurrence_pattern', 'recurrence_end_date', 'notes',
            'created_at', 'updated_at', 'check_in_time'
        ]
        read_only_fields = ['created_at', 'updated_at', 'check_in_time']
    
    def validate(self, data):
        """Валидация данных бронирования."""
        # Проверка времени начала и окончания
        start_time = data.get('start_time')
        end_time = data.get('end_time')
        
        if start_time and end_time:
            if start_time >= end_time:
                raise serializers.ValidationError({
                    "end_time": "Время окончания должно быть позже времени начала."
                })
            
            # Проверка на прошедшую дату
            if start_time < timezone.now():
                raise serializers.ValidationError({
                    "start_time": "Нельзя создать бронирование на прошедшую дату."
                })
        
        # Проверка шаблона повторения и даты окончания повторений
        reservation_type = data.get('reservation_type')
        recurrence_pattern = data.get('recurrence_pattern')
        recurrence_end_date = data.get('recurrence_end_date')
        
        if reservation_type == ReservationType.RECURRING:
            if not recurrence_pattern:
                raise serializers.ValidationError({
                    "recurrence_pattern": "Шаблон повторения обязателен для повторяющегося бронирования."
                })
            
            if not recurrence_end_date:
                raise serializers.ValidationError({
                    "recurrence_end_date": "Дата окончания повторений обязательна для повторяющегося бронирования."
                })
            
            if recurrence_end_date and recurrence_end_date < start_time.date():
                raise serializers.ValidationError({
                    "recurrence_end_date": "Дата окончания повторений должна быть не раньше даты начала."
                })
        
        # Проверка доступности стола в указанное время
        desk = data.get('desk')
        if desk and start_time and end_time:
            # Исключаем текущее бронирование при обновлении
            reservation_id = self.instance.id if self.instance else None
            
            conflicting_reservations = Reservation.objects.filter(
                desk=desk,
                status=ReservationStatus.ACTIVE,
                start_time__lt=end_time,
                end_time__gt=start_time
            )
            
            if reservation_id:
                conflicting_reservations = conflicting_reservations.exclude(id=reservation_id)
            
            if conflicting_reservations.exists():
                raise serializers.ValidationError({
                    "desk": "Это рабочее место уже забронировано на указанное время."
                })
        
        return data


class ReservationCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания бронирований."""
    
    class Meta:
        model = Reservation
        fields = [
            'desk', 'start_time', 'end_time', 'reservation_type',
            'recurrence_pattern', 'recurrence_end_date', 'notes'
        ]
    
    def create(self, validated_data):
        """Создание бронирования с учетом повторяющихся событий."""
        user = self.context['request'].user
        validated_data['user'] = user
        
        # Для обычного бронирования просто создаем одну запись
        if validated_data.get('reservation_type') == ReservationType.SINGLE:
            reservation = Reservation.objects.create(**validated_data)
            return reservation
        
        # Для повторяющегося бронирования создаем несколько записей
        start_time = validated_data.get('start_time')
        end_time = validated_data.get('end_time')
        recurrence_pattern = validated_data.get('recurrence_pattern')
        recurrence_end_date = validated_data.get('recurrence_end_date')
        
        # Создаем родительское бронирование
        parent_reservation = Reservation.objects.create(**validated_data)
        
        # Определяем интервал для повторений
        delta = end_time - start_time  # продолжительность бронирования
        current_date = start_time.date()
        end_date = recurrence_end_date
        
        # Создаем повторяющиеся бронирования в зависимости от шаблона
        if recurrence_pattern == RecurrencePattern.DAILY:
            from datetime import timedelta
            step = timedelta(days=1)
            current_date += step  # начинаем со следующего дня
            
            while current_date <= end_date:
                current_start = timezone.datetime.combine(
                    current_date, start_time.time(), tzinfo=timezone.get_current_timezone()
                )
                current_end = current_start + delta
                
                Reservation.objects.create(
                    user=user,
                    desk=validated_data.get('desk'),
                    start_time=current_start,
                    end_time=current_end,
                    status=ReservationStatus.ACTIVE,
                    reservation_type=ReservationType.RECURRING,
                    recurrence_pattern=recurrence_pattern,
                    recurrence_end_date=recurrence_end_date,
                    notes=validated_data.get('notes', ''),
                    parent_reservation=parent_reservation
                )
                
                current_date += step
        
        elif recurrence_pattern == RecurrencePattern.WEEKDAYS:
            from datetime import timedelta
            current_date += timedelta(days=1)  # начинаем со следующего дня
            
            while current_date <= end_date:
                # Проверяем, что текущий день - будний (0 = понедельник, 6 = воскресенье)
                if current_date.weekday() < 5:  # Будние дни: 0-4
                    current_start = timezone.datetime.combine(
                        current_date, start_time.time(), tzinfo=timezone.get_current_timezone()
                    )
                    current_end = current_start + delta
                    
                    Reservation.objects.create(
                        user=user,
                        desk=validated_data.get('desk'),
                        start_time=current_start,
                        end_time=current_end,
                        status=ReservationStatus.ACTIVE,
                        reservation_type=ReservationType.RECURRING,
                        recurrence_pattern=recurrence_pattern,
                        recurrence_end_date=recurrence_end_date,
                        notes=validated_data.get('notes', ''),
                        parent_reservation=parent_reservation
                    )
                
                current_date += timedelta(days=1)
        
        elif recurrence_pattern == RecurrencePattern.WEEKLY:
            from datetime import timedelta
            step = timedelta(days=7)
            current_date += step  # начинаем со следующей недели
            
            while current_date <= end_date:
                current_start = timezone.datetime.combine(
                    current_date, start_time.time(), tzinfo=timezone.get_current_timezone()
                )
                current_end = current_start + delta
                
                Reservation.objects.create(
                    user=user,
                    desk=validated_data.get('desk'),
                    start_time=current_start,
                    end_time=current_end,
                    status=ReservationStatus.ACTIVE,
                    reservation_type=ReservationType.RECURRING,
                    recurrence_pattern=recurrence_pattern,
                    recurrence_end_date=recurrence_end_date,
                    notes=validated_data.get('notes', ''),
                    parent_reservation=parent_reservation
                )
                
                current_date += step
        
        elif recurrence_pattern == RecurrencePattern.BIWEEKLY:
            from datetime import timedelta
            step = timedelta(days=14)
            current_date += step  # начинаем через две недели
            
            while current_date <= end_date:
                current_start = timezone.datetime.combine(
                    current_date, start_time.time(), tzinfo=timezone.get_current_timezone()
                )
                current_end = current_start + delta
                
                Reservation.objects.create(
                    user=user,
                    desk=validated_data.get('desk'),
                    start_time=current_start,
                    end_time=current_end,
                    status=ReservationStatus.ACTIVE,
                    reservation_type=ReservationType.RECURRING,
                    recurrence_pattern=recurrence_pattern,
                    recurrence_end_date=recurrence_end_date,
                    notes=validated_data.get('notes', ''),
                    parent_reservation=parent_reservation
                )
                
                current_date += step
        
        elif recurrence_pattern == RecurrencePattern.MONTHLY:
            from dateutil.relativedelta import relativedelta
            current_date += relativedelta(months=1)  # начинаем со следующего месяца
            
            while current_date <= end_date:
                # Учитываем возможное отсутствие такой же даты в месяце (например, 31 число)
                try:
                    current_start = timezone.datetime.combine(
                        current_date, start_time.time(), tzinfo=timezone.get_current_timezone()
                    )
                    current_end = current_start + delta
                    
                    Reservation.objects.create(
                        user=user,
                        desk=validated_data.get('desk'),
                        start_time=current_start,
                        end_time=current_end,
                        status=ReservationStatus.ACTIVE,
                        reservation_type=ReservationType.RECURRING,
                        recurrence_pattern=recurrence_pattern,
                        recurrence_end_date=recurrence_end_date,
                        notes=validated_data.get('notes', ''),
                        parent_reservation=parent_reservation
                    )
                except ValueError:
                    # Пропускаем несуществующую дату
                    pass
                
                current_date += relativedelta(months=1)
        
        return parent_reservation


class ReservationUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для обновления бронирований."""
    
    class Meta:
        model = Reservation
        fields = ['notes', 'status']
        
    def validate_status(self, value):
        """Валидация статуса."""
        if self.instance.status != ReservationStatus.ACTIVE and value != self.instance.status:
            raise serializers.ValidationError(
                "Нельзя изменить статус завершенного или отмененного бронирования."
            )
        return value
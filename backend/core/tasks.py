from django.utils import timezone
from config.celery import app
from reservations.models import Reservation, ReservationStatus
from desks.models import Desk, DeskStatus


@app.task
def check_expired_reservations():
    """Задача для проверки истекших бронирований."""
    now = timezone.now()
    
    # Получаем активные бронирования, у которых истек срок
    expired_reservations = Reservation.objects.filter(
        status=ReservationStatus.ACTIVE,
        end_time__lt=now
    )
    
    for reservation in expired_reservations:
        # Меняем статус бронирования на "Завершено"
        reservation.status = ReservationStatus.COMPLETED
        reservation.save()


@app.task
def check_no_show_reservations():
    """Задача для проверки неявок."""
    now = timezone.now()
    threshold = now - timezone.timedelta(hours=1)  # 1 час после начала
    
    # Получаем активные бронирования, которые начались более часа назад,
    # но пользователь не отметился о прибытии
    no_show_reservations = Reservation.objects.filter(
        status=ReservationStatus.ACTIVE,
        start_time__lt=threshold,
        check_in_time=None
    )
    
    for reservation in no_show_reservations:
        # Меняем статус бронирования на "Неявка"
        reservation.status = ReservationStatus.NO_SHOW
        reservation.save()


@app.task
def reset_desk_statuses():
    """Задача для сброса статусов столов в конце рабочего дня."""
    # Получаем столы, которые не на обслуживании
    desks = Desk.objects.exclude(status=DeskStatus.MAINTENANCE)
    
    for desk in desks:
        # Сбрасываем статус на "Доступно"
        desk.status = DeskStatus.AVAILABLE
        desk.save()


@app.task
def send_reservation_reminders():
    """Задача для отправки напоминаний о бронированиях."""
    now = timezone.now()
    reminder_time = now + timezone.timedelta(hours=1)  # За час до начала
    
    # Получаем бронирования, которые начнутся через час
    upcoming_reservations = Reservation.objects.filter(
        status=ReservationStatus.ACTIVE,
        start_time__gt=now,
        start_time__lte=reminder_time
    )
    
    for reservation in upcoming_reservations:
        # Здесь будет логика отправки напоминания через Telegram
        # Это будет реализовано в отдельном модуле для интеграции с Telegram
        pass
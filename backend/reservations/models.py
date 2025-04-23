from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.utils import timezone
from desks.models import Desk


class ReservationStatus(models.TextChoices):
    """Статусы бронирования."""
    
    ACTIVE = 'active', _('Активно')
    COMPLETED = 'completed', _('Завершено')
    CANCELLED = 'cancelled', _('Отменено')
    NO_SHOW = 'no_show', _('Неявка')


class ReservationType(models.TextChoices):
    """Типы бронирования."""
    
    SINGLE = 'single', _('Однократное')
    RECURRING = 'recurring', _('Повторяющееся')


class RecurrencePattern(models.TextChoices):
    """Шаблоны повторения для бронирований."""
    
    DAILY = 'daily', _('Ежедневно')
    WEEKDAYS = 'weekdays', _('Будние дни')
    WEEKLY = 'weekly', _('Еженедельно')
    BIWEEKLY = 'biweekly', _('Раз в две недели')
    MONTHLY = 'monthly', _('Ежемесячно')


class Reservation(models.Model):
    """Модель бронирования рабочего места."""
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reservations',
        verbose_name=_('Пользователь')
    )
    desk = models.ForeignKey(
        Desk,
        on_delete=models.CASCADE,
        related_name='reservations',
        verbose_name=_('Рабочее место')
    )
    start_time = models.DateTimeField(verbose_name=_('Время начала'))
    end_time = models.DateTimeField(verbose_name=_('Время окончания'))
    status = models.CharField(
        max_length=20,
        choices=ReservationStatus.choices,
        default=ReservationStatus.ACTIVE,
        verbose_name=_('Статус')
    )
    reservation_type = models.CharField(
        max_length=20,
        choices=ReservationType.choices,
        default=ReservationType.SINGLE,
        verbose_name=_('Тип бронирования')
    )
    recurrence_pattern = models.CharField(
        max_length=20,
        choices=RecurrencePattern.choices,
        blank=True,
        null=True,
        verbose_name=_('Шаблон повторения')
    )
    recurrence_end_date = models.DateField(
        blank=True,
        null=True,
        verbose_name=_('Дата окончания повторений')
    )
    notes = models.TextField(blank=True, verbose_name=_('Примечания'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Создано'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Обновлено'))
    parent_reservation = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='child_reservations',
        verbose_name=_('Родительское бронирование')
    )
    check_in_time = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name=_('Время прибытия')
    )
    
    class Meta:
        verbose_name = _('Бронирование')
        verbose_name_plural = _('Бронирования')
        ordering = ['-start_time']
        
    def __str__(self):
        return f"{self.user} - {self.desk} ({self.start_time.strftime('%d.%m.%Y %H:%M')})"
    
    def check_in(self):
        """Отметка о прибытии."""
        if self.status == ReservationStatus.ACTIVE:
            self.check_in_time = timezone.now()
            self.save()
            return True
        return False
    
    def cancel(self):
        """Отменить бронирование."""
        if self.status == ReservationStatus.ACTIVE:
            self.status = ReservationStatus.CANCELLED
            self.save()
            return True
        return False
    
    def complete(self):
        """Завершить бронирование."""
        if self.status == ReservationStatus.ACTIVE:
            self.status = ReservationStatus.COMPLETED
            self.save()
            return True
        return False
    
    def mark_no_show(self):
        """Отметить неявку."""
        if self.status == ReservationStatus.ACTIVE and not self.check_in_time:
            self.status = ReservationStatus.NO_SHOW
            self.save()
            return True
        return False
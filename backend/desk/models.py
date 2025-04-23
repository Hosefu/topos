from django.db import models
from django.utils.translation import gettext_lazy as _


class DeskStatus(models.TextChoices):
    """Статусы рабочего места."""
    
    AVAILABLE = 'available', _('Доступно')
    OCCUPIED = 'occupied', _('Занято')
    MAINTENANCE = 'maintenance', _('На обслуживании')
    RESERVED = 'reserved', _('Зарезервировано')


class DeskType(models.TextChoices):
    """Типы рабочего места."""
    
    REGULAR = 'regular', _('Обычное')
    STANDING = 'standing', _('Стоячее')
    MEETING = 'meeting', _('Для встреч')
    MANAGER = 'manager', _('Менеджерское')


class Area(models.Model):
    """Модель для зон офиса."""
    
    name = models.CharField(max_length=100, verbose_name=_('Название'))
    description = models.TextField(blank=True, verbose_name=_('Описание'))
    floor = models.PositiveSmallIntegerField(default=1, verbose_name=_('Этаж'))
    
    class Meta:
        verbose_name = _('Зона')
        verbose_name_plural = _('Зоны')
        
    def __str__(self):
        return f"{self.name} (Этаж {self.floor})"


class Desk(models.Model):
    """Модель рабочего стола (места)."""
    
    name = models.CharField(max_length=100, verbose_name=_('Название'))
    desk_number = models.CharField(max_length=20, unique=True, verbose_name=_('Номер стола'))
    area = models.ForeignKey(
        Area, 
        on_delete=models.CASCADE, 
        related_name='desks',
        verbose_name=_('Зона')
    )
    x_coordinate = models.FloatField(verbose_name=_('Координата X'))
    y_coordinate = models.FloatField(verbose_name=_('Координата Y'))
    status = models.CharField(
        max_length=20,
        choices=DeskStatus.choices,
        default=DeskStatus.AVAILABLE,
        verbose_name=_('Статус')
    )
    desk_type = models.CharField(
        max_length=20,
        choices=DeskType.choices,
        default=DeskType.REGULAR,
        verbose_name=_('Тип стола')
    )
    features = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_('Особенности')
    )
    notes = models.TextField(blank=True, verbose_name=_('Примечания'))
    
    class Meta:
        verbose_name = _('Рабочее место')
        verbose_name_plural = _('Рабочие места')
        
    def __str__(self):
        return f"{self.name} ({self.desk_number})"
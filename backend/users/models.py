from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """Расширенная модель пользователя с поддержкой Telegram."""
    
    telegram_id = models.CharField(
        max_length=20, 
        blank=True, 
        null=True, 
        unique=True, 
        verbose_name=_('Telegram ID')
    )
    telegram_username = models.CharField(
        max_length=100, 
        blank=True, 
        null=True, 
        verbose_name=_('Telegram Username')
    )
    telegram_photo_url = models.URLField(
        blank=True, 
        null=True, 
        verbose_name=_('Telegram Photo URL')
    )
    telegram_auth_date = models.DateTimeField(
        blank=True, 
        null=True, 
        verbose_name=_('Telegram Auth Date')
    )
    department = models.CharField(
        max_length=100, 
        blank=True, 
        verbose_name=_('Отдел')
    )
    position = models.CharField(
        max_length=100, 
        blank=True, 
        verbose_name=_('Должность')
    )
    phone = models.CharField(
        max_length=20, 
        blank=True, 
        verbose_name=_('Телефон')
    )
    
    class Meta:
        verbose_name = _('Пользователь')
        verbose_name_plural = _('Пользователи')
        
    def __str__(self):
        return self.get_full_name() or self.username


class UserPreference(models.Model):
    """Модель предпочтений пользователя по рабочим местам."""
    
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='preference', 
        verbose_name=_('Пользователь')
    )
    preferred_desk_ids = models.JSONField(
        default=list, 
        blank=True, 
        verbose_name=_('Предпочитаемые столы')
    )
    preferred_area = models.CharField(
        max_length=100, 
        blank=True, 
        verbose_name=_('Предпочитаемая зона')
    )
    notification_enabled = models.BooleanField(
        default=True, 
        verbose_name=_('Уведомления включены')
    )
    
    class Meta:
        verbose_name = _('Предпочтение пользователя')
        verbose_name_plural = _('Предпочтения пользователей')
        
    def __str__(self):
        return f"Предпочтения {self.user}"
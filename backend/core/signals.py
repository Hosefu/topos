import json
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from desks.models import Desk
from reservations.models import Reservation


@receiver(post_save, sender=Desk)
def desk_update_handler(sender, instance, created, **kwargs):
    """Обработчик сигнала обновления рабочего места."""
    channel_layer = get_channel_layer()
    
    # Отправляем уведомление всем клиентам о изменении стола
    async_to_sync(channel_layer.group_send)(
        'office_updates',
        {
            'type': 'desk_status_update_message',
            'desk_id': instance.id,
            'status': instance.status,
            'updated_by': 'system'
        }
    )


@receiver(post_save, sender=Reservation)
def reservation_update_handler(sender, instance, created, **kwargs):
    """Обработчик сигнала обновления бронирования."""
    channel_layer = get_channel_layer()
    
    action = 'created' if created else 'updated'
    
    # Отправляем уведомление всем клиентам о изменении бронирования
    async_to_sync(channel_layer.group_send)(
        'office_updates',
        {
            'type': 'reservation_update_message',
            'reservation_id': instance.id,
            'action': action,
            'status': instance.status,
            'desk_id': instance.desk_id,
            'updated_by': 'system'
        }
    )


@receiver(post_delete, sender=Reservation)
def reservation_delete_handler(sender, instance, **kwargs):
    """Обработчик сигнала удаления бронирования."""
    channel_layer = get_channel_layer()
    
    # Отправляем уведомление всем клиентам об удалении бронирования
    async_to_sync(channel_layer.group_send)(
        'office_updates',
        {
            'type': 'reservation_update_message',
            'reservation_id': instance.id,
            'action': 'deleted',
            'desk_id': instance.desk_id,
            'updated_by': 'system'
        }
    )
from django.contrib import admin
from .models import Reservation


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    """Админ-панель для управления бронированиями."""
    list_display = [
        'id', 'user', 'desk', 'start_time', 'end_time',
        'status', 'reservation_type', 'check_in_time'
    ]
    list_filter = [
        'status', 'reservation_type', 'recurrence_pattern',
        'created_at', 'start_time'
    ]
    search_fields = [
        'user__username', 'user__first_name', 'user__last_name',
        'desk__name', 'desk__desk_number', 'notes'
    ]
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        (None, {
            'fields': ('user', 'desk')
        }),
        ('Время', {
            'fields': ('start_time', 'end_time', 'check_in_time')
        }),
        ('Статус и тип', {
            'fields': ('status', 'reservation_type', 'recurrence_pattern', 'recurrence_end_date')
        }),
        ('Связи', {
            'fields': ('parent_reservation',)
        }),
        ('Дополнительная информация', {
            'fields': ('notes', 'created_at', 'updated_at')
        }),
    )
    raw_id_fields = ['user', 'desk', 'parent_reservation']
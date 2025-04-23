from django.contrib import admin
from .models import Area, Desk


@admin.register(Area)
class AreaAdmin(admin.ModelAdmin):
    """Админ-панель для управления зонами офиса."""
    list_display = ['name', 'floor', 'description']
    list_filter = ['floor']
    search_fields = ['name', 'description']


@admin.register(Desk)
class DeskAdmin(admin.ModelAdmin):
    """Админ-панель для управления рабочими местами."""
    list_display = ['desk_number', 'name', 'area', 'status', 'desk_type']
    list_filter = ['status', 'desk_type', 'area']
    search_fields = ['name', 'desk_number', 'notes']
    readonly_fields = ['x_coordinate', 'y_coordinate']  # Изменяем только через интерфейс карты
    fieldsets = (
        (None, {
            'fields': ('name', 'desk_number', 'area')
        }),
        ('Координаты', {
            'fields': ('x_coordinate', 'y_coordinate')
        }),
        ('Статус и тип', {
            'fields': ('status', 'desk_type')
        }),
        ('Дополнительная информация', {
            'fields': ('features', 'notes')
        }),
    )
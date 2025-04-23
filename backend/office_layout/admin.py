from django.contrib import admin
from .models import OfficeLayout, OfficeElement


class OfficeElementInline(admin.TabularInline):
    """Встроенный редактор элементов схемы офиса."""
    model = OfficeElement
    extra = 0
    fields = ['element_type', 'name', 'x', 'y', 'width', 'height', 'z_index']


@admin.register(OfficeLayout)
class OfficeLayoutAdmin(admin.ModelAdmin):
    """Админ-панель для управления схемами офиса."""
    list_display = ['name', 'floor', 'width', 'height', 'is_active', 'updated_at']
    list_filter = ['floor', 'is_active']
    search_fields = ['name']
    inlines = [OfficeElementInline]
    fieldsets = (
        (None, {
            'fields': ('name', 'floor', 'is_active')
        }),
        ('Размеры', {
            'fields': ('width', 'height')
        }),
        ('Визуализация', {
            'fields': ('background_image', 'svg_data')
        }),
        ('Метаданные', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ['created_at', 'updated_at']


@admin.register(OfficeElement)
class OfficeElementAdmin(admin.ModelAdmin):
    """Админ-панель для управления элементами схемы офиса."""
    list_display = ['id', 'layout', 'element_type', 'name', 'x', 'y', 'z_index']
    list_filter = ['layout', 'element_type']
    search_fields = ['name']
    fieldsets = (
        (None, {
            'fields': ('layout', 'element_type', 'name')
        }),
        ('Позиция и размер', {
            'fields': ('x', 'y', 'width', 'height', 'rotation', 'z_index')
        }),
        ('Стиль', {
            'fields': ('svg_path', 'color')
        }),
        ('Дополнительно', {
            'fields': ('properties',)
        }),
    )
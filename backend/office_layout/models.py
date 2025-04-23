from django.db import models
from django.utils.translation import gettext_lazy as _


class OfficeLayout(models.Model):
    """Модель схемы офиса."""
    
    name = models.CharField(max_length=100, verbose_name=_('Название'))
    floor = models.PositiveSmallIntegerField(default=1, verbose_name=_('Этаж'))
    width = models.PositiveIntegerField(default=1000, verbose_name=_('Ширина (px)'))
    height = models.PositiveIntegerField(default=800, verbose_name=_('Высота (px)'))
    background_image = models.ImageField(
        upload_to='office_layouts/',
        blank=True,
        null=True,
        verbose_name=_('Фоновое изображение')
    )
    svg_data = models.TextField(blank=True, verbose_name=_('SVG данные'))
    is_active = models.BooleanField(default=True, verbose_name=_('Активна'))
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Создано'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Обновлено'))
    
    class Meta:
        verbose_name = _('Схема офиса')
        verbose_name_plural = _('Схемы офиса')
        ordering = ['floor', 'name']
        
    def __str__(self):
        return f"{self.name} (Этаж {self.floor})"


class OfficeElement(models.Model):
    """Модель элемента схемы офиса (стены, двери, окна и т.п.)."""
    
    class ElementType(models.TextChoices):
        WALL = 'wall', _('Стена')
        DOOR = 'door', _('Дверь')
        WINDOW = 'window', _('Окно')
        COLUMN = 'column', _('Колонна')
        AREA = 'area', _('Зона')
        OTHER = 'other', _('Другое')
    
    layout = models.ForeignKey(
        OfficeLayout,
        on_delete=models.CASCADE,
        related_name='elements',
        verbose_name=_('Схема офиса')
    )
    element_type = models.CharField(
        max_length=20,
        choices=ElementType.choices,
        default=ElementType.WALL,
        verbose_name=_('Тип элемента')
    )
    name = models.CharField(max_length=100, blank=True, verbose_name=_('Название'))
    x = models.FloatField(verbose_name=_('Координата X'))
    y = models.FloatField(verbose_name=_('Координата Y'))
    width = models.FloatField(default=0, verbose_name=_('Ширина'))
    height = models.FloatField(default=0, verbose_name=_('Высота'))
    rotation = models.FloatField(default=0, verbose_name=_('Поворот (градусы)'))
    svg_path = models.TextField(blank=True, verbose_name=_('SVG путь'))
    color = models.CharField(max_length=20, blank=True, verbose_name=_('Цвет'))
    z_index = models.IntegerField(default=0, verbose_name=_('Z-индекс'))
    properties = models.JSONField(default=dict, blank=True, verbose_name=_('Свойства'))
    
    class Meta:
        verbose_name = _('Элемент офиса')
        verbose_name_plural = _('Элементы офиса')
        ordering = ['z_index', 'element_type']
        
    def __str__(self):
        return f"{self.get_element_type_display()} - {self.name or self.id}"
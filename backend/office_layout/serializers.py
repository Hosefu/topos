from rest_framework import serializers
from .models import OfficeLayout, OfficeElement
from desks.models import Desk
from desks.serializers import DeskSerializer


class OfficeElementSerializer(serializers.ModelSerializer):
    """Сериализатор для элементов схемы офиса."""
    
    class Meta:
        model = OfficeElement
        fields = [
            'id', 'element_type', 'name', 'x', 'y',
            'width', 'height', 'rotation', 'svg_path',
            'color', 'z_index', 'properties'
        ]


class OfficeLayoutSerializer(serializers.ModelSerializer):
    """Сериализатор для схемы офиса."""
    
    elements = OfficeElementSerializer(many=True, read_only=True)
    
    class Meta:
        model = OfficeLayout
        fields = [
            'id', 'name', 'floor', 'width', 'height',
            'background_image', 'svg_data', 'is_active',
            'created_at', 'updated_at', 'elements'
        ]
        read_only_fields = ['created_at', 'updated_at']


class OfficeLayoutDetailSerializer(serializers.ModelSerializer):
    """Детальный сериализатор для схемы офиса с элементами и столами."""
    
    elements = OfficeElementSerializer(many=True, read_only=True)
    desks = serializers.SerializerMethodField()
    
    class Meta:
        model = OfficeLayout
        fields = [
            'id', 'name', 'floor', 'width', 'height',
            'background_image', 'svg_data', 'is_active',
            'created_at', 'updated_at', 'elements', 'desks'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_desks(self, obj):
        """Получить столы для указанного этажа."""
        from desks.models import Area
        area_ids = Area.objects.filter(floor=obj.floor).values_list('id', flat=True)
        desks = Desk.objects.filter(area_id__in=area_ids)
        return DeskSerializer(desks, many=True).data


class OfficeLayoutUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для обновления схемы офиса."""
    
    class Meta:
        model = OfficeLayout
        fields = ['name', 'width', 'height', 'background_image', 'svg_data', 'is_active']


class OfficeElementCreateUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания и обновления элементов схемы офиса."""
    
    class Meta:
        model = OfficeElement
        fields = [
            'layout', 'element_type', 'name', 'x', 'y',
            'width', 'height', 'rotation', 'svg_path',
            'color', 'z_index', 'properties'
        ]
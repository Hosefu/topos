from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import OfficeLayout, OfficeElement
from .serializers import (
    OfficeLayoutSerializer,
    OfficeLayoutDetailSerializer,
    OfficeLayoutUpdateSerializer,
    OfficeElementSerializer,
    OfficeElementCreateUpdateSerializer
)
from desks.models import Desk, Area


class OfficeLayoutViewSet(viewsets.ModelViewSet):
    """ViewSet для работы со схемами офиса."""
    
    queryset = OfficeLayout.objects.all()
    serializer_class = OfficeLayoutSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['floor', 'is_active']
    search_fields = ['name']
    ordering_fields = ['name', 'floor', 'created_at', 'updated_at']
    ordering = ['floor', 'name']
    
    def get_serializer_class(self):
        """Выбор сериализатора в зависимости от действия."""
        if self.action == 'retrieve':
            return OfficeLayoutDetailSerializer
        if self.action in ['update', 'partial_update']:
            return OfficeLayoutUpdateSerializer
        return self.serializer_class
    
    @action(detail=True, methods=['post'])
    def update_desks_positions(self, request, pk=None):
        """Обновление позиций столов на схеме офиса."""
        layout = self.get_object()
        desks_data = request.data.get('desks', [])
        
        updated_desks = []
        errors = []
        
        for desk_data in desks_data:
            try:
                desk_id = desk_data.get('id')
                x = desk_data.get('x_coordinate')
                y = desk_data.get('y_coordinate')
                
                if not desk_id or x is None or y is None:
                    errors.append({'error': 'Отсутствуют обязательные поля', 'data': desk_data})
                    continue
                
                desk = Desk.objects.get(id=desk_id)
                
                # Проверяем, принадлежит ли стол к этому этажу
                if desk.area.floor != layout.floor:
                    errors.append({
                        'error': 'Стол не принадлежит этому этажу',
                        'desk_id': desk_id
                    })
                    continue
                
                desk.x_coordinate = x
                desk.y_coordinate = y
                desk.save()
                
                updated_desks.append({
                    'id': desk.id,
                    'desk_number': desk.desk_number,
                    'x_coordinate': desk.x_coordinate,
                    'y_coordinate': desk.y_coordinate
                })
            
            except Desk.DoesNotExist:
                errors.append({'error': 'Стол не найден', 'desk_id': desk_id})
            except Exception as e:
                errors.append({'error': str(e), 'data': desk_data})
        
        return Response({
            'success': True,
            'updated_desks': updated_desks,
            'errors': errors
        })
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Получить активные схемы офиса."""
        active_layouts = OfficeLayout.objects.filter(is_active=True)
        serializer = self.get_serializer(active_layouts, many=True)
        return Response(serializer.data)


class OfficeElementViewSet(viewsets.ModelViewSet):
    """ViewSet для работы с элементами схемы офиса."""
    
    queryset = OfficeElement.objects.all()
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['layout', 'element_type']
    ordering_fields = ['z_index', 'element_type']
    ordering = ['z_index']
    
    def get_serializer_class(self):
        """Выбор сериализатора в зависимости от действия."""
        if self.action in ['create', 'update', 'partial_update']:
            return OfficeElementCreateUpdateSerializer
        return OfficeElementSerializer
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """Массовое создание элементов схемы офиса."""
        elements_data = request.data.get('elements', [])
        layout_id = request.data.get('layout_id')
        
        try:
            layout = OfficeLayout.objects.get(id=layout_id)
        except OfficeLayout.DoesNotExist:
            return Response(
                {'error': 'Схема офиса не найдена'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        created_elements = []
        errors = []
        
        for element_data in elements_data:
            element_data['layout'] = layout.id
            serializer = OfficeElementCreateUpdateSerializer(data=element_data)
            
            if serializer.is_valid():
                element = serializer.save()
                created_elements.append(OfficeElementSerializer(element).data)
            else:
                errors.append({
                    'data': element_data,
                    'errors': serializer.errors
                })
        
        return Response({
            'created_elements': created_elements,
            'errors': errors,
            'success': len(created_elements) > 0
        })
    
    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """Массовое обновление элементов схемы офиса."""
        elements_data = request.data.get('elements', [])
        
        updated_elements = []
        errors = []
        
        for element_data in elements_data:
            element_id = element_data.pop('id', None)
            
            if not element_id:
                errors.append({
                    'error': 'Отсутствует ID элемента',
                    'data': element_data
                })
                continue
            
            try:
                element = OfficeElement.objects.get(id=element_id)
                serializer = OfficeElementCreateUpdateSerializer(
                    element, data=element_data, partial=True
                )
                
                if serializer.is_valid():
                    element = serializer.save()
                    updated_elements.append(OfficeElementSerializer(element).data)
                else:
                    errors.append({
                        'id': element_id,
                        'data': element_data,
                        'errors': serializer.errors
                    })
            
            except OfficeElement.DoesNotExist:
                errors.append({
                    'error': 'Элемент не найден',
                    'id': element_id
                })
        
        return Response({
            'updated_elements': updated_elements,
            'errors': errors,
            'success': len(updated_elements) > 0
        })
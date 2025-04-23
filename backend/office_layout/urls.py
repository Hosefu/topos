from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OfficeLayoutViewSet, OfficeElementViewSet

# Создаем router для ViewSet
router = DefaultRouter()
router.register('layouts', OfficeLayoutViewSet)
router.register('elements', OfficeElementViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
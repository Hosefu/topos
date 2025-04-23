from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AreaViewSet, DeskViewSet

# Создаем router для ViewSet
router = DefaultRouter()
router.register('areas', AreaViewSet)
router.register('', DeskViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReservationViewSet

# Создаем router для ViewSet
router = DefaultRouter()
router.register('', ReservationViewSet, basename='reservation')

urlpatterns = [
    path('', include(router.urls)),
]
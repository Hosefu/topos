from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TelegramLoginView, UserViewSet

# Создаем router для ViewSet
router = DefaultRouter()
router.register('', UserViewSet)

urlpatterns = [
    path('telegram-login/', TelegramLoginView.as_view(), name='telegram-login'),
    path('', include(router.urls)),
]
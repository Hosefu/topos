import time
import hashlib
import hmac
from datetime import datetime, timedelta

from django.conf import settings
from django.db import transaction
from rest_framework import status, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token

from .models import User, UserPreference
from .serializers import (
    UserSerializer, 
    TelegramAuthSerializer, 
    UserUpdateSerializer,
    UserPreferenceSerializer,
    UserPreferenceUpdateSerializer
)


class TelegramLoginView(APIView):
    """Представление для авторизации через Telegram."""
    
    permission_classes = [permissions.AllowAny]
    
    def verify_telegram_data(self, data):
        """Проверка данных от Telegram."""
        data_check_string = '\n'.join([
            f"{key}={data[key]}" 
            for key in sorted(data.keys()) 
            if key != 'hash'
        ])
        
        secret_key = hashlib.sha256(settings.TELEGRAM_BOT_TOKEN.encode()).digest()
        
        received_hash = data.get('hash', '')
        calculated_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            digestmod=hashlib.sha256
        ).hexdigest()
        
        # Проверяем хеш и актуальность данных (не старше суток)
        auth_date = int(data.get('auth_date', 0))
        now = int(time.time())
        return (
            received_hash == calculated_hash and 
            (now - auth_date) < 86400  # 24 часа
        )
    
    @transaction.atomic
    def post(self, request, *args, **kwargs):
        """Обработка POST-запроса для авторизации через Telegram."""
        serializer = TelegramAuthSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        
        # Проверяем подпись Telegram
        if not self.verify_telegram_data(data):
            return Response(
                {"error": "Недействительные данные Telegram или истек срок действия."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        telegram_id = data.get('id')
        
        # Ищем или создаем пользователя
        try:
            user = User.objects.get(telegram_id=telegram_id)
            # Обновляем данные пользователя
            user.telegram_username = data.get('username', '')
            user.telegram_photo_url = data.get('photo_url', '')
            user.telegram_auth_date = datetime.fromtimestamp(data.get('auth_date'))
            user.save()
        except User.DoesNotExist:
            # Создаем нового пользователя
            username = data.get('username', f"tg_{telegram_id}")
            user = User.objects.create(
                username=username,
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', ''),
                telegram_id=telegram_id,
                telegram_username=data.get('username', ''),
                telegram_photo_url=data.get('photo_url', ''),
                telegram_auth_date=datetime.fromtimestamp(data.get('auth_date'))
            )
            # Создаем предпочтения для нового пользователя
            UserPreference.objects.create(user=user)
        
        # Создаем или обновляем токен
        token, created = Token.objects.get_or_create(user=user)
        
        # Возвращаем данные пользователя и токен
        response_data = {
            'token': token.key,
            'user': UserSerializer(user).data
        }
        
        return Response(response_data, status=status.HTTP_200_OK)


class UserViewSet(viewsets.ModelViewSet):
    """ViewSet для работы с пользователями."""
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_serializer_class(self):
        """Выбор сериализатора в зависимости от действия."""
        if self.action == 'update' or self.action == 'partial_update':
            return UserUpdateSerializer
        return UserSerializer
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Получить данные текущего пользователя."""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'])
    def update_me(self, request):
        """Обновить данные текущего пользователя."""
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(request.user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get', 'put', 'patch'])
    def preferences(self, request):
        """Получить или обновить предпочтения пользователя."""
        if request.method == 'GET':
            preference, created = UserPreference.objects.get_or_create(user=request.user)
            serializer = UserPreferenceSerializer(preference)
            return Response(serializer.data)
        
        preference, created = UserPreference.objects.get_or_create(user=request.user)
        serializer = UserPreferenceUpdateSerializer(preference, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
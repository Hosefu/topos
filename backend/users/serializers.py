from rest_framework import serializers
from .models import User, UserPreference


class UserPreferenceSerializer(serializers.ModelSerializer):
    """Сериализатор для предпочтений пользователя."""
    
    class Meta:
        model = UserPreference
        fields = ['preferred_desk_ids', 'preferred_area', 'notification_enabled']


class UserSerializer(serializers.ModelSerializer):
    """Сериализатор для пользователя."""
    
    preference = UserPreferenceSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email',
            'telegram_id', 'telegram_username', 'telegram_photo_url',
            'department', 'position', 'phone', 'preference'
        ]
        read_only_fields = ['telegram_id', 'telegram_username', 'telegram_photo_url']


class TelegramAuthSerializer(serializers.Serializer):
    """Сериализатор для авторизации через Telegram."""
    
    id = serializers.CharField()
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    username = serializers.CharField(required=False, allow_blank=True)
    photo_url = serializers.URLField(required=False, allow_null=True)
    auth_date = serializers.IntegerField()
    hash = serializers.CharField()


class UserUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для обновления данных пользователя."""
    
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'department', 'position', 'phone']


class UserPreferenceUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для обновления предпочтений пользователя."""
    
    class Meta:
        model = UserPreference
        fields = ['preferred_desk_ids', 'preferred_area', 'notification_enabled']
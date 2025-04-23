from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, UserPreference


class UserPreferenceInline(admin.StackedInline):
    """Встроенный редактор предпочтений пользователя."""
    model = UserPreference
    can_delete = False


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Админ-панель для управления пользователями."""
    list_display = ['username', 'email', 'first_name', 'last_name',
                   'telegram_username', 'department', 'is_staff']
    list_filter = ['is_staff', 'is_superuser', 'is_active', 'department']
    search_fields = ['username', 'email', 'first_name', 'last_name',
                    'telegram_username', 'telegram_id']
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Персональная информация'), {'fields': ('first_name', 'last_name', 'email',
                                                'department', 'position', 'phone')}),
        (_('Telegram информация'), {'fields': ('telegram_id', 'telegram_username',
                                             'telegram_photo_url', 'telegram_auth_date')}),
        (_('Права доступа'), {'fields': ('is_active', 'is_staff', 'is_superuser',
                                        'groups', 'user_permissions')}),
        (_('Важные даты'), {'fields': ('last_login', 'date_joined')}),
    )
    inlines = [UserPreferenceInline]


@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    """Админ-панель для управления предпочтениями пользователей."""
    list_display = ['user', 'preferred_area', 'notification_enabled']
    list_filter = ['notification_enabled', 'preferred_area']
    search_fields = ['user__username', 'user__email',
                    'user__first_name', 'user__last_name']
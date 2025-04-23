import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model

User = get_user_model()


class OfficeConsumer(AsyncWebsocketConsumer):
    """WebSocket потребитель для обновлений офиса в реальном времени."""
    
    async def connect(self):
        """Подключение к WebSocket."""
        self.office_group_name = 'office_updates'
        self.user = None
        
        # Авторизация по токену
        token_key = self.scope['url_route']['kwargs'].get('token')
        if token_key:
            self.user = await self.get_user_from_token(token_key)
        
        if not self.user:
            # Закрываем соединение, если пользователь не авторизован
            await self.close()
            return
        
        # Добавляем пользователя в группу
        await self.channel_layer.group_add(
            self.office_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Отправляем приветственное сообщение
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Подключение установлено'
        }))
    
    async def disconnect(self, close_code):
        """Отключение от WebSocket."""
        # Удаляем пользователя из группы
        await self.channel_layer.group_discard(
            self.office_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        """Получение сообщения от клиента."""
        data = json.loads(text_data)
        message_type = data.get('type', '')
        
        # Обработка различных типов сообщений
        if message_type == 'desk_status_update':
            # Обновление статуса стола
            await self.handle_desk_status_update(data)
        elif message_type == 'reservation_update':
            # Обновление бронирования
            await self.handle_reservation_update(data)
        elif message_type == 'ping':
            # Пинг для проверки соединения
            await self.send(text_data=json.dumps({
                'type': 'pong',
                'timestamp': data.get('timestamp')
            }))
    
    async def handle_desk_status_update(self, data):
        """Обработка обновления статуса стола."""
        # Если есть необходимость в бизнес-логике при обновлении статуса,
        # она может быть реализована здесь
        
        # Отправляем обновление всем пользователям в группе
        await self.channel_layer.group_send(
            self.office_group_name,
            {
                'type': 'desk_status_update_message',
                'desk_id': data.get('desk_id'),
                'status': data.get('status'),
                'updated_by': self.user.username
            }
        )
    
    async def handle_reservation_update(self, data):
        """Обработка обновления бронирования."""
        # Если есть необходимость в бизнес-логике при обновлении бронирования,
        # она может быть реализована здесь
        
        # Отправляем обновление всем пользователям в группе
        await self.channel_layer.group_send(
            self.office_group_name,
            {
                'type': 'reservation_update_message',
                'reservation_id': data.get('reservation_id'),
                'action': data.get('action'),
                'updated_by': self.user.username
            }
        )
    
    async def desk_status_update_message(self, event):
        """Отправка сообщения об обновлении статуса стола клиентам."""
        await self.send(text_data=json.dumps({
            'type': 'desk_status_update',
            'desk_id': event.get('desk_id'),
            'status': event.get('status'),
            'updated_by': event.get('updated_by')
        }))
    
    async def reservation_update_message(self, event):
        """Отправка сообщения об обновлении бронирования клиентам."""
        await self.send(text_data=json.dumps({
            'type': 'reservation_update',
            'reservation_id': event.get('reservation_id'),
            'action': event.get('action'),
            'updated_by': event.get('updated_by')
        }))
    
    @database_sync_to_async
    def get_user_from_token(self, token_key):
        """Получение пользователя по токену."""
        try:
            token = Token.objects.get(key=token_key)
            return token.user
        except Token.DoesNotExist:
            return None
import { WS_URL } from '../config';
import { updateDeskStatus } from '../store/desksSlice';
import { updateReservationStatus } from '../store/reservationsSlice';
import { addNotification } from '../store/uiSlice';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
    this.store = null;
  }

  // Инициализация службы WebSocket с хранилищем Redux
  init(store) {
    this.store = store;
  }

  // Подключение к WebSocket серверу
  connect(token) {
    if (!token) {
      console.error('WebSocket connection requires a token');
      return;
    }

    // Закрываем существующее соединение, если оно есть
    if (this.socket) {
      this.socket.close();
    }

    try {
      this.socket = new WebSocket(`${WS_URL}/ws/office/${token}/`);

      // Обработчик открытия соединения
      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.connected = true;
        this.reconnectAttempts = 0;

        // Отправляем пинг для проверки соединения каждые 30 секунд
        this.pingInterval = setInterval(() => {
          this.ping();
        }, 30000);
      };

      // Обработчик получения сообщений
      this.socket.onmessage = (event) => {
        this.handleMessage(event);
      };

      // Обработчик закрытия соединения
      this.socket.onclose = () => {
        this.connected = false;
        console.log('WebSocket disconnected');
        
        clearInterval(this.pingInterval);
        
        // Попытка переподключения
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          const timeout = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
          console.log(`Reconnecting in ${timeout / 1000} seconds...`);
          
          this.reconnectTimeout = setTimeout(() => {
            this.reconnectAttempts++;
            this.connect(token);
          }, timeout);
        }
      };

      // Обработчик ошибок
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }

  // Отключение от WebSocket сервера
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    clearInterval(this.pingInterval);
    clearTimeout(this.reconnectTimeout);
  }

  // Отправка сообщения на сервер
  send(data) {
    if (this.socket && this.connected) {
      this.socket.send(JSON.stringify(data));
    } else {
      console.error('Cannot send message, WebSocket is not connected');
    }
  }

  // Отправка пинга для проверки соединения
  ping() {
    this.send({
      type: 'ping',
      timestamp: Date.now()
    });
  }

  // Обработка входящих сообщений
  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'connection_established':
          console.log('WebSocket connection established:', data.message);
          break;
          
        case 'pong':
          console.log('Pong received:', Date.now() - data.timestamp, 'ms');
          break;
          
        case 'desk_status_update':
          this.handleDeskStatusUpdate(data);
          break;
          
        case 'reservation_update':
          this.handleReservationUpdate(data);
          break;
          
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error, event.data);
    }
  }

  // Обработка обновления статуса стола
  handleDeskStatusUpdate(data) {
    if (!this.store) return;
    
    this.store.dispatch(
      updateDeskStatus({
        deskId: data.desk_id,
        status: data.status
      })
    );
    
    // Добавляем уведомление, если обновление от другого пользователя
    if (data.updated_by && data.updated_by !== 'system' && 
        data.updated_by !== this.store.getState().auth.user?.username) {
      this.store.dispatch(
        addNotification({
          type: 'info',
          title: 'Обновление статуса стола',
          message: `Статус стола ${data.desk_id} изменен на "${data.status}" пользователем ${data.updated_by}`
        })
      );
    }
  }

  // Обработка обновления бронирования
  handleReservationUpdate(data) {
    if (!this.store) return;
    
    if (data.action === 'deleted') {
      // Обработка удаления бронирования
      // В нашем случае это обрабатывается через API, поэтому здесь ничего не делаем
    } else {
      // Обновляем статус бронирования
      this.store.dispatch(
        updateReservationStatus({
          reservationId: data.reservation_id,
          status: data.status
        })
      );
      
      // Добавляем уведомление, если обновление от другого пользователя
      if (data.updated_by && data.updated_by !== 'system' && 
          data.updated_by !== this.store.getState().auth.user?.username) {
        const actionText = data.action === 'created' ? 'создано' : 'обновлено';
        
        this.store.dispatch(
          addNotification({
            type: 'info',
            title: 'Обновление бронирования',
            message: `Бронирование ${data.reservation_id} ${actionText} пользователем ${data.updated_by}`
          })
        );
      }
    }
  }
}

// Создаем и экспортируем экземпляр сервиса
const websocketService = new WebSocketService();
export default websocketService;
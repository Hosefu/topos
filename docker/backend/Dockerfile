FROM python:3.10-slim

WORKDIR /app

# Устанавливаем зависимости для сборки
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Копируем и устанавливаем requirements
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Копируем исходный код
COPY . /app/

# Создаем директории для статических и медиа файлов
RUN mkdir -p /app/staticfiles /app/media

# Пользователь без привилегий root
RUN useradd -m user
RUN chown -R user:user /app
USER user

# Порт для Django
EXPOSE 8000

# Команда по умолчанию
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "config.asgi:application"]
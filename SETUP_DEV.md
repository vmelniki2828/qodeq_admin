# Настройка локальной разработки для dev.test.qodeq.net

## Шаг 1: Настройка hosts файла

1. Откройте файл `C:\Windows\System32\drivers\etc\hosts` с правами администратора
2. Добавьте в конец файла:
```
127.0.0.1    dev.test.qodeq.net
```
3. Сохраните файл

## Шаг 2: Установка mkcert

### Вариант 1: Через Chocolatey (рекомендуется)
```powershell
choco install mkcert
```

### Вариант 2: Через Scoop
```powershell
scoop install mkcert
```

### Вариант 3: Вручную
1. Скачайте mkcert с https://github.com/FiloSottile/mkcert/releases
2. Распакуйте `mkcert-v*-windows-amd64.exe` в папку, добавленную в PATH
3. Переименуйте в `mkcert.exe`

## Шаг 3: Установка локального CA и создание сертификата

```powershell
# Установка локального CA
mkcert -install

# Переход в директорию проекта
cd d:\GoIT\qodeq_admin

# Создание сертификата
mkcert dev.test.qodeq.net

# Это создаст два файла:
# - dev.test.qodeq.net.pem (сертификат)
# - dev.test.qodeq.net-key.pem (приватный ключ)
```

## Шаг 4: Установка Caddy

### Вариант 1: Через Chocolatey
```powershell
choco install caddy
```

### Вариант 2: Вручную
1. Скачайте Caddy с https://caddyserver.com/download
2. Распакуйте `caddy.exe` в папку, добавленную в PATH

## Шаг 5: Создание конфига Caddyfile

Создайте файл `Caddyfile` в корне проекта `d:\GoIT\qodeq_admin\Caddyfile`:

```
dev.test.qodeq.net {
    reverse_proxy 127.0.0.1:3000
    tls ./dev.test.qodeq.net.pem ./dev.test.qodeq.net-key.pem
}
```

## Шаг 6: Запуск

1. Запустите React приложение:
```powershell
npm start
```

2. В отдельном терминале запустите Caddy:
```powershell
cd d:\GoIT\qodeq_admin
caddy run
```

3. Откройте в браузере: https://dev.test.qodeq.net/

## Проверка

После настройки:
- ✅ `dev.test.qodeq.net` должен резолвиться в `127.0.0.1`
- ✅ Сертификат должен быть валидным (зеленый замок в браузере)
- ✅ Приложение должно работать через HTTPS

## Устранение проблем

### Если hosts не работает:
- Убедитесь, что файл сохранен с правами администратора
- Очистите DNS кэш: `ipconfig /flushdns`

### Если сертификат не работает:
- Убедитесь, что mkcert CA установлен: `mkcert -install`
- Проверьте, что файлы сертификата находятся в той же директории, что и Caddyfile

### Если Caddy не запускается:
- Проверьте, что порт 443 не занят другим приложением
- Убедитесь, что React приложение запущено на порту 3000


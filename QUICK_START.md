# Быстрый старт для dev.test.qodeq.net

## Выполните команды по порядку:

### 1. Настройка hosts файла (требуются права администратора)

Откройте PowerShell от имени администратора и выполните:

```powershell
Add-Content -Path "C:\Windows\System32\drivers\etc\hosts" -Value "127.0.0.1    dev.test.qodeq.net"
```

Или откройте вручную `C:\Windows\System32\drivers\etc\hosts` и добавьте:
```
127.0.0.1    dev.test.qodeq.net
```

### 2. Установка mkcert

**Через Chocolatey:**
```powershell
choco install mkcert -y
```

**Или вручную:**
- Скачайте с https://github.com/FiloSottile/mkcert/releases
- Распакуйте и добавьте в PATH

### 3. Создание сертификата

```powershell
cd d:\GoIT\qodeq_admin
mkcert -install
mkcert dev.test.qodeq.net
```

Это создаст файлы:
- `dev.test.qodeq.net.pem`
- `dev.test.qodeq.net-key.pem`

### 4. Установка Caddy

**Через Chocolatey:**
```powershell
choco install caddy -y
```

**Или вручную:**
- Скачайте с https://caddyserver.com/download
- Выберите Windows и распакуйте `caddy.exe`

### 5. Запуск

**Терминал 1 - React приложение:**
```powershell
cd d:\GoIT\qodeq_admin
npm start
```

**Терминал 2 - Caddy:**
```powershell
cd d:\GoIT\qodeq_admin
caddy run
```

### 6. Откройте в браузере

https://dev.test.qodeq.net/

---

## Автоматическая настройка

Или запустите автоматический скрипт (требуются права администратора):

```powershell
cd d:\GoIT\qodeq_admin
powershell -ExecutionPolicy Bypass -File .\setup-dev.ps1
```


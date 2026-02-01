# Полная настройка локальной разработки

Write-Host "=== Настройка локальной разработки ===" -ForegroundColor Green
Write-Host ""

# Шаг 1: Настройка hosts файла
Write-Host "Шаг 1: Настройка hosts файла..." -ForegroundColor Yellow
$hostsPath = "C:\Windows\System32\drivers\etc\hosts"
$hostsEntry = "127.0.0.1    dev.test.qodeq.net"

try {
    $hostsContent = Get-Content $hostsPath -ErrorAction Stop
    if ($hostsContent -notmatch "dev\.test\.qodeq\.net") {
        Write-Host "Добавление записи в hosts файл..." -ForegroundColor Cyan
        Add-Content -Path $hostsPath -Value $hostsEntry -ErrorAction Stop
        Write-Host "✓ Запись добавлена в hosts файл" -ForegroundColor Green
    } else {
        Write-Host "✓ Запись уже существует в hosts файле" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠ Не удалось автоматически обновить hosts файл" -ForegroundColor Red
    Write-Host "  Откройте вручную: $hostsPath" -ForegroundColor Yellow
    Write-Host "  Добавьте: $hostsEntry" -ForegroundColor Yellow
}

Write-Host ""

# Шаг 2: Проверка mkcert
Write-Host "Шаг 2: Проверка mkcert..." -ForegroundColor Yellow
$mkcertInstalled = Get-Command mkcert -ErrorAction SilentlyContinue

if (-not $mkcertInstalled) {
    Write-Host "⚠ mkcert не установлен" -ForegroundColor Red
    Write-Host "  Запустите: .\install-mkcert.ps1" -ForegroundColor Yellow
    Write-Host "  Или установите вручную: https://github.com/FiloSottile/mkcert/releases" -ForegroundColor Yellow
} else {
    Write-Host "✓ mkcert установлен" -ForegroundColor Green
    
    # Установка локального CA
    Write-Host "  Установка локального CA..." -ForegroundColor Cyan
    mkcert -install
    
    # Создание сертификата
    Write-Host "  Создание сертификата для dev.test.qodeq.net..." -ForegroundColor Cyan
    if (-not (Test-Path "dev.test.qodeq.net.pem")) {
        mkcert dev.test.qodeq.net
        Write-Host "✓ Сертификат создан" -ForegroundColor Green
    } else {
        Write-Host "✓ Сертификат уже существует" -ForegroundColor Green
    }
}

Write-Host ""

# Шаг 3: Проверка Caddy
Write-Host "Шаг 3: Проверка Caddy..." -ForegroundColor Yellow
$caddyInstalled = Get-Command caddy -ErrorAction SilentlyContinue

if (-not $caddyInstalled) {
    Write-Host "⚠ Caddy не установлен" -ForegroundColor Red
    Write-Host "  Запустите: .\install-caddy.ps1" -ForegroundColor Yellow
    Write-Host "  Или установите вручную: https://caddyserver.com/download" -ForegroundColor Yellow
} else {
    Write-Host "✓ Caddy установлен" -ForegroundColor Green
}

Write-Host ""

# Шаг 4: Проверка Caddyfile
Write-Host "Шаг 4: Проверка конфигурации..." -ForegroundColor Yellow
if (Test-Path "Caddyfile") {
    Write-Host "✓ Caddyfile существует" -ForegroundColor Green
} else {
    Write-Host "⚠ Caddyfile не найден, создаю..." -ForegroundColor Yellow
    @"
dev.test.qodeq.net {
    reverse_proxy 127.0.0.1:3000
    tls ./dev.test.qodeq.net.pem ./dev.test.qodeq.net-key.pem
}
"@ | Out-File -FilePath "Caddyfile" -Encoding UTF8
    Write-Host "✓ Caddyfile создан" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Настройка завершена ===" -ForegroundColor Green
Write-Host ""
Write-Host "Следующие шаги:" -ForegroundColor Yellow
Write-Host "1. Запустите React приложение: npm start" -ForegroundColor Cyan
Write-Host "2. В отдельном терминале запустите Caddy: caddy run" -ForegroundColor Cyan
Write-Host "3. Откройте в браузере: https://dev.test.qodeq.net/" -ForegroundColor Cyan
Write-Host ""






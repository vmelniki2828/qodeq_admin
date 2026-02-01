# Скрипт для исправления проблемы с установкой Caddy
# Требует запуска от имени администратора

Write-Host "=== Исправление проблемы с установкой Caddy ===" -ForegroundColor Green

# Обход политики выполнения
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# Удаление lock файла
$lockFile = "C:\ProgramData\chocolatey\lib\18c1117b8756e7ae77eb1dd5672b8147e64edc92"
if (Test-Path $lockFile) {
    Write-Host "`nУдаление lock файла..." -ForegroundColor Yellow
    Remove-Item -Path $lockFile -Force -ErrorAction SilentlyContinue
    Write-Host "✓ Lock файл удален" -ForegroundColor Green
}

# Попытка установки Caddy
Write-Host "`nУстановка Caddy..." -ForegroundColor Yellow
choco install caddy -y

# Проверка установки
$caddyInstalled = Get-Command caddy -ErrorAction SilentlyContinue
if ($caddyInstalled) {
    Write-Host "`n✓ Caddy успешно установлен!" -ForegroundColor Green
    Write-Host "Расположение: $($caddyInstalled.Source)" -ForegroundColor Cyan
} else {
    Write-Host "`n✗ Caddy не установлен. Попробуйте альтернативный способ." -ForegroundColor Red
    Write-Host "См. инструкции в INSTALL-CADDY.md" -ForegroundColor Yellow
}






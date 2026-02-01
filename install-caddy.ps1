# Скрипт установки Caddy для Windows

Write-Host "Установка Caddy..." -ForegroundColor Green

# Проверка наличия Chocolatey
$chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue

if ($chocoInstalled) {
    Write-Host "Установка через Chocolatey..." -ForegroundColor Yellow
    choco install caddy -y
} else {
    Write-Host "Chocolatey не найден. Установка вручную..." -ForegroundColor Yellow
    Write-Host "1. Скачайте Caddy с https://caddyserver.com/download" -ForegroundColor Cyan
    Write-Host "2. Выберите Windows и скачайте caddy_windows_amd64.zip" -ForegroundColor Cyan
    Write-Host "3. Распакуйте caddy.exe и добавьте в PATH" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Или установите Chocolatey: https://chocolatey.org/install" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "После установки запустите Caddy:" -ForegroundColor Green
Write-Host "  cd d:\GoIT\qodeq_admin" -ForegroundColor Cyan
Write-Host "  caddy run" -ForegroundColor Cyan






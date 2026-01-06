# Скрипт установки mkcert для Windows

Write-Host "Установка mkcert..." -ForegroundColor Green

# Проверка наличия Chocolatey
$chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue

if ($chocoInstalled) {
    Write-Host "Установка через Chocolatey..." -ForegroundColor Yellow
    choco install mkcert -y
} else {
    Write-Host "Chocolatey не найден. Установка вручную..." -ForegroundColor Yellow
    Write-Host "1. Скачайте mkcert с https://github.com/FiloSottile/mkcert/releases" -ForegroundColor Cyan
    Write-Host "2. Распакуйте mkcert-v*-windows-amd64.exe" -ForegroundColor Cyan
    Write-Host "3. Переименуйте в mkcert.exe и добавьте в PATH" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Или установите Chocolatey: https://chocolatey.org/install" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "После установки выполните:" -ForegroundColor Green
Write-Host "  mkcert -install" -ForegroundColor Cyan
Write-Host "  mkcert dev.test.qodeq.net" -ForegroundColor Cyan


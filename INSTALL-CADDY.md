# Установка Caddy на Windows

## Проблема с Chocolatey?

Если установка через Chocolatey не работает из-за lock файла или прав доступа, используйте один из альтернативных способов:

## Способ 1: Исправление lock файла (рекомендуется)

1. **Откройте PowerShell от имени администратора**

2. **Запустите скрипт исправления:**
   ```powershell
   .\fix-caddy-install.ps1
   ```

   Скрипт удалит lock файл и попытается установить Caddy снова.

## Способ 2: Ручное удаление lock файла

1. **Откройте PowerShell от имени администратора**

2. **Удалите lock файл:**
   ```powershell
   Remove-Item "C:\ProgramData\chocolatey\lib\18c1117b8756e7ae77eb1dd5672b8147e64edc92" -Force
   ```

3. **Установите Caddy:**
   ```powershell
   choco install caddy -y
   ```

## Способ 3: Ручная установка Caddy (без Chocolatey)

### Вариант A: Скачать готовый бинарник

1. **Скачайте Caddy для Windows:**
   - Перейдите на https://caddyserver.com/download
   - Выберите Windows и скачайте `caddy_windows_amd64.zip`

2. **Распакуйте архив:**
   - Извлеките `caddy.exe` в папку проекта: `d:\GoIT\qodeq_admin\caddy.exe`
   - Или в любую папку, добавленную в PATH (например, `C:\Windows\System32`)

3. **Проверьте установку:**
   ```powershell
   .\caddy.exe version
   ```

4. **Запуск Caddy:**
   ```powershell
   .\caddy.exe run
   ```

### Вариант B: Использовать Scoop (альтернатива Chocolatey)

1. **Установите Scoop** (если еще не установлен):
   ```powershell
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   irm get.scoop.sh | iex
   ```

2. **Установите Caddy:**
   ```powershell
   scoop install caddy
   ```

## После установки

### Если Caddy не найден в Git Bash:

1. **Закройте и откройте терминал заново** (обновление PATH)

2. **Или используйте полный путь:**
   ```bash
   # Если установлен через Chocolatey:
   "/c/ProgramData/chocolatey/bin/caddy.exe" run
   
   # Если установлен вручную в папку проекта:
   ./caddy.exe run
   ```

3. **Или используйте PowerShell:**
   ```powershell
   caddy run
   ```

## Проверка установки

Проверьте, что Caddy установлен:

```powershell
caddy version
```

Или в Git Bash:

```bash
caddy.exe version
```

## Настройка PATH (опционально)

Если Caddy установлен вручную, добавьте его в PATH:

1. Откройте "Переменные среды" (Environment Variables)
2. Найдите переменную `Path` в разделе "Системные переменные"
3. Добавьте путь к папке, где находится `caddy.exe`
4. Перезапустите терминал






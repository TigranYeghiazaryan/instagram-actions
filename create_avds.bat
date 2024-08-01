@echo off

setlocal

:: Убедитесь, что PATH включает пути к Android SDK tools и platform-tools
set PATH=%PATH%;C:\path\to\android-sdk\emulator;C:\path\to\android-sdk\tools;C:\path\to\android-sdk\platform-tools

:: Параметры для создания AVD
set AVD_NAME_PREFIX=test_avd
set AVD_ID=1
set ANDROID_VERSION=30
set ABI=x86_64
set RAM_SIZE=512
set SDCARD_SIZE=32M

:: Создание базового образа системы
echo Создание базового образа системы...
sdkmanager "system-images;android-%ANDROID_VERSION%;google_apis;%ABI%"

:: Создание AVD
:create_avds
if %AVD_ID% LEQ 50 (
    set AVD_NAME=%AVD_NAME_PREFIX%_%AVD_ID%
    echo Создание AVD: %AVD_NAME%...
    avdmanager create avd -n %AVD_NAME% -k "system-images;android-%ANDROID_VERSION%;google_apis;%ABI%" --sdcard %SDCARD_SIZE% --force

    :: Установка конфигураций для минимального использования ресурсов
    echo Настройка AVD: %AVD_NAME%...
    echo hw.ramSize=%RAM_SIZE% >> "%USERPROFILE%\.android\avd\%AVD_NAME%.avd\config.ini"
    echo hw.keyboard=no >> "%USERPROFILE%\.android\avd\%AVD_NAME%.avd\config.ini"
    echo hw.lcd.density=160 >> "%USERPROFILE%\.android\avd\%AVD_NAME%.avd\config.ini"
    echo hw.gpu.mode=off >> "%USERPROFILE%\.android\avd\%AVD_NAME%.avd\config.ini"
    echo hw.gpu.enabled=no >> "%USERPROFILE%\.android\avd\%AVD_NAME%.avd\config.ini"
    echo hw.camera.front=emulated >> "%USERPROFILE%\.android\avd\%AVD_NAME%.avd\config.ini"
    echo hw.camera.back=emulated >> "%USERPROFILE%\.android\avd\%AVD_NAME%.avd\config.ini"
    echo hw.audioInput=no >> "%USERPROFILE%\.android\avd\%AVD_NAME%.avd\config.ini"

    set /a AVD_ID+=1
    goto create_avds
)

echo Все AVDs созданы и настроены.

endlocal

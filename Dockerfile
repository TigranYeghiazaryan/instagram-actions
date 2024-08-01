# Используем базовый образ Ubuntu
FROM ubuntu:22.04

# Обновляем пакеты и устанавливаем необходимые зависимости
RUN apt-get update && \
    apt-get install -y \
    openjdk-11-jdk \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем переменную окружения JAVA_HOME
ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64

# Устанавливаем Android SDK и платформы
RUN mkdir -p /android-sdk/cmdline-tools && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -O /android-sdk.zip && \
    unzip /android-sdk.zip -d /android-sdk/cmdline-tools && \
    rm /android-sdk.zip

# Создаем файл для автоматического принятия лицензий
RUN mkdir -p /android-sdk/licenses && \
    echo -e "8933bad161af4178b1185d1a37fbf41ea5269c55\n" > /android-sdk/licenses/android-sdk-license && \
    echo -e "84831b9409646a918e30573bab4c9c91346d8abd\n" > /android-sdk/licenses/android-sdk-preview-license

# Устанавливаем необходимые компоненты Android SDK
RUN /android-sdk/cmdline-tools/cmdline-tools/bin/sdkmanager --update && \
    yes | /android-sdk/cmdline-tools/cmdline-tools/bin/sdkmanager "platform-tools" "platforms;android-30" "system-images;android-30;google_apis;x86_64" && \
    echo "no" | /android-sdk/cmdline-tools/cmdline-tools/bin/avdmanager create avd -n test -k "system-images;android-30;google_apis;x86_64" --force

# Устанавливаем таймзону
RUN ln -sf /usr/share/zoneinfo/Etc/UTC /etc/localtime

# Копируем скрипт для запуска эмулятора
COPY start-emulator.sh /start-emulator.sh
RUN chmod +x /start-emulator.sh

# Запускаем эмулятор
ENTRYPOINT ["/start-emulator.sh"]

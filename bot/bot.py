import telebot
from telebot import types
from datetime import datetime

TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN'

bot = telebot.TeleBot(TOKEN)

# Учитывайте, что эти данные должны быть в базе данных или другом надежном источнике
users = {}
accounts = {}

def add_account(user_id, account_details):
    if user_id not in accounts:
        accounts[user_id] = []
    accounts[user_id].append(account_details)

def remove_account(user_id, account_id):
    if user_id in accounts:
        accounts[user_id] = [acc for acc in accounts[user_id] if acc['id'] != account_id]

@bot.message_handler(commands=['start'])
def send_message(message):
    user = message.from_user
    username = user.username if user.username else "нет username"
    
    # Создаем клавиатуру с кнопками
    keyboard = types.ReplyKeyboardMarkup(resize_keyboard=True)
    
    # Создаем кнопки
    button1 = types.KeyboardButton(text="Личный кабинет")
    button2 = types.KeyboardButton(text="О Сервисе 🔹")
    button3 = types.KeyboardButton(text="Техническую Поддержку🔹")
    
    # Добавляем кнопки на клавиатуру
    keyboard.add(button1, button2, button3)
    
    # Отправляем сообщение с клавиатурой
    bot.send_message(message.chat.id, f"Привет {username}! Это телеграм бот для продвижения Instagram аккаунтов", reply_markup=keyboard)

@bot.message_handler(func=lambda message: message.text in ["О Сервисе 🔹", "Техническую Поддержку🔹", "Личный кабинет"])
def handle_button_message(message):
    if message.text == "О Сервисе 🔹":
        markup = types.InlineKeyboardMarkup()
        button3 = types.InlineKeyboardButton(text="Соглашение", callback_data="соглашение")
        button4 = types.InlineKeyboardButton(text="Поддержка", callback_data="поддержка")
        button5 = types.InlineKeyboardButton(text="Сообщить об ошибке", callback_data="сообщить об ошибке")
        markup.add(button3, button4, button5)
        bot.send_message(message.chat.id, "Наш сервис — торговая площадка для невзаимозаменяемых токенов (NFT). Покупайте, продавайте и открывайте для себя эксклюзивные цифровые предметы.", reply_markup=markup)

    elif message.text == "Техническую Поддержку🔹":
        markupp = types.InlineKeyboardMarkup()
        button6 = types.InlineKeyboardButton(text="ПОДДЕРЖКА", callback_data="поддержка")
        markupp.add(button6)
        bot.send_message(message.chat.id, "Правила обращения в Техническую Поддержку...", reply_markup=markupp)

    elif message.text == "Личный кабинет":
        user = message.from_user
        current_time = datetime.now().strftime("%d.%m.%Y %H:%M:%S")
        usernamee = user.username if user.username else "нет username"
        markuppp = types.InlineKeyboardMarkup()
        button7 = types.InlineKeyboardButton(text="💳 Пополнить", callback_data="top_up")
        button8 = types.InlineKeyboardButton(text="💳 Вывести", callback_data="withdraw")
        button9 = types.InlineKeyboardButton(text="📦 Мои аккаунты", callback_data="my_accounts")
        button10 = types.InlineKeyboardButton(text="➕ Добавить аккаунт", callback_data="add_account")
        button11 = types.InlineKeyboardButton(text="❤️ Избранное", callback_data="favorites")
        button12 = types.InlineKeyboardButton(text="🔍 Верификация", callback_data="verification")
        button13 = types.InlineKeyboardButton(text="⚙️ Настройки", callback_data="settings")
        markuppp.add(button7, button8)
        markuppp.add(button9)
        markuppp.add(button10)
        markuppp.add(button11)
        markuppp.add(button12)
        markuppp.add(button13)

        message_text = (
            f"Личный кабинет\n\n"
            f"Баланс: 0₽\n"
            f"На выводе: 0₽\n\n"
            f"Верификация: ⚠️ Не верифицирован\n"
            f"Ваш ID: {user.id}\n\n"
            f"Дата и время: {current_time}"
        )
        bot.send_message(message.chat.id, message_text, reply_markup=markuppp)

@bot.callback_query_handler(func=lambda call: True)
def callback_inline(call):
    if call.message:
        if call.data == "соглашение":
            bot.send_message(call.message.chat.id, "Вы выбрали 'Соглашение'.")
        elif call.data == "поддержка":
            bot.send_message(call.message.chat.id, "Вы выбрали 'Поддержка'.")
        elif call.data == "сообщить об ошибке":
            bot.send_message(call.message.chat.id, "Вы выбрали 'Сообщить об ошибке'.")
        elif call.data == "top_up":
            bot.send_message(call.message.chat.id, "Функция 'Пополнить' в разработке.")
        elif call.data == "withdraw":
            bot.send_message(call.message.chat.id, "Функция 'Вывести' в разработке.")
        elif call.data == "my_accounts":
            bot.send_message(call.message.chat.id, "Функция 'Мои аккаунты' в разработке.")
        elif call.data == "add_account":
            bot.send_message(call.message.chat.id, "Функция 'Добавить аккаунт' в разработке.")
        elif call.data == "favorites":
            bot.send_message(call.message.chat.id, "Функция 'Избранное' в разработке.")
        elif call.data == "verification":
            bot.send_message(call.message.chat.id, "Функция 'Верификация' в разработке.")
        elif call.data == "settings":
            bot.send_message(call.message.chat.id, "Функция 'Настройки' в разработке.")

bot.polling()

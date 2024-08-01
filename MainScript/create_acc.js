const puppeteer = require('puppeteer');
const { faker } = require('@faker-js/faker');
const torRequest = require('tor-request');

// Настройте Tor прокси
torRequest.setTorAddress('localhost', 9050);

// Функция для создания аккаунта через Puppeteer и Tor
const createAccount = async (email, password) => {
    const browser = await puppeteer.launch({
        headless: false, // Измените на true, если не хотите видеть браузер
        args: [
            `--proxy-server=socks5://localhost:9050`,
        ],
    });

    const page = await browser.newPage();

    try {
        console.log(`Создание аккаунта с email: ${email}`);

        await page.goto('https://www.instagram.com/accounts/emailsignup/', {
            waitUntil: 'networkidle2',
        });

        // Заполнение формы регистрации
        await page.type('input[name="emailOrPhone"]', email);
        await page.type('input[name="fullName"]', faker.name.fullName());
        await page.type('input[name="username"]', faker.internet.userName());
        await page.type('input[name="password"]', password);
        
        // Принять условия
        await page.click('button[type="submit"]');
        
        // Подождите немного, чтобы увидеть, что произойдет
        await page.waitForTimeout(5000);

        console.log(`Аккаунт создан с email: ${email}`);
    } catch (error) {
        console.error(`Ошибка создания аккаунта с email ${email}:`, error);
    } finally {
        await browser.close();
    }
};

// Основная функция
const main = async () => {
    const numAccounts = 5; // Количество аккаунтов для создания

    for (let i = 0; i < numAccounts; i++) {
        const email = faker.internet.email();
        const password = faker.internet.password();

        await createAccount(email, password);
    }
};

main();

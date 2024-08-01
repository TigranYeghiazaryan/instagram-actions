const puppeteer = require('puppeteer');
const readline = require('readline');
const fs = require('fs');

// Utility function to create a delay
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Load accounts from file
async function loadAccounts(filename) {
    const accounts = [];
    const fileStream = fs.createReadStream(filename);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        const [username, password] = line.split(' ');
        if (username && password) {
            accounts.push({ username, password });
        } else {
            console.error(`Invalid account entry: ${line}`);
        }
    }

    return accounts;
}

// Load proxies from file
async function loadProxies(filename) {
    const proxies = [];
    const fileStream = fs.createReadStream(filename);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        proxies.push(line.trim());
    }

    return proxies;
}

// Load clients and their subscription requirements
async function loadClients(filename) {
    const clients = [];
    const fileStream = fs.createReadStream(filename);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        const [username, followerCount] = line.split(' ');
        if (username && followerCount) {
            clients.push({ username, followerCount: parseInt(followerCount, 10) });
        } else {
            console.error(`Invalid client entry: ${line}`);
        }
    }

    return clients;
}

// Function to follow a client account
async function followClient(page, clientUsername) {
    try {
        await page.goto(`https://www.instagram.com/${clientUsername}/`, { waitUntil: 'networkidle2' });
        const followButton = await page.$('button');

        if (followButton) {
            const buttonText = await page.evaluate(button => button.textContent, followButton);

            if (buttonText === 'Follow' || buttonText === 'Follow Back') {
                await followButton.click();
                console.log(`Followed ${clientUsername}`);
            } else {
                console.log(`${clientUsername} is already followed`);
            }
        } else {
            console.log(`Follow button not found for ${clientUsername}`);
        }

        await delay(5000); // Wait for 5 seconds to avoid quick subsequent actions
    } catch (error) {
        console.error(`Error following ${clientUsername}: ${error}`);
    }
}

// Function to handle Instagram login and actions
async function handleAccount(username, password, proxy, clients) {
    const browser = await puppeteer.launch({
        headless: true,
        args: proxy ? [`--proxy-server=${proxy}`] : []
    });
    const page = await browser.newPage();

    try {
        // Go to Instagram login page
        await page.goto('https://www.instagram.com/accounts/login/', {
            waitUntil: 'networkidle2'
        });

        // Log in to Instagram
        await page.type('input[name="username"]', username);
        await page.type('input[name="password"]', password);
        await page.click('button[type="submit"]');

        // Wait for navigation after login
        await page.waitForNavigation({ waitUntil: 'networkidle2' });

        console.log(`Logged in as ${username}`);

        // Follow clients
        for (let client of clients) {
            await followClient(page, client.username);
        }
    } catch (error) {
        console.error(`Error handling account ${username}: ${error}`);
    } finally {
        await browser.close();
    }
}

// Main function to process multiple accounts
async function main() {
    const accounts = await loadAccounts('accounts.txt');
    const proxies = await loadProxies('proxies.txt');
    const clients = await loadClients('clients.txt');

    const batchSize = 300; // Number of accounts to process simultaneously

    for (let i = 0; i < accounts.length; i += batchSize) {
        const batch = accounts.slice(i, i + batchSize);

        await Promise.all(batch.map(async (account, index) => {
            const proxy = proxies[index % proxies.length];
            await handleAccount(account.username, account.password, proxy, clients);
        }));
    }

    console.log('Completed all follow actions for today. Waiting until tomorrow...');
    setTimeout(() => {
        main(); // Repeat the process every 24 hours
    }, 24 * 60 * 60 * 1000);
}

main();

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

// Function to perform Instagram actions
async function performActions(page) {
    try {
        // View all published stories
        let storyElems = await page.$$('canvas[aria-label="Story"]');
        for (let elem of storyElems) {
            await elem.click();
            await delay(5000);  // Wait for story to view
            await page.keyboard.press('ArrowRight');  // Move to next story
        }
        console.log(`Viewed all published stories`);

        // View posts and reels from followed accounts
        await page.goto('https://www.instagram.com/', { waitUntil: 'networkidle2', timeout: 60000 });
        let postElems = await page.$$('article > div img');
        for (let elem of postElems) {
            await elem.click();
            await delay(10000);  // Wait to view post/reel
            await page.click('svg[aria-label="Close"]');
        }
        console.log(`Viewed posts and reels from followed accounts`);

        // Like and save the latest post
        if (postElems.length > 0) {
            await postElems[0].click(); // Open the first post
            await page.waitForSelector('svg[aria-label="Like"]', { timeout: 10000 });
            await page.click('svg[aria-label="Like"]');
            await delay(2000);  // Wait before next action
            await page.click('svg[aria-label="Save"]');
            console.log(`Liked and saved the latest post`);
            await page.click('svg[aria-label="Close"]'); // Close the post
        } else {
            console.log(`No posts found`);
        }

        // Scroll through carousel
        let carouselElems = await page.$$('ul > li[aria-label="Slide"]');
        for (let elem of carouselElems) {
            await elem.click();
            await delay(5000);  // Wait to view each slide
        }
        console.log(`Scrolled through carousel`);

        // Watch live stream for up to 10 minutes (if any)
        let liveStream = await page.$('div[aria-label="Live"]');
        if (liveStream) {
            await liveStream.click();
            await delay(10 * 60 * 1000);  // Watch for 10 minutes
            console.log(`Watched live stream for 10 minutes`);
        } else {
            console.log(`No live stream found`);
        }

    } catch (error) {
        console.error(`Error performing actions: ${error}`);
    }
}

// Function to handle Instagram login and actions
async function handleAccount(username, password, proxy) {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: [`--proxy-server=${proxy}`],
            defaultViewport: null, // Use default viewport size
            timeout: 60000 // Increase timeout
        });
        const page = await browser.newPage();

        try {
            // Go to Instagram login page
            await page.goto('https://www.instagram.com/accounts/login/', {
                waitUntil: 'networkidle2',
                timeout: 60000 // Increase timeout
            });

            // Log in to Instagram
            await page.type('input[name="username"]', username);
            await page.type('input[name="password"]', password);
            await page.click('button[type="submit"]');

            // Wait for navigation after login
            await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });

            console.log(`Logged in as ${username}`);

            // Perform actions
            await performActions(page);

        } catch (loginError) {
            console.error(`Error logging in with account ${username}: ${loginError}`);
        } finally {
            await page.close();
        }
    } catch (browserError) {
        console.error(`Error launching browser with proxy ${proxy}: ${browserError}`);
    } finally {
        if (browser) await browser.close();
    }
}

// Main function to process multiple accounts
async function main() {
    const accounts = await loadAccounts('accounts.txt');
    const proxies = await loadProxies('proxies.txt');
    const batchSize = 1000; // Number of accounts to process simultaneously (adjust as needed)

    for (let i = 0; i < accounts.length; i += batchSize) {
        const batch = accounts.slice(i, i + batchSize);

        await Promise.all(batch.map(async (account, index) => {
            const proxy = proxies[index % proxies.length];
            await handleAccount(account.username, account.password, proxy);
        }));
    }

    console.log('Completed all actions for today. Waiting until tomorrow...');
    setTimeout(() => {
        main(); // Repeat the process every 24 hours
    }, 24 * 60 * 60 * 1000);
}

main();

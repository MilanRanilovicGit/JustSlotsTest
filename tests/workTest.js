const { Builder, By, until } = require('selenium-webdriver');
const { writeFile } = require('fs').promises;
const { Buffer } = require('buffer');
const Jimp = require('jimp');
const Tesseract = require('tesseract.js');

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function automationTest() {
    let driver;
        driver = await new Builder().forBrowser('chrome').build();

        await driver.get('https://www.freeslots.com/');

        await driver.findElement(By.className("next")).click();

        await driver.wait(until.elementLocated(By.id("game")), 5000);
        let screen = await driver.findElement(By.id("game"));

        let canvas = await driver.executeScript(`
            const canvas = arguments[0];
            return canvas.getBoundingClientRect();
        `, screen);

        const canvasX = Math.round(canvas.left + canvas.width / 2);
        const canvasY = Math.round(canvas.top + canvas.height / 2);

        await driver.actions()
            .move({ x: canvasX, y: canvasY })
            .click()
            .perform();

        console.log("Clicked");

        // Pause for 5 seconds
        await delay(10000);

        let screenshot_base64 = await driver.takeScreenshot();
        let screenshot_buffer = Buffer.from(screenshot_base64, 'base64');
        await writeFile('screenshot.png', screenshot_buffer);

        let image = await Jimp.read('screenshot.png');
        let cropped_image = image.crop(815, 655, 330, 45); // (left, top, width, height)
        await cropped_image.writeAsync('cropped_screenshot.png');

        // Use Tesseract.js to recognize text from cropped image
        let tesseractOutput = await Tesseract.recognize(
            './cropped_screenshot.png', 'eng', { logger: e => console.log(e) }
        );
        console.log(tesseractOutput.data.text);
     
}

automationTest();
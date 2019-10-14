const electron = require("electron");
const url = require("url");
const path = require("path");
const webdriver = require('selenium-webdriver')
const http = require('http');
const fs = require('fs');
const {app, BrowserWindow, Menu, ipcMain} = electron;
const request = require('request')
// let mainWindow, addWindow;

app.on("ready", () => {
    mainWindow = new BrowserWindow({
        //frame: false
    });

    mainWindow.maximize()

    // mainWindow.setResizable(false);

    // Pencerenin Oluşturulması...
    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "pages/mainWindow.html"),
            protocol: "file:",
            slashes: true
        })
    );

    // Menünün Oluşturulması..
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);

    ipcMain.on("todo:close", () => {
        app.quit();
        addWindow = null;
    });

    // request('http://google.com/doodle.png').pipe(fs.createWriteStream('doodle.png'))

    ipcMain.on("newTodo:save", (err, data) => {

        if (data == undefined || data == null) {
            return; //Error. Data can not be empty
        }

        let message = data.messages
        let list = data.phoneList

        let phoneList = list.split("\n")

        let driver = new webdriver.Builder()
            .usingServer('http://localhost:9515')
            .withCapabilities({
                chromeOptions: {
                    binary: "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"
                }
            })
            .forBrowser('electron')
            .build()

        async function processSendMessage(driver, message, phone) {
            await driver.get('https://web.whatsapp.com/send?phone=' + phone + '&text=' + message);
            // await driver.findElement(webdriver.By.id('action-button')).click();
            const element = await webdriver.By.xpath("//*[@id='main']/footer/div[1]/div[2]/div/div[2]")
            await driver.wait(webdriver.until.elementLocated(element));

            // const layer = await webdriver.By.xpath("//*[@id='content']/div/div/div/a")
            // await driver.wait(webdriver.until.elementLocated(layer));
            // console.log("ok");
            // await layer.click();

            const whatElement = await driver.findElement(element);
            await driver.wait(webdriver.until.elementIsVisible(whatElement)).sendKeys(webdriver.Key.ENTER);
        }

        // async function processSendFile(driver, message, phone,file) {
        //     await driver.get('https://api.whatsapp.com/send?phone=' + phone);
        //
        //     await driver.findElement(webdriver.By.id('action-button')).click();
        //     const element = await webdriver.By.xpath("//*[@id='main']/footer/div[1]/div[2]/div/div[2]")
        //     await driver.wait(webdriver.until.elementLocated(element));
        //     const whatElement = await driver.findElement(element);
        //     await driver.wait(webdriver.until.elementIsVisible(whatElement)).sendKeys(webdriver.Key.ENTER);
        //
        //     const clipElement = await webdriver.By.xpath('//*[@id="main"]/header/div[3]/div/div[2]/div');
        //     await driver.wait(webdriver.until.elementLocated(clipElement));
        //     await driver.wait(webdriver.until.elementIsVisible(clipElement));
        //     await driver.findElement(clipElement).click();
        //
        //     // await clipButton.click();
        //
        //     //
        //     //
        //     //
        //     // const mediaButton = await driver.findElement(webdriver.By.xpath('//*[@id="main"]/header/div[3]/div/div[2]/span/div/div/ul/li[1]/button/input'));
        //     // await driver.wait(webdriver.until.elementIsVisible(mediaButton));
        //     // const mediaElement = await driver.findElement(mediaButton);
        //     // await driver.wait(webdriver.until.elementIsVisible(mediaElement)).sendKeys(file);
        //     //
        //     //
        //     // const textButton = await driver.findElement(webdriver.By.xpath('//*[@id="app"]/div/div/div[2]/div[2]/span/div/span/div/div/div[2]/div/span/div/div[2]/div/div[3]/div[1]/div[2]'))
        //     // await driver.wait(webdriver.until.elementIsVisible(textButton));
        //     // const textElement = await driver.findElement(textButton);
        //     // await driver.wait(webdriver.until.elementIsVisible(textElement)).sendKeys(message);
        //     //
        //     //
        //     // const sendBtn = await driver.findElement(webdriver.By.xpath('//*[@id="app"]/div/div/div[2]/div[2]/span/div/span/div/div/div[2]/span[2]/div/div'))
        //     //
        //     // await driver.wait(webdriver.until.elementIsVisible(sendBtn));
        //     // const sendElement = await driver.findElement(sendBtn);
        //     // await driver.wait(webdriver.until.elementIsVisible(sendElement)).click()
        //     //
        //     //
        //     //
        //     // await sleep(3000)
        //
        //     // await driver.findElement(webdriver.By.css("input[type='file']")).sendKeys("C:\\Users\\baran\\OneDrive\\Desktop\\IMG_8648 kopya.jpg");
        //     //
        //     // await driver.findElement(webdriver.By.css("span[data-icon='send-light']")).click();
        // }

        let count = 0;

        async function processSendMessageToList(driver, message, phoneList) {
            await driver.get('https://web.whatsapp.com');
            await sleep(10000);

            for (const phone of phoneList) {
                await processSendMessage(driver, message, phone)
                count++;
                mainWindow.webContents.send("send:message", phone)
                await sleep(3000);
            }
            driver.quit()
            console.log('Done!');
        }

        processSendMessageToList(driver, message, phoneList);
    });

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
});

// Menü Template Yapısı
const mainMenuTemplate = [
    {
        label: "Dosya",
        submenu: [
            {
                label: "Yeni TODO Ekle",
                click() {
                    createWindow();
                }
            },
            {
                label: "Tümünü Sil"
            },
            {
                label: "Çıkış",
                accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",
                role: "quit"
            }
        ]
    }
];
if (process.platform == "darwin") {
    mainMenuTemplate.unshift({
        label: app.getName(),
        role: "TODO"
    });
}
if (process.env.NODE_ENV !== "production") {
    mainMenuTemplate.push({
        label: "Geliştirici Araçları",
        submenu: [
            {
                label: "Geliştirici Araçları",
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                label: "Yenile",
                role: "reload"
            }
        ]
    });
}

function createWindow() {
    addWindow = new BrowserWindow({
        width: 475,
        height: 175,
        title: "Yeni Bir Pencere",
        frame: false
    });

    addWindow.setResizable(false);

    addWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "pages/newTodo.html"),
            protocol: "file:",
            slashes: true
        })
    );

    addWindow.on("close", () => {
        addWindow = null;
    });
}

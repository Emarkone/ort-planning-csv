const puppeteer = require("puppeteer");
const { USERNAME, PASSWORD} = require("./config.json");
const Event = require('./models/event.js');
var fs = require('fs'); 

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
  
    try {
      await page.goto("https://www.formation-occ.com/", {
      waitUntil: "networkidle2",
    });
    } catch {
      console.log('❌ ERR: Impossible de se connecter au site')
      return false;
    }

    await page.$eval(
        "input[name=username]",
        (el, username) => (el.value = username),
        USERNAME
      );

    await page.$eval(
        "input[name=password]",
        (el, password) => (el.value = password),
        PASSWORD
      );
    
    await page.click('input[type="submit"]');

    await page.waitForSelector("a[href='https://www.formation-occ.com/planning.php']");
    await page.click("a[href='https://www.formation-occ.com/planning.php']")

    await page.waitForSelector("button[formaction='flat_planning.php']");
    await page.click("button[formaction='flat_planning.php']");

    await page.waitForSelector("#to");
    await page.$eval(
        "input[name=to]",
        el => (el.value = '01/01/2022')
    );
    await page.$eval(
        "input[name=from]",
        el => (el.value = '01/01/2021')
    );

    await page.click('button[type="submit"]');

    await page.waitForSelector("tbody");

    const data = await page.evaluate(() => {
        tds = Array.from(document.querySelectorAll('td'))
        tds = tds.map(td => {
            let txt = td.innerText;
            if (txt == "21-1 Concepteur(trice)-développeur(se) informatique") return '##'; 
            return txt;
        });

        tds = tds.filter(function(element) {
            if (element.match("Lundi|Mardi|Mercredi|Jeudi|Vendredi")) return false;
            return true;
        })

        tds.shift();

        return tds;

    });

    const eventArray = [];
    let event = [];

    for(value of data) {
        if(value == '##') {
            try {
                eventArray.push(new Event(...event));
            } catch(err) {
                console.log(err);
            }
            
            event = [];
        } else {
            event.push(value);
        }
    }

    let finalCSV = "Subject,Start Date,Start Time,End Date,End Time,All Day Event,Description,Location,Private\r\n";

    for(event of eventArray) {
        finalCSV += event.csvLine() + '\r\n';
    }

    fs.writeFile('planning.csv', finalCSV, function (err) {
        if (err) throw err;
        console.log('Saved!');
    }); 

    await browser.close();

})()
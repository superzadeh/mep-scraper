const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function main() {
  /**
   * Launch Chromium. By setting `headless` key to false,
   * we can see the browser UI.
   */
  const browser = await puppeteer.launch({
    headless: false
  });

  /**
   * Create a new page.
   */
  const page = await browser.newPage();

  /**
   * Change this URL to be the one that list all MEPs of your country
   */
  await page.goto('https://www.europarl.europa.eu/meps/en/search/advanced?name=&groupCode=&countryCode=DE&bodyType=ALL');


  const content = await page.content();
  const $ = cheerio.load(content);
  const mepUrls = [];
  // Find all the MEPs personal page and put them in an array
  $('a.erpl_member-list-item-content ').each((idx, elem) => {
    const url = $(elem).attr('href');
    mepUrls.push(url);
  })

  // Go on each of these pages one by one, and retrieve their mailto: address
  const mepEmails = []
  async function getTodos() {
    for (const [idx, url] of mepUrls.entries()) {
      await page.goto(url)
      const content = await page.content();
      const $ = cheerio.load(content);
      const email = $('a.link_email').attr('href')
      mepEmails.push(email)
    }
  }

  await getTodos()

  // Print out the list of emails, ready to be copy pasted in BCC
  console.log(mepEmails.map(mailto => mailto.replace('mailto:', '')).join(','))

  // Close puppeteer
  browser.close();
}

main();

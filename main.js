const Apify = require('apify');

const sourceUrl = 'https://kosova.health/en/';
const LATEST = 'LATEST';
let check = false;

Apify.main(async () =>
{

    // const kvStore = await Apify.openKeyValueStore('COVID-19-KOSOVO');
    // const dataset = await Apify.openDataset('COVID-19-KOSOVO-HISTORY');
    // const { email } = await Apify.getValue('INPUT');

    console.log('Launching Puppeteer...');
    const browser = await Apify.launchPuppeteer();

    const page = await browser.newPage();
    await Apify.utils.puppeteer.injectJQuery(page);

    console.log('Going to the website...');
    await page.goto('https://kosova.health/en/');
      
    await page.waitForSelector('#__layout > div > div:nth-child(2) > section:nth-child(3) > div > div:nth-child(2) > div:nth-child(1) > div');
    
    console.log('Getting data...');
    // page.evaluate(pageFunction[, ...args]), pageFunction <function|string> Function to be evaluated in the page context, returns: <Promise<Serializable>> Promise which resolves to the return value of pageFunction
    const result = await page.evaluate(() =>
    {
     
        // eq() selector selects an element with a specific index number, text() method sets or returns the text content of the selected elements
        const identifiedCases = $("#__layout > div > div:nth-child(2) > section:nth-child(3) > div > div:nth-child(2) > div:nth-child(1) > div > h3");
        const recovered = $("#__layout > div > div:nth-child(2) > section:nth-child(3) > div > div:nth-child(2) > div:nth-child(2) > div > h3");
        const deceased = $("#__layout > div > div:nth-child(2) > section:nth-child(3) > div > div:nth-child(2) > div:nth-child(3) > div > h3").text();
        
        const data = {
            identifiedCases: identifiedCases,
            recovered: recovered,
            deceased: deceased,
            sourceUrl:'https://kosova.health/en/',
            lastUpdatedAtApify: new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes())).toISOString(),
            //readMe: 'https://github.com/katacek/covid-uk/blob/master/README.md',
            };
        return data;
        
    });       
    
    console.log(result)
    
    if ( !result.identifiedCases ) {
                check = true;
            }
        
    
    // let latest = await kvStore.getValue(LATEST);
    // if (!latest) {
    //     await kvStore.setValue('LATEST', result);
    //     latest = result;
    // }
    // delete latest.lastUpdatedAtApify;
    // const actual = Object.assign({}, result);
    // delete actual.lastUpdatedAtApify;

    // if (JSON.stringify(latest) !== JSON.stringify(actual)) {
    //     await dataset.pushData(result);
    // }

    // await kvStore.setValue('LATEST', result);
    // await Apify.pushData(result);


    // console.log('Closing Puppeteer...');
    // await browser.close();
    // console.log('Done.');  
    
    // if there are no data for TotalInfected, send email, because that means something is wrong
    // const env = await Apify.getEnv();
    // if (check) {
    //     await Apify.call(
    //         'apify/send-mail',
    //         {
    //             to: email,
    //             subject: `Covid-19 UK from ${env.startedAt} failed `,
    //             html: `Hi, ${'<br/>'}
    //                     <a href="https://my.apify.com/actors/${env.actorId}#/runs/${env.actorRunId}">this</a> 
    //                     run had 0 TotalInfected, check it out.`,
    //         },
    //         { waitSecs: 0 },
    //     );
    // };
});
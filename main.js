const Apify = require('apify');

const sourceUrl = 'https://kosova.health/en/';
const LATEST = 'LATEST';
let check = false;

Apify.main(async () =>
{

    const kvStore = await Apify.openKeyValueStore('COVID-19-KOSOVO');
    const dataset = await Apify.openDataset('COVID-19-KOSOVO-HISTORY');
    const { email } = await Apify.getValue('INPUT');

    console.log('Launching Puppeteer...');
    const browser = await Apify.launchPuppeteer();

    const page = await browser.newPage();
    
    console.log('Going to the website...');
    await page.goto('https://kosova.health/en/');

    await Apify.utils.puppeteer.injectJQuery(page);
      
    await page.waitForSelector('div.statistics-box.box-shadow');
    
    console.log('Getting data...');
    // page.evaluate(pageFunction[, ...args]), pageFunction <function|string> Function to be evaluated in the page context, returns: <Promise<Serializable>> Promise which resolves to the return value of pageFunction
    const result = await page.evaluate(() =>
    {
     
        const now = new Date();
        // text() method sets or returns the text content of the selected elements
                
        const identifiedCases = $('span:contains(Identified Cases)').prev().text()
        const recovered = $('span:contains(Recovered)').prev().text()
        const deceased = $('span:contains(Deceased)').prev().text()


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
        
    
    let latest = await kvStore.getValue(LATEST);
    if (!latest) {
        await kvStore.setValue('LATEST', result);
        latest = result;
    }
    delete latest.lastUpdatedAtApify;
    const actual = Object.assign({}, result);
    delete actual.lastUpdatedAtApify;

    if (JSON.stringify(latest) !== JSON.stringify(actual)) {
        await dataset.pushData(result);
    }

    await kvStore.setValue('LATEST', result);
    await Apify.pushData(result);


    console.log('Closing Puppeteer...');
    await browser.close();
    console.log('Done.');  
    
    //if there are no data for TotalInfected, send email, because that means something is wrong
    const env = await Apify.getEnv();
    if (check) {
        await Apify.call(
            'apify/send-mail',
            {
                to: email,
                subject: `Covid-19 UK from ${env.startedAt} failed `,
                html: `Hi, ${'<br/>'}
                        <a href="https://my.apify.com/actors/${env.actorId}#/runs/${env.actorRunId}">this</a> 
                        run had 0 identifiedCases, check it out.`,
            },
            { waitSecs: 0 },
        );
    };
});
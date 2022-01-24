import admin = require('firebase-admin');
import {db, projectId} from '..';
import {createHTML} from './createHTMLForExport';
import {exportCamp as exportCamp} from './exportData';
import {ResponseData} from '../CloudFunction';
import {ExportedCamp} from '../interfaces/exportDatatypes';
import {Ingredient} from '../interfaces/firestoreDatatypes';


/*
// Used for local testing
// Run with:    export GCLOUD_PROJECT="cevizh11"
//              tsc functions/src/exportCamp/createExportFiles.ts && node functions/src/exportCamp/createExportFiles.js
console.log('Launch createExportFiles...')
console.log()
createExportFiles({campId: "hykCWTWtw7U9jhkqpSQI"})
    .then(res => {
        console.log(res)
        console.log();
        console.log('End createExportFiles')
    });
*/



/**
 *
 * Saves a PDF to the cloudStorage.
 *
 * This function creates a PDF as the Lagerhandbuch for the campId in the requestData object
 * using puppeteer and an headless chrome instance to print a static html page filled in with
 * the exportedData form the requested camp.
 *
 */
export async function createExportFiles(requestData: { campId: string }): Promise<ResponseData> {

    const exportDataPromise = exportCamp(requestData.campId);

    // load dependecies for creating a pdf with puppeteer
    const puppeteer = require('puppeteer');

    /*
    *  Start creating the pdf with puppeteer creating a new instance of an headless chrome browser
    *  to print the document and save it as a PDF in the CloudStorage.
    *  the launch args are needed for local testing under "Windows Subsystem for Linux"...
    */
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();

    // Need to create path to html file
    const path = require("path")
    await page.goto(path.join('file://' + __dirname, '..', '..', '/res/lagerhandbuch.html'));

    // use print media for print css
    await page.emulateMedia("print");

    // Update the data from the template...
    const exportData = await exportDataPromise;
    await page.evaluate(createHTML, exportData);

    // generates the file path out of the campId a unique token
    const filePath = generatingFileName(requestData.campId);

    // reads out the html content
    const htmlP = (projectId === 'cevizh11') ? saveAsHTML(page, filePath) : null;

    // saves the page as PDF
    const pdfP = saveAsPDF(page, filePath, (err: any) => {
        if (!err) {
            // File written successfully.
            console.log('pdf file written successfully');
        }
    });

    // saves the shopping list as csv
    const csvP = saveAsCSV(exportData, filePath);

    // await all Files to be finished
    await Promise.all([htmlP, pdfP, csvP]);

    const ref = (await addDocInExportCollection(requestData.campId, filePath) as FirebaseFirestore.DocumentData).data();

    browser.close();

    return await ref;

}

/**
 *
 * Writes the info about the export to the collection 'exports' of the
 * camp with the given campId.
 *
 * @param campId Id of the exported camp
 * @param filePath unique file path to the exported files
 */
async function addDocInExportCollection(campId: string, filePath: string): Promise<FirebaseFirestore.DocumentSnapshot> {

    const exportInfos = {
        path: filePath,
        docs: (projectId === 'cevizh11') ? ['pdf', 'html', 'csv'] : ['pdf', 'csv'],
        // now
        exportDate: new Date(),
        // one month after creation
        expiryDate: new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 30))
    };

    const docRef = await db.collection('camps/' + campId + '/exports/').add(exportInfos);
    return docRef.get();
}

/**
 * Saves the html content of the current Page as HTML
 *
 * @param page currentPage
 * @param filePath path where the file should get saved
 */
async function saveAsHTML(page: any, filePath: string) {

    const html = await page.evaluate(() => {
        return (document.body.parentElement as HTMLElement).innerHTML;
    });

    const htmlFile = getCloudStorage().file(filePath + '.html');
    const fileMetadata = {contentType: 'application-module/html'};
    htmlFile.save(html, fileMetadata, (err) => {
        console.log(err);
    });

}


/**
 * Saves the shoppingList as an CSV
 *
 * @param page currentPage
 * @param filePath path where the file should get saved
 */
async function saveAsCSV(camp: ExportedCamp, filePath: string) {

    const {Parser} = require('json2csv');
    const fields = ['measure', 'unit', 'food', 'comment', 'category'];

    // "withBOM" for utf-8 in Excel && "eol" for open with Excel
    const opts = {fields, withBOM: true, eol: "\r\n", delimiter: ";"};

    // convert shopping list to an array
    interface ExtendedIngredient extends Ingredient {
        category: string
    }

    const list: ExtendedIngredient[] = [];
    camp.shoppingList.forEach(cat => cat.ingredients.forEach(ing => {

        const ingr = ing as ExtendedIngredient;
        ingr.category = cat.categoryName;
        list.push(ingr);

    }));

    // convert array to csv
    const parser = new Parser(opts);
    const csv = parser.parse(list);

    const csvFile = getCloudStorage().file(filePath + '.csv');
    const fileMetadata = {contentType: 'application-module/csv'};
    csvFile.save(csv, fileMetadata, (err) => {
        console.log(err);
    });

}

/**
 * creates the unique fileName
 *
 * @param campId the Id of the camp in the firebase database
 * @returns the filePath to the created fileName
 *
 */
function generatingFileName(campId: string) {

    const campName = campId;
    const exportToken = (Date.now().toString(36) + Math.random().toString(36).substr(2, 5)).toUpperCase();
    return 'eMeal-export/' + campName + '_' + exportToken;

}

/**
 * Creates a pdf from a webpage using puppeteer
 *
 * @param page page to take create a pdf from
 * @param filePath path to the file
 * @param callback the SaveCallback function which gets called after the file has been saved
 *
 */
async function saveAsPDF(page: any, filePath: string, callback: any) {


    // custom print settings
    const printOptions = {
        printBackground: true,
        format: "A4",
        margin: {top: "2cm", right: "1.75cm", bottom: "2.5cm", left: "1.75cm"}
    };

    // create a pdf with the custom print settings
    const pdfBuffer = await page.pdf(printOptions);

    // saves the file in the cloudStorage
    const pdfFile = getCloudStorage().file(filePath + '.pdf');
    const fileMetadata = {contentType: 'application-module/pdf'};
    pdfFile.save(pdfBuffer, fileMetadata, callback);

}

/**
 *
 * @returns the default bucket (the cloudStorage) of the current project.
 *
 */
function getCloudStorage() {

    return admin.storage().bucket(projectId + '.appspot.com');
}


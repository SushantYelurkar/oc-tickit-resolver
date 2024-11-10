const { Builder, By, until } = require('selenium-webdriver');

const tickets = [
    {
        "Case No": "IM286844943",
        "Case Category": "NHQ Escalation- Incorrect Plan/Product information to customer",
        "Case Resolution Category": "AF Hold-Cancel ORN (NoLOS/NoCoverage/BldgAccess/BldgWiring/LCO issue)",
        "Case Resolution Comments": "Proceed for cancellation",
        "": ""
    },
    {
        "Case No": "IM286844821",
        "Case Category": "NHQ Escalation- Incorrect Plan/Product information to customer",
        "Case Resolution Category": "AF Hold-Cancel ORN (NoLOS/NoCoverage/BldgAccess/BldgWiring/LCO issue)",
        "Case Resolution Comments": "Proceed for cancellation",
        "": ""
    },
    {
        "Case No": "IM286844685",
        "Case Category": "NHQ Escalation- Incorrect Plan/Product information to customer",
        "Case Resolution Category": "AF Hold-Cancel ORN (NoLOS/NoCoverage/BldgAccess/BldgWiring/LCO issue)",
        "Case Resolution Comments": "Proceed for cancellation",
        "": ""
    },
    {
        "Case No": "IM286844500",
        "Case Category": "NHQ Escalation- Incorrect Plan/Product information to customer",
        "Case Resolution Category": "AF Hold-Cancel ORN (NoLOS/NoCoverage/BldgAccess/BldgWiring/LCO issue)",
        "Case Resolution Comments": "Proceed for cancellation",
        "": ""
    },
    {
        "Case No": "IM286844348",
        "Case Category": "NHQ Escalation- Incorrect Plan/Product information to customer",
        "Case Resolution Category": "AF Hold-Cancel ORN (NoLOS/NoCoverage/BldgAccess/BldgWiring/LCO issue)",
        "Case Resolution Comments": "Proceed for cancellation",
        "": ""
    },
    {
        "Case No": "IM286844396",
        "Case Category": "NHQ Escalation- Incorrect Plan/Product information to customer",
        "Case Resolution Category": "AF Hold-Cancel ORN (NoLOS/NoCoverage/BldgAccess/BldgWiring/LCO issue)",
        "Case Resolution Comments": "Proceed for cancellation",
        "": ""
    },
    {
        "Case No": "IM286844017",
        "Case Category": "NHQ Escalation- Incorrect Plan/Product information to customer",
        "Case Resolution Category": "AF Hold-Cancel ORN (NoLOS/NoCoverage/BldgAccess/BldgWiring/LCO issue)",
        "Case Resolution Comments": "Proceed for cancellation",
        "": ""
    },
    {
        "Case No": "IM286844138",
        "Case Category": "NHQ Escalation- Incorrect Plan/Product information to customer",
        "Case Resolution Category": "AF Hold-Cancel ORN (NoLOS/NoCoverage/BldgAccess/BldgWiring/LCO issue)",
        "Case Resolution Comments": "Proceed for cancellation",
        "": ""
    },
    {
        "Case No": "IM286843894",
        "Case Category": "NHQ Escalation- Incorrect Plan/Product information to customer",
        "Case Resolution Category": "AF Hold-Cancel ORN (NoLOS/NoCoverage/BldgAccess/BldgWiring/LCO issue)",
        "Case Resolution Comments": "Proceed for cancellation",
        "": ""
    }
];

async function main() {
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        // Open the login page and log in
        await driver.get('https://jiocentral.jioconnect.com');
        await driver.wait(until.elementLocated(By.name('username')), 10000);
        await driver.findElement(By.name('username')).sendKeys('Sushant.Yelurkar');
        await driver.findElement(By.name('password')).sendKeys('Sush12#$%^');
        await driver.findElement(By.css('input[type="submit"]')).click();
        console.log('Logged in successfully.');

        // Navigate to the QSYS page
        await driver.get('https://jiocentral.jioconnect.com/qsys');
        await driver.wait(until.elementLocated(By.css('.query-list-table')), 20000);
        console.log('Navigated to the QSYS page.');

        // Switch to "All Available Cases"
        try {
            let dropdown = await driver.findElement(By.id('asQ'));
            await dropdown.click();
            let allAvailableCasesOption = await driver.findElement(By.css('#asQ option[value="3"]'));
            await allAvailableCasesOption.click();
            console.log('Selected "All Available Cases" from the dropdown.');
            await driver.wait(until.elementLocated(By.css('.query-list-table tbody tr')), 20000);
            console.log('Loaded "All Available Cases".');
        } catch (error) {
            console.log('Error switching to "All Available Cases": ', error);
        }

        // Loop through each ticket in the JSON data
        for (let ticket of tickets) {
            if (ticket["Case No"]) {
                console.log(`Processing ticket: ${ticket["Case No"]}`);

                // Find the input field and enter the Case No
                await driver.wait(until.elementLocated(By.id('caseNoQ')), 20000);
                let caseInput = await driver.findElement(By.id('caseNoQ'));
                await caseInput.clear();
                await caseInput.sendKeys(ticket["Case No"]);
                console.log(`Entered case number: ${ticket["Case No"]}`);

                // Click the "View Cases" button
                let viewButton = await driver.findElement(By.xpath("//button[@type='submit' and contains(text(), 'View Cases')]"));
                await viewButton.click();
                console.log('Clicked on View Cases button.');

                // Wait for the table to load with results
                await driver.wait(until.elementLocated(By.css('.query-list-table tbody tr')), 10000);
                console.log('Table with case results loaded.');

                try {
                    // Find the row with the specified case number
                    let caseRow = await driver.findElement(By.xpath(`//a[contains(text(), '${ticket["Case No"]}')]/ancestor::tr`));

                    // Check the "Assignment Status" column (assuming it’s the 7th <td>)
                    let assignmentStatus = await caseRow.findElement(By.xpath('.//td[7]')).getText();
                    console.log(`Assignment status for ${ticket["Case No"]}: ${assignmentStatus}`);

                    if (assignmentStatus !== 'Resolved') {
                        // Click on the case number link to open the case
                        let caseLink = await caseRow.findElement(By.xpath('.//td[1]/a'));
                        await caseLink.click();
                        console.log(`Opened unresolved case: ${ticket["Case No"]}`);

                        // Get all window handles and switch to the new tab
                        let allHandles = await driver.getAllWindowHandles();
                        let newTabHandle = allHandles[1];
                        await driver.switchTo().window(newTabHandle);
                        console.log('Switched to the new tab.');

                        // Handle "Assign To Me" or "Resolve" button if available
                        let assignOrResolveHandled = false;
                        try {
                            // Wait for "Assign To Me" button and click if available
                            let assignButton = await driver.wait(until.elementLocated(By.xpath("//input[@class='btn btn-primary btnAssignToMe']")), 10000);
                            await assignButton.click();
                            console.log(`Assigned to self for ticket: ${ticket["Case No"]}`);
                            assignOrResolveHandled = true;

                            // Wait for the page to load after assigning
                            await driver.wait(until.stalenessOf(assignButton), 2000);
                            await driver.close();
                            await driver.switchTo().window(allHandles[0]);
                            console.log('Closed assigned tab and returned to main tab.');

                            // Open the ticket link again to load the new tab
                            await caseLink.click();
                            console.log('Reopened the case in a new tab.');

                            // Update the new window handle
                            allHandles = await driver.getAllWindowHandles();
                            newTabHandle = allHandles[1];
                            await driver.switchTo().window(newTabHandle);
                        } catch (error) {
                            console.log('Assign button not found, checking for Resolve button...');
                        }

                        if (!assignOrResolveHandled) {
                            try {
                                // Wait for "Resolve" button and click
                                let resolveButton = await driver.wait(until.elementLocated(By.xpath("//button[@class='btn btn-primary btnResolve']")), 20000);
                                await resolveButton.click();
                                console.log(`Clicked the "Resolve" button for ticket: ${ticket["Case No"]}`);
                                await driver.sleep(2000);
                            } catch (error) {
                                console.log(`Resolve button not found for ticket: ${ticket["Case No"]}`);
                            }
                        }

                        // Wait for modal to appear and enter category, resolution, and comment
                        await driver.wait(until.elementLocated(By.css('.modal-dialog')), 15000);
                        let categorySelect = await driver.findElement(By.id('categoryrv'));
                        let caseResolutionSelect = await driver.findElement(By.id('caseResolutionrv'));
                        let commentInput = await driver.findElement(By.id('commentrv'));

                        // Select Case Category
                        let categoryOptions = await categorySelect.findElements(By.tagName('option'));
                        for (let option of categoryOptions) {
                            if ((await option.getText()) === ticket["Case Category"]) {
                                await option.click();
                                break;
                            }
                        }

                        // Select Case Resolution Category
                        let caseResolutionOptions = await caseResolutionSelect.findElements(By.tagName('option'));
                        for (let option of caseResolutionOptions) {
                            if ((await option.getText()) === ticket["Case Resolution Category"]) {
                                await option.click();
                                break;
                            }
                        }

                        // Enter Case Resolution Comments
                        await commentInput.clear();
                        await commentInput.sendKeys(ticket["Case Resolution Comments"]);

                        // Click Save button
                        let saveButton = await driver.findElement(By.xpath("//button[contains(text(), 'Save')]"));
                        await saveButton.click();
                        console.log(`Saved resolution for ticket: ${ticket["Case No"]}`);

                        // Wait for save action to complete and close the tab
                        await driver.wait(until.stalenessOf(saveButton), 5000);
                        await driver.close();
                        await driver.switchTo().window(allHandles[0]);
                        console.log('Closed the resolved tab and returned to main tab.');
                    } else {
                        console.log(`Ticket ${ticket["Case No"]} is already resolved.`);
                    }
                } catch (error) {
                    console.log(`Error processing ticket ${ticket["Case No"]}: ${error}`);
                }
            }
        }
    } catch (error) {
        console.log('Error during automation process: ', error);
    } finally {
        await driver.quit();
        console.log('Driver quit, process completed.');
    }
}

main();

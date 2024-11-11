const { Builder, By, until } = require('selenium-webdriver');

const tickets = [
    {
        "Case No": "IM288337571",
        "Case Category": "NHQ Escalation - JioFiber Hold Wrong BID",
        "Case Resolution Category": "AF Hold-Cancel ORN due to WRONG-Bldg/Add/LB issue(Need New ORN)",
        "Case Resolution Comments": "Proceed for cancellation",
        "": ""
    },
    {
        "Case No": "IM288362333",
        "Case Category": "NHQ Escalation - JioFiber Hold Wrong BID",
        "Case Resolution Category": "AF Hold-Cancel ORN due to WRONG-Bldg/Add/LB issue(Need New ORN)",
        "Case Resolution Comments": "Proceed for cancellation",
        "": ""
    },
    {
        "Case No": "IM288219692",
        "Case Category": "NHQ Escalation - JioFiber Hold Wrong BID",
        "Case Resolution Category": "AF Hold-Cancel ORN due to WRONG-Bldg/Add/LB issue(Need New ORN)",
        "Case Resolution Comments": "Proceed for cancellation",
        "": ""
    },
    {
        "Case No": "IM287517804",
        "Case Category": "NHQ Escalation - JioFiber Hold Wrong BID",
        "Case Resolution Category": "AF Hold-Cancel ORN due to WRONG-Bldg/Add/LB issue(Need New ORN)",
        "Case Resolution Comments": "Proceed for cancellation",
        "": ""
    },
    {
        "Case No": "IM288261595",
        "Case Category": "NHQ Escalation - JioFiber Hold Wrong BID",
        "Case Resolution Category": "AF Hold-Cancel ORN due to WRONG-Bldg/Add/LB issue(Need New ORN)",
        "Case Resolution Comments": "Proceed for cancellation",
        "": ""
    },
    {
        "Case No": "IM287956052",
        "Case Category": "NHQ Escalation - JioFiber Hold Wrong BID",
        "Case Resolution Category": "AF Hold-Cancel ORN due to WRONG-Bldg/Add/LB issue(Need New ORN)",
        "Case Resolution Comments": "Proceed for cancellation",
        "": ""
    },
    {
        "Case No": "IM287914539",
        "Case Category": "NHQ Escalation - JioFiber Hold Wrong BID",
        "Case Resolution Category": "AF Hold-Cancel ORN due to WRONG-Bldg/Add/LB issue(Need New ORN)",
        "Case Resolution Comments": "Proceed for cancellation",
        "": ""
    },
    {
        "Case No": "IM287902235",
        "Case Category": "NHQ Escalation - JioFiber Hold Wrong BID",
        "Case Resolution Category": "AF Hold-Cancel ORN due to WRONG-Bldg/Add/LB issue(Need New ORN)",
        "Case Resolution Comments": "Proceed for cancellation",
        "": ""
    },
    {
        "Case No": "IM287779794",
        "Case Category": "NHQ Escalation - JioFiber Hold Wrong BID",
        "Case Resolution Category": "AF Hold-Cancel ORN due to WRONG-Bldg/Add/LB issue(Need New ORN)",
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

                        // Helper function to click "Assign To Me" or "Resolve" when available
                        async function clickButtonWhenAvailable(xpath, timeout = 10000) {
                            const startTime = Date.now();
                            while (Date.now() - startTime < timeout) {
                                try {
                                    const button = await driver.findElement(By.xpath(xpath));
                                    await driver.wait(until.elementIsVisible(button), 1000);
                                    await driver.wait(until.elementIsEnabled(button), 1000);
                                    await button.click();
                                    console.log(`Clicked button with xpath: ${xpath}`);
                                    return true; // Success
                                } catch (error) {
                                    await driver.sleep(500); // Retry every 500ms if not found
                                }
                            }
                            return false; // Failed to click within the timeout
                        }

                        // Try clicking "Assign To Me" button if available
                        let assignOrResolveHandled = await clickButtonWhenAvailable("//input[@class='btn btn-primary btnAssignToMe']");

                        if (!assignOrResolveHandled) {
                            // Try clicking "Resolve" button if "Assign To Me" was not found
                            assignOrResolveHandled = await clickButtonWhenAvailable("//button[@class='btn btn-primary btnResolve']");
                        }

                        if (assignOrResolveHandled) {
                            // Wait for page to load completely
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

                            


                            // Helper function to check if the page has fully loaded
                            async function waitForPageToLoad() {
                                try {
                                    // Wait for an element that only appears when the page has fully loaded
                                    await driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Save')]")), 10000);
                                    console.log("Page fully loaded.");
                                } catch (error) {
                                    console.log("Error waiting for page to load:", error);
                                }
                            }

                            let saveButton = await driver.findElement(By.xpath("//button[contains(text(), 'Save')]"));
                            await saveButton.click();
                            console.log(`Saved resolution for ticket: ${ticket["Case No"]}`);

                            // Wait until the page is fully loaded after clicking the button
                            await waitForPageToLoad();

                            // Wait for save action to complete and close the tab
                            await driver.wait(until.stalenessOf(saveButton), 5000);

                            // Close the previous tab (before moving on to the next ticket)
                            await driver.close();
                            await driver.switchTo().window(allHandles[0]);
                            console.log('Closed the previous tab and returned to main tab.');

                            // Check if the ticket is now resolved
                            let updatedCaseRow = await driver.findElement(By.xpath(`//a[contains(text(), '${ticket["Case No"]}')]/ancestor::tr`));
                            let updatedAssignmentStatus = await updatedCaseRow.findElement(By.xpath('.//td[7]')).getText();
                            console.log(`Updated assignment status for ${ticket["Case No"]}: ${updatedAssignmentStatus}`);

                            if (updatedAssignmentStatus === 'Resolved') {
                                console.log(`Ticket ${ticket["Case No"]} is now resolved.`);
                            } else {
                                console.log(`Ticket ${ticket["Case No"]} is still unresolved, retrying...`);
                                // If unresolved, you can either retry or exit based on your requirement
                            }

                        } else {
                            console.log(`Failed to find "Assign To Me" or "Resolve" button for ticket: ${ticket["Case No"]}`);
                        }
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

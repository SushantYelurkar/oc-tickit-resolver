const { Builder, By, until, Select } = require('selenium-webdriver');

// JSON data with ticket details
const tickets = [
    {
        "Case No": "IM287760174",
        "Case Resolution Category": "AF Hold- Resolution Provided For Installation",
        "Case Resolution Comments": "Proceed for cancellation",
    },
    {
        "Case No": "IM288245785",
        "Case Resolution Category": "AF Hold- Resolution Provided For Installation",
        "Case Resolution Comments": "Try to convince building owner, get the JCM help, if not convinced then JCM comments are required to resolve this case attach JCM approval",
    },
    {
        "Case No": "IM287676931",
        "Case Resolution Category": "AF Hold- Resolution Provided For Installation",
        "Case Resolution Comments": "JCM approval is required for resolve the case attach JCM approval",
    },
];

async function main() {
    let driver = await new Builder().forBrowser('chrome').build();

    try {
        // Open the login page and log in
        await driver.get('https://jiocentral.jioconnect.com');
        await driver.wait(until.elementLocated(By.name('username')), 10000);
        let usernameField = await driver.findElement(By.name('username'));
        await usernameField.sendKeys('Sushant.Yelurkar');
        let passwordField = await driver.findElement(By.name('password'));
        await passwordField.sendKeys('Sush12#$%^');
        let loginButton = await driver.findElement(By.css('input[type="submit"]'));
        await loginButton.click();
        console.log('Logged in successfully.');

        // Navigate to the QSYS page
        await driver.get('https://jiocentral.jioconnect.com/qsys');
        await driver.wait(until.elementLocated(By.css('.query-list-table')), 20000);
        console.log('Navigated to the QSYS page.');

        // Select "All Available Cases" from the dropdown
        let dropdown = await driver.findElement(By.id('asQ'));
        await dropdown.click();
        let allAvailableCasesOption = await driver.findElement(By.css('#asQ option[value="3"]'));
        await allAvailableCasesOption.click();
        console.log('Selected "All Available Cases" from the dropdown.');

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
                        // If unresolved, click the "Case Number" link to open the case
                        let caseLink = await caseRow.findElement(By.xpath('.//td[1]/a'));
                        await caseLink.click();
                        console.log(`Opened unresolved case: ${ticket["Case No"]}`);

                        // Get all window handles and switch to the new tab
                        let allHandles = await driver.getAllWindowHandles();
                        let newTabHandle = allHandles[1]; // Assuming new tab is the second one
                        await driver.switchTo().window(newTabHandle);
                        console.log('Switched to the new tab.');

                        // Wait for the page to fully load and for the table to be visible
                        await driver.wait(until.elementLocated(By.css('table.table-condensed.table-bordered')), 15000);  // Wait for table
                        console.log('Page loaded and table is visible.');

                        // Extract the "Case Category" from the table in the new tab
                        let caseCategory;
                        try {
                            // Wait for the table and Case Category row to be available
                            let caseCategoryRow = await driver.wait(until.elementLocated(By.xpath("//td[contains(text(), 'Case Category:')]")), 15000);
                            let caseCategoryElement = await caseCategoryRow.findElement(By.xpath("following-sibling::td"));
                            caseCategory = await caseCategoryElement.getText();
                            console.log(`Extracted case category: ${caseCategory}`);
                        } catch (categoryError) {
                            console.log('Error extracting case category:', categoryError);
                        }

                        // Dynamically replace the case category if necessary
                        let categoryToSelect = caseCategory;
                        if (categoryToSelect === 'AF Hold/ Booking Lead- Rooftop access related') {
                            categoryToSelect = 'NHQ Escalation - Permission Issue (Society / Rooftop / neighbour / LCO)';
                            console.log(`Updated case category to: ${categoryToSelect}`);
                        }

                        // Ensure Resolve button is visible before clicking
                        let resolveButton = await driver.wait(until.elementLocated(By.xpath("//button[@class='btn btn-primary btnResolve']")), 20000);
                        await driver.executeScript("arguments[0].scrollIntoView();", resolveButton);
                        await resolveButton.click();
                        console.log(`Clicked the "Resolve" button for ticket: ${ticket["Case No"]}`);

                        // Wait for the resolution modal to load
                        await driver.wait(until.elementLocated(By.css('.modal-dialog')), 15000); // increased wait time
                        console.log('Resolution modal loaded.');

                        // Wait for the category dropdown to be visible inside the modal
                        let categoryDropdown = await driver.wait(until.elementLocated(By.id('categoryrv')), 20000);  // Wait up to 20 seconds for the dropdown
                        await driver.executeScript("arguments[0].scrollIntoView();", categoryDropdown);
                        console.log('Category dropdown is now visible.');

                        // Select the Case Resolution Category from the dropdown inside the modal
                        let resolutionCategoryDropdown = await driver.findElement(By.id('categoryrv'));

                        // Using JavaScript to select the option in case Select doesn't work as expected
                        await driver.executeScript(`
                            var dropdown = arguments[0];
                            var options = dropdown.options;
                            for (var i = 0; i < options.length; i++) {
                                if (options[i].text === '${categoryToSelect}') {
                                    options[i].selected = true;
                                    break;
                                }
                            }
                        `, resolutionCategoryDropdown);

                        console.log('Selected updated case category using JavaScript.');

                        // Enter the resolution comment
                        let commentField = await driver.findElement(By.id('commentrv'));
                        await commentField.clear();
                        await commentField.sendKeys(ticket["Case Resolution Comments"]);
                        console.log(`Added comment: ${ticket["Case Resolution Comments"]}`);

                        // Wait a bit for any background processes to settle (since there may be loading after selecting options)
                        await driver.sleep(3000); // Sleep for 3 seconds to allow the process to complete

                        // Click the "Save" button
                        let saveButton = await driver.findElement(By.id('rvSaveBtn'));
                        await saveButton.click();
                        console.log('Clicked on Save button to submit resolution.');
                    }

                    // Navigate back to the main page after processing
                    await driver.navigate().back();
                    await driver.wait(until.elementLocated(By.id('caseNoQ')), 20000);
                    console.log('Navigated back to the case input page.');
                } catch (e) {
                    console.log(`Ticket ${ticket["Case No"]} not found in the list or error processing it: ${e}`);
                }
            }
        }

        // Wait for 20 seconds at the end
        await driver.sleep(20000);
        console.log('Waited for 20 seconds.');
    } catch (error) {
        console.log('Error:', error);
    } finally {
        await driver.quit();
    }
}

main();

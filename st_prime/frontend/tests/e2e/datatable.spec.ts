import { test as base, expect } from '@playwright/test';
import { getDataTable, verifyTableHeaders, verifyTableContent, enterEditMode } from './helpers/tableHelpers';

let testCounter = 0;

const test = base.extend<{ pageWithNavigation: any, logs: string[], testId: number }>({
    pageWithNavigation: async ({ page }, use) => {
        await page.goto('http://localhost:8501/');
        await page.waitForLoadState('networkidle');
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000);
        await use(page);
    },
    logs: async ({ }, use) => {
        const logs: string[] = [];
        await use(logs);
    },
    testId: async ({ }, use) => {
        testCounter++;
        await use(testCounter);
    }
});

const allTestLogs: { [key: string]: string[] } = {};

test.afterEach(async ({ logs, testId }, testInfo) => {
    const testIdentifier = `Test #${testId}: ${testInfo.title}`;
    allTestLogs[testIdentifier] = logs;
});

test.afterAll(async () => {
    console.log('\n=== All Test Logs (In Order of Execution) ===\n');
    Object.entries(allTestLogs).forEach(([testName, logs]) => {
        console.log(`\n${testName}:`);
        logs.forEach(log => console.log(`  ${log}`));
    });
});

function log(logs: string[], message: string, testId: number) {
    const timestamp = new Date().toISOString();
    logs.push(`[#${testId}][${timestamp}] ${message}`);
}

async function logTableContent(table: any, logs: string[], testId: number) {
    log(logs, 'Logging table content', testId);

    // Wait for header row to be visible
    const headerRow = table.locator('tr[data-pc-section="headerrow"]');
    await expect(headerRow).toBeVisible({ timeout: 15000 });

    // Get all rows and their content
    const rows = await table.locator('tr[data-pc-section="bodyrow"]').all();
    log(logs, `Found ${rows.length} data rows in table`, testId);

    for (const row of rows) {
        const text = await row.textContent() || '(empty row)';
        log(logs, `Row content: ${text.trim()}`, testId);
    }
}

test.describe('DataTable Component Tests', () => {
    test('should handle search functionality', async ({ pageWithNavigation, logs, testId }) => {
        log(logs, 'Starting search functionality test', testId);
        const firstTable = await getDataTable(pageWithNavigation, 1);
        await logTableContent(firstTable, logs, testId);

        // Get the first row's text to search for
        const firstRow = firstTable.locator('tr[data-pc-section="bodyrow"]').first();
        const searchText = await firstRow.textContent() || '';
        log(logs, `Using search text from first row: ${searchText}`, testId);

        const searchInput = firstTable.getByPlaceholder('Search');
        await expect(searchInput).toBeVisible({ timeout: 15000 });

        log(logs, 'Filling search input', testId);
        await searchInput.fill(searchText.substring(1, 5)); // Use part of the text to search
        await searchInput.press('Enter');

        log(logs, 'Waiting for search results', testId);
        await pageWithNavigation.waitForTimeout(1000);
        await logTableContent(firstTable, logs, testId);

        const searchResult = firstTable.locator('tr[data-pc-section="bodyrow"]').filter({ hasText: searchText }).first();
        await expect(searchResult).toBeVisible({ timeout: 15000 });
    });

    test('should display frozen columns and rows', async ({ pageWithNavigation, logs, testId }) => {
        log(logs, 'Starting frozen columns test', testId);
        const firstTable = await getDataTable(pageWithNavigation, 1);
        await logTableContent(firstTable, logs, testId);

        const headers = await firstTable.locator('tr[data-pc-section="headerrow"] th').allTextContents();
        log(logs, `Table headers: ${headers.join(', ')}`, testId);

        const numbersHeader = firstTable.locator('th:has-text("Numbers")').first();
        await expect(numbersHeader).toBeVisible({ timeout: 15000 });

        const lettersHeader = firstTable.locator('th:has-text("Letters")').first();
        await expect(lettersHeader).toBeVisible({ timeout: 15000 });
    });

    test('should handle date formatting and editing', async ({ pageWithNavigation, logs, testId }) => {
        log(logs, 'Starting date formatting test', testId);
        const secondTable = await getDataTable(pageWithNavigation, 2);
        await logTableContent(secondTable, logs, testId);

        // Find and click the row's edit button
        log(logs, 'Looking for row to edit', testId);
        const row = secondTable.getByRole('row', { name: 'one 12/30/2020 One Two Row Edit' });
        const editButton = row.getByLabel('Row Edit');
        await editButton.click();

        // Click the date input and select a date
        log(logs, 'Editing date', testId);
        const dateInput = secondTable.getByLabel('Choose Date');
        await dateInput.click();

        // Select a specific date
        const dateCell = secondTable.getByText('16');
        await dateCell.click();

        // Save the changes
        log(logs, 'Saving changes', testId);
        const saveButton = secondTable.getByLabel('Save Edit');
        await saveButton.click();

        // Verify the date was changed
        log(logs, 'Verifying date change', testId);
        await expect(
            secondTable.getByRole('row', { name: 'one 12/15/2020 One Two Row Edit' })
        ).toBeVisible({ timeout: 15000 });
    });

    test('should handle list-type columns with multi-select', async ({ pageWithNavigation, logs, testId }) => {
        log(logs, 'Starting multi-select test', testId);
        const secondTable = await getDataTable(pageWithNavigation, 2);
        await logTableContent(secondTable, logs, testId);

        // Find and click the row's edit button
        log(logs, 'Looking for row to edit', testId);
        const row = secondTable.getByRole('row', { name: 'one 12/30/2020 One Two Row Edit' });
        const editButton = row.getByLabel('Row Edit');
        await editButton.click();

        // Open the multi-select dropdown
        log(logs, 'Opening multi-select dropdown', testId);
        const dropdown = secondTable.locator('.p-multiselect-dropdown');
        await dropdown.click();

        // Search and select an option
        log(logs, 'Searching and selecting option', testId);
        const searchbox = secondTable.getByRole('searchbox');
        await searchbox.click();
        await searchbox.fill('five');

        const option = secondTable.getByLabel('Option List').getByRole('checkbox');
        await option.check();

        // Close the dropdown
        log(logs, 'Closing dropdown', testId);
        await dropdown.click();

        // Save the changes
        log(logs, 'Saving changes', testId);
        const saveButton = secondTable.getByLabel('Save Edit');
        await saveButton.click();

        // Verify the selection was added
        log(logs, 'Verifying selection', testId);
        const updatedRow = secondTable.getByRole('row', { name: 'one 12/30/2020 One Two Five Row Edit' });
        await expect(updatedRow).toBeVisible({ timeout: 15000 });

        // Optional: Remove the selection to clean up
        log(logs, 'Removing selection', testId);
        const updatedEditButton = updatedRow.getByLabel('Row Edit');
        await updatedEditButton.click();
        await secondTable.locator('span').filter({ hasText: 'Five' }).locator('path').click();
        await secondTable.getByLabel('Save Edit').click();
    });
});

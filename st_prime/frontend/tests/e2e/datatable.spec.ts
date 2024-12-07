import { test as base, expect } from '@playwright/test';

// Create a custom fixture
const test = base.extend<{ pageWithNavigation: any }>({
    pageWithNavigation: async ({ page }, use) => {
        await page.goto('http://localhost:8501/');
        await page.waitForLoadState('networkidle');
        console.log('Page loaded successfully');
        await use(page);
    },
});

// Common selectors
const getDataTable = (page: any, index: number) => {
    console.log(`Attempting to get data table at index ${index}`);
    const locator = page.locator('[data-testid="stCustomComponentV1"]').nth(index);
    console.log(`Locator created for index ${index}`);
    const contentFrame = locator.contentFrame();
    console.log(`Content frame obtained for index ${index}`);
    return contentFrame;
};

// Helper function to enter edit mode
async function enterEditMode(table: any) {
    await table.getByRole('row', { name: 'one 12/30/2020 One Two Row Edit' }).getByLabel('Row Edit').click();
    await expect(table.getByLabel('Cancel Edit')).toBeVisible();
    await expect(table.getByLabel('Save Edit')).toBeVisible();
}

test.describe('DataTable Component Tests', () => {
    test('should display basic table headers and controls', async ({ pageWithNavigation }) => {
        console.log('Starting first test');
        const firstTable = await getDataTable(pageWithNavigation, 1);
        await expect(firstTable).toBeTruthy();
        await expect(firstTable.getByText('Numbers')).toBeVisible();
        await expect(firstTable.getByText('Letters')).toBeVisible();
        await expect(firstTable.getByPlaceholder('Search')).toBeVisible();
        await expect(firstTable.getByLabel('Last Page')).toBeVisible();
    });

    test('should display table with sortable columns and dates', async ({ pageWithNavigation }) => {
        try {
            console.log('Starting second test');
            const locator = pageWithNavigation.locator('[data-testid="stCustomComponentV1"]').nth(2);
            const frame = await locator.contentFrame();
            if (!frame) {
                console.log('Frame is null or undefined');
                throw new Error('Frame not found');
            }
            await pageWithNavigation.waitForTimeout(1000);
            console.log('After timeout');

            // Check visibility of specific elements
            await expect(frame.getByText('Numbers')).toBeVisible({ timeout: 10000 });
            await expect(frame.getByText('Words')).toBeVisible();
            await expect(frame.getByText('Date')).toBeVisible();

            // Log if the table contains expected text
            console.log('Checking table content');
            await expect(frame.getByRole('table')).toContainText('12/30/2020');
            await expect(frame.getByRole('table')).toContainText('12/31/2020');
        } catch (error) {
            console.log('Test failed with error:', error);
            throw error;
        }
    });

    test('should handle row editing functionality', async ({ pageWithNavigation }) => {
        const secondTable = getDataTable(pageWithNavigation, 2);
        await expect(secondTable.getByRole('cell', { name: 'Row Edit' }).first()).toBeVisible();
        await expect(secondTable.getByLabel('Two')).toBeVisible();
        await expect(secondTable.getByLabel('One')).toBeVisible();

        await enterEditMode(secondTable);

        await expect(secondTable.getByLabel('Two').locator('svg')).toBeVisible();
        await expect(secondTable.getByLabel('Choose Date')).toBeVisible();
        await expect(secondTable.getByRole('cell', { name: '1', exact: true }).getByRole('button')).toBeVisible();
    });

    test('should handle multi-select dropdown functionality', async ({ pageWithNavigation }) => {
        const secondTable = getDataTable(pageWithNavigation, 2);
        await enterEditMode(secondTable);

        await secondTable.getByRole('cell', { name: 'One Two' }).locator('svg').nth(2).click();
        await expect(secondTable.getByRole('option', { name: 'One' })).toBeVisible();
        await expect(secondTable.getByRole('option', { name: 'One' }).getByRole('checkbox')).toBeVisible();
        await expect(secondTable.getByRole('option', { name: 'Two' }).getByRole('checkbox')).toBeVisible();
    });

    test('should handle date picker functionality', async ({ pageWithNavigation }) => {
        const secondTable = getDataTable(pageWithNavigation, 2);
        await enterEditMode(secondTable);

        await secondTable.getByLabel('Choose Date').click();
        await expect(secondTable.getByRole('dialog', { name: 'Choose Date' })).toBeVisible();
        await expect(secondTable.locator('td').filter({ hasText: '3030' }).locator('span')).toBeVisible();
    });

    test('should handle adding new values to dropdown', async ({ pageWithNavigation }) => {
        const secondTable = getDataTable(pageWithNavigation, 2);
        await enterEditMode(secondTable);

        await secondTable.getByRole('cell', { name: 'One Two' }).click();
        await secondTable.getByPlaceholder('Add new value').click();
        await secondTable.getByPlaceholder('Add new value').fill('Twelve');
        await secondTable.getByPlaceholder('Add new value').press('Enter');

        await expect(secondTable.getByRole('option', { name: 'Twelve' })).toBeVisible();
        await expect(secondTable.getByRole('option', { name: 'Twelve' }).getByRole('checkbox')).toBeVisible();
    });

    test('should handle editing and saving row values', async ({ pageWithNavigation }) => {
        const secondTable = getDataTable(pageWithNavigation, 2);
        await enterEditMode(secondTable);

        // Get the cell we want to edit and ensure it's visible
        const targetCell = secondTable.getByRole('cell', { name: '1', exact: true });
        await expect(targetCell).toBeVisible();

        // Click the edit button and wait for the input to be visible
        const editButton = targetCell.getByRole('button');
        await editButton.click();

        // Wait for and interact with the input
        const input = targetCell.getByRole('combobox');
        await expect(input).toBeVisible();
        await input.click();
        await input.fill('6');
        await pageWithNavigation.keyboard.press('Enter');

        // Save the changes
        await secondTable.getByLabel('Save Edit').click();

        // Verify the new value is visible
        await expect(secondTable.getByRole('cell', { name: '6' })).toBeVisible();
    });

    test('should display Till_100 column header', async ({ pageWithNavigation }) => {
        const thirdTable = getDataTable(pageWithNavigation, 3);
        await expect(thirdTable.getByRole('columnheader', { name: 'Till_100' })).toBeVisible();
    });
});

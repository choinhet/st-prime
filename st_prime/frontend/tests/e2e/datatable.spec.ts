import { test, expect } from '@playwright/test';

// Common selectors
const getDataTable = (page: any, index: number) => page.locator('[data-testid="stCustomComponentV1"]').nth(index).contentFrame();

// Helper function to enter edit mode
async function enterEditMode(table: any) {
    await table.getByRole('row', { name: 'one 12/30/2020 One Two Row Edit' }).getByLabel('Row Edit').click();
    await expect(table.getByLabel('Cancel Edit')).toBeVisible();
    await expect(table.getByLabel('Save Edit')).toBeVisible();
}

test.describe('DataTable Component Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:8501/');
    });

    test('should display basic table headers and controls', async ({ page }) => {
        const firstTable = getDataTable(page, 1);
        await expect(firstTable.getByRole('columnheader', { name: 'Numbers' })).toBeVisible();
        await expect(firstTable.getByRole('columnheader', { name: 'Letters' })).toBeVisible();
        await expect(firstTable.getByPlaceholder('Search')).toBeVisible();
        await expect(firstTable.getByLabel('Last Page')).toBeVisible();
    });

    test('should display table with sortable columns and dates', async ({ page }) => {
        const secondTable = getDataTable(page, 2);
        await expect(secondTable.getByRole('columnheader', { name: 'Numbers' }).locator('svg')).toBeVisible();
        await expect(secondTable.getByRole('columnheader', { name: 'Numbers' })).toBeVisible();
        await expect(secondTable.getByRole('cell', { name: '/30/2020' })).toBeVisible();
        await expect(secondTable.getByRole('cell', { name: '/31/2020' })).toBeVisible();
    });

    test('should handle row editing functionality', async ({ page }) => {
        const secondTable = getDataTable(page, 2);
        await expect(secondTable.getByRole('cell', { name: 'Row Edit' }).first()).toBeVisible();
        await expect(secondTable.getByLabel('Two')).toBeVisible();
        await expect(secondTable.getByLabel('One')).toBeVisible();

        await enterEditMode(secondTable);

        await expect(secondTable.getByLabel('Two').locator('svg')).toBeVisible();
        await expect(secondTable.getByLabel('Choose Date')).toBeVisible();
        await expect(secondTable.getByRole('cell', { name: '1', exact: true }).getByRole('button')).toBeVisible();
    });

    test('should handle multi-select dropdown functionality', async ({ page }) => {
        const secondTable = getDataTable(page, 2);
        await enterEditMode(secondTable);

        await secondTable.getByRole('cell', { name: 'One Two' }).locator('svg').nth(2).click();
        await expect(secondTable.getByRole('option', { name: 'One' })).toBeVisible();
        await expect(secondTable.getByRole('option', { name: 'One' }).getByRole('checkbox')).toBeVisible();
        await expect(secondTable.getByRole('option', { name: 'Two' }).getByRole('checkbox')).toBeVisible();
    });

    test('should handle date picker functionality', async ({ page }) => {
        const secondTable = getDataTable(page, 2);
        await enterEditMode(secondTable);

        await secondTable.getByLabel('Choose Date').click();
        await expect(secondTable.getByRole('dialog', { name: 'Choose Date' })).toBeVisible();
        await expect(secondTable.locator('td').filter({ hasText: '3030' }).locator('span')).toBeVisible();
    });

    test('should handle adding new values to dropdown', async ({ page }) => {
        const secondTable = getDataTable(page, 2);
        await enterEditMode(secondTable);

        await secondTable.getByRole('cell', { name: 'One Two' }).click();
        await secondTable.getByPlaceholder('Add new value').click();
        await secondTable.getByPlaceholder('Add new value').fill('Twelve');
        await secondTable.getByPlaceholder('Add new value').press('Enter');

        await expect(secondTable.getByRole('option', { name: 'Twelve' })).toBeVisible();
        await expect(secondTable.getByRole('option', { name: 'Twelve' }).getByRole('checkbox')).toBeVisible();
    });

    test('should handle editing and saving row values', async ({ page }) => {
        const secondTable = getDataTable(page, 2);
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
        await page.keyboard.press('Enter');

        // Save the changes
        await secondTable.getByLabel('Save Edit').click();

        // Verify the new value is visible
        await expect(secondTable.getByRole('cell', { name: '6' })).toBeVisible();
    });

    test('should display Till_100 column header', async ({ page }) => {
        const thirdTable = getDataTable(page, 3);
        await expect(thirdTable.getByRole('columnheader', { name: 'Till_100' })).toBeVisible();
    });
});

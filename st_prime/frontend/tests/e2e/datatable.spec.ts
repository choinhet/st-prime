import { test, expect, FrameLocator, Page } from '@playwright/test';

const getTable = async (page: Page) => {
    const currentLocator = page.locator('[data-testid="stCustomComponentV1"]');
    await currentLocator.waitFor({ state: 'visible' });
    return currentLocator.contentFrame();
};

const assertColumns = async (table: FrameLocator, columns: string[]) => {
    for (const column of columns) {
        await expect(table.getByRole('columnheader', { name: column })).toBeVisible();
    }
};

test('Test Basic DataTable Interactions', async ({ page }) => {
    await page.goto('http://localhost:8501/page_2');
    const table = await getTable(page);
    await assertColumns(table, ['Letters', 'Numbers']);
    await table.getByRole('columnheader', { name: 'Letters' }).locator('svg').click();
    await expect(table.getByRole('cell', { name: 'Aaaa' }).first()).toBeVisible();
    await table.getByRole('columnheader', { name: 'Letters' }).locator('svg').click();
    await expect(table.getByRole('cell', { name: 'Dddd' }).first()).toBeVisible();
    await expect(table.getByText('12345')).toBeVisible();
    await expect(table.getByLabel('Next Page')).toBeVisible();
    await expect(table.getByPlaceholder('Search')).toBeVisible();
    await table.getByPlaceholder('Search').click();
    await table.getByPlaceholder('Search').fill('C');
    await expect(table.getByRole('cell', { name: 'Cccc' }).first()).toBeVisible();

});

test('Test Row Editing', async ({ page }) => {
    await page.goto('http://localhost:8501/page_3');
    const table = await getTable(page);
    await assertColumns(table, ['Numbers', 'Words', 'Date', 'Lists']);
    await expect(table.getByRole('table')).toContainText('12/30/2020');
    await table.getByRole('row', { name: 'one 12/30/2020 One Two Row Edit' }).getByLabel('Row Edit').click();
    await expect(table.getByLabel('One').locator('svg')).toBeVisible();
    await expect(table.getByLabel('Two').locator('svg')).toBeVisible();
    await expect(table.getByLabel('Choose Date')).toBeVisible();
    await table.getByLabel('Choose Date').click();
    await table.getByRole('row', { name: '28 29 30 31 1 2' }).getByLabel('1', { exact: true }).click();
    await table.getByText('31', { exact: true }).click();
    await table.getByLabel('Save Edit').click();
    await expect(table.getByRole('table')).toContainText('12/31/2020');
    await table.getByRole('row', { name: 'one 12/31/2020 One Two Row Edit' }).getByLabel('Row Edit').click();
    await table.getByRole('cell', { name: 'one', exact: true }).getByRole('button').click();
    await table.getByLabel('five', { exact: true }).click();
    await table.getByRole('cell', { name: 'One Two' }).locator('svg').nth(2).click();
    await table.getByRole('searchbox').click();
    await table.getByRole('searchbox').fill('five');
    await table.getByLabel('Option List').getByRole('checkbox').check();
    await table.getByLabel('Save Edit').click();
    await expect(table.getByRole('cell', { name: 'One Two Five' }).getByLabel('Five')).toBeVisible();
    await expect(table.getByRole('cell', { name: 'five' }).first()).toBeVisible();
    await table.getByRole('row', { name: 'two 12/30/2020 Three Four Row Edit' }).getByLabel('Row Edit').click();
    await table.locator('.p-multiselect-dropdown').click();
    await table.getByPlaceholder('Add new value').click();
    await table.getByPlaceholder('Add new value').fill('Twelve');
    await table.getByPlaceholder('Add new value').press('Enter');
    await expect(table.getByLabel('Option List').getByLabel('Twelve')).toContainText('Twelve');
    await table.getByRole('cell', { name: 'Row Edit' }).first().click();
    await table.locator('.p-multiselect-dropdown').first().click();
    await table.getByRole('row', { name: '1 five 12/30/2020 Choose Date' }).getByLabel('Save Edit').click();
    await table.getByLabel('Save Edit').click();
    await expect(table.getByLabel('Twelve')).toContainText('Twelve');
});

test('Test Frozen Columns', async ({ page }) => {
    await page.goto('http://localhost:8501/page_4');
    const table = await getTable(page);
    await expect(table.getByRole('cell', { name: '1', exact: true }).first()).toBeVisible();
    await expect(table.locator('td:nth-child(5)').first()).toBeVisible();
});
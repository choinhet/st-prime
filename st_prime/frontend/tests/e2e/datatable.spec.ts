import { test, expect } from '@playwright/test';

test.describe('DataTable Component', () => {
    test('should render basic datatable', async ({ page }) => {
        await page.goto('http://localhost:8501/');
        const dataTableFrame = page.locator('[data-testid="stCustomComponentV1"]').nth(1).contentFrame();

        const numbersHeader = dataTableFrame.getByRole('columnheader', { name: 'Numbers' });
        const lettersHeader = dataTableFrame.getByRole('columnheader', { name: 'Letters' });
        const pageLabel = dataTableFrame.getByLabel('Page 1');

        await expect(numbersHeader).toBeVisible();
        await expect(lettersHeader).toBeVisible();
        await expect(pageLabel).toBeVisible();
    });

    test('should render row editor table', async ({ page }) => {
        await page.goto('http://localhost:8501/');
        const rowEditorFrame = page.locator('[data-testid="stCustomComponentV1"]').nth(2).contentFrame();

        const dateHeader = rowEditorFrame.getByRole('columnheader', { name: 'Date' });
        const listsHeader = rowEditorFrame.getByRole('columnheader', { name: 'Lists' });

        await expect(dateHeader).toBeVisible();
        await expect(listsHeader).toBeVisible();
    });
});
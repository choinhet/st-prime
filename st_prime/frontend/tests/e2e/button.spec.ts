import { test, expect } from '@playwright/test';

test.describe('Button Component', () => {
    test('should render and handle button', async ({ page }) => {
        await page.goto('http://localhost:8501/page_1');
        const buttonFrame = page.locator('[data-testid="stCustomComponentV1"]').first().contentFrame();

        const button = buttonFrame.getByRole('button', { name: 'Button 1' });
        await expect(button).toBeVisible();
        await button.click();

        const toastMessage = page.getByText('Button 1 clicked');
        await expect(toastMessage).toBeVisible();
    });
});
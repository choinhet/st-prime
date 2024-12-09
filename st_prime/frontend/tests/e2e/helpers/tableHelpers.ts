import { Frame, Page, expect } from '@playwright/test';

export const getDataTable = async (page: Page, index: number): Promise<Frame> => {
    console.log(`Getting data table at index ${index}`);
    const locator = page.locator('[data-testid="stCustomComponentV1"]').nth(index);
    const frameElementHandle = await locator.elementHandle();
    if (!frameElementHandle) {
        throw new Error(`Frame element not found at index ${index}`);
    }
    const frame = await frameElementHandle.contentFrame();
    if (!frame) {
        throw new Error(`Table frame not found at index ${index}`);
    }
    await frame.waitForLoadState('load', { timeout: 5000 });
    console.log(`Successfully got table frame at index ${index}`);
    return frame;
};

export const verifyTableHeaders = async (frame: Frame, headers: string[]) => {
    console.log('Verifying table headers:', headers);
    for (const header of headers) {
        try {
            await expect(frame.getByText(header)).toBeVisible({ timeout: 10000 });
            console.log(`✓ Header "${header}" is visible`);
        } catch (error) {
            console.log(`✗ Header "${header}" not found`);
            throw error;
        }
    }
};

export const verifyTableContent = async (frame: Frame, expectedContent: string[]) => {
    console.log('Verifying table content');
    const table = frame.getByRole('table');
    for (const content of expectedContent) {
        try {
            await expect(table).toContainText(content);
            console.log(`✓ Content "${content}" found in table`);
        } catch (error) {
            console.log(`✗ Content "${content}" not found in table`);
            throw error;
        }
    }
};

export const enterEditMode = async (frame: Frame) => {
    console.log('Entering edit mode');
    try {
        await frame.getByRole('row', { name: 'one 12/30/2020 One Two Row Edit' })
            .getByLabel('Row Edit')
            .click();
        await expect(frame.getByLabel('Cancel Edit')).toBeVisible();
        await expect(frame.getByLabel('Save Edit')).toBeVisible();
        console.log('✓ Successfully entered edit mode');
    } catch (error) {
        console.log('✗ Failed to enter edit mode');
        throw error;
    }
}; 
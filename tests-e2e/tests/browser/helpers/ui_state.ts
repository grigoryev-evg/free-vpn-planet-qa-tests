import { expect, Locator } from '@playwright/test';

export const expectEnabled = async (locator: Locator): Promise<void> => {
  await expect(locator).toBeEnabled();
};

export const expectDisabled = async (locator: Locator): Promise<void> => {
  await expect(locator).toBeDisabled();
};

export const expectChecked = async (locator: Locator): Promise<void> => {
  await expect(locator).toBeChecked();
};

export const expectPressedState = async (locator: Locator): Promise<void> => {
  await expect(locator).toHaveAttribute('class', /active|selected/i);
};

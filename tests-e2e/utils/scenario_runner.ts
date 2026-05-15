import { test } from '@playwright/test';

export const runScenarioStep = async (title: string, action: () => Promise<void>): Promise<void> => {
  await test.step(title, action);
};

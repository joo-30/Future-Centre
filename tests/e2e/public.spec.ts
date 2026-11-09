import { expect, test } from '@playwright/test';
test('public pages, program requests and readable responsive navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'صحتك تبدأ بفهمك.' })).toBeVisible();
  expect(await page.locator('main.home-body > section').count()).toBeGreaterThanOrEqual(5);
  await page.getByRole('button', { name: 'طلب اشتراك', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('textbox', { name: 'الاسم بالكامل' }).fill('عميلة اختبار للمتصفح');
  await page.getByRole('textbox', { name: 'رقم الهاتف وواتساب' }).fill('01000000002');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'إرسال طلب البرنامج' }).click();
  await expect(page.getByText('تم حفظ طلب البرنامج.')).toBeVisible();
  await page.getByRole('button', { name: 'إغلاق', exact: true }).click();
  for (const path of [
    '/programs',
    '/programs/monthly-follow-up',
    '/articles',
    '/articles/first-consultation',
    '/about',
    '/contact',
    '/privacy',
    '/appointment-policy',
  ]) {
    await page.goto(path);
    await expect(page.locator('main h1').first()).toBeVisible();
    expect(
      await page
        .locator('img')
        .evaluateAll(
          (imgs) =>
            imgs.filter(
              (i) => !(i as HTMLImageElement).complete || !(i as HTMLImageElement).naturalWidth,
            ).length,
        ),
    ).toBe(0);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'فتح القائمة' }).click();
  await page
    .getByRole('navigation', { name: 'قائمة الهاتف' })
    .getByRole('link', { name: 'برامجنا', exact: true })
    .click();
  await expect(page).toHaveURL(/\/programs$/);
});
test('guest booking on mobile persists and supports safe tracking and cancellation', async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/booking');
  await expect(page.locator('.booking-day-card, .days .day').first()).toBeVisible();
  let chosen = false;
  for (let i = 0; i < (await page.locator('.booking-day-card, .days .day').count()); i++) {
    const day = page.locator('.booking-day-card, .days .day').nth(i);
    if ((await day.textContent())?.includes('مغلق') || (await day.textContent())?.includes('عطلة')) continue;
    await day.click();
    await expect(page.locator('.slot-area')).not.toHaveAttribute('aria-busy', 'true');
    await page.waitForTimeout(180);
    const available = page.locator('.times button:not(:disabled)').first();
    if (await available.count()) {
      await available.click();
      chosen = true;
      break;
    }
  }
  expect(chosen).toBe(true);
  await page.getByRole('button', { name: 'متابعة لبياناتك' }).click();
  await expect(page.getByRole('heading', { name: 'أضيفي بيانات التواصل.' })).toBeVisible();
  await page.getByRole('textbox', { name: 'الاسم بالكامل' }).fill('حجز اختبار المتصفح');
  await page.getByRole('textbox', { name: 'رقم الهاتف', exact: true }).fill('01000000003');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'إرسال طلب الموعد', exact: true }).click();
  await expect(page).toHaveURL(/\/booking\/track#/);
  await expect(page.getByRole('heading', { name: 'طلبك تحت المراجعة.' })).toBeVisible();
  const privateUrl = page.url();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'طلبك تحت المراجعة.' })).toBeVisible();
  await page.getByRole('button', { name: 'إلغاء الموعد', exact: true }).click();
  await page.getByRole('button', { name: 'نعم، إلغاء الموعد' }).click();
  await expect(page.getByRole('heading', { name: 'ملغي', exact: true }).first()).toBeVisible();
  expect(page.url()).toBe(privateUrl);
});
test('all key page compositions fit desktop/tablet/older-phone widths', async ({ page }) => {
  for (const width of [1440, 1024, 768, 640, 430, 390, 360]) {
    await page.setViewportSize({ width, height: 940 });
    for (const route of ['/', '/programs', '/articles', '/contact', '/booking']) {
      await page.goto(route);
      await expect(page.locator('main h1').first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      );
      expect(overflow, `${route} at ${width}px`).toBe(false);
    }
  }
});

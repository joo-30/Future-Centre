import { expect, test, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
const patientPhone = '01000000081';
const patientPassword = 'Browser patient secret 123';
async function adminLogin(page: Page) {
  const credentials = await fs.readFile('.local/admin-access.txt', 'utf8');
  const phone = credentials.match(/^Phone: (.+)$/m)![1];
  const password = credentials.match(/^Password: (.+)$/m)![1];
  await page.goto('/login?next=%2Fadmin');
  await page.getByRole('textbox', { name: 'رقم الهاتف', exact: true }).fill(phone);
  await page.getByLabel('كلمة المرور', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'تسجيل الدخول', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: 'المواعيد وطلبات الحجز' })).toBeVisible();
}
test('patient registration, recovery acknowledgement, account booking, administrator decision and subscriptions', async ({
  page,
  browser,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/register');
  await page.getByRole('textbox', { name: 'الاسم بالكامل' }).fill('عميلة اختبار المرحلة الرابعة');
  await page.getByRole('textbox', { name: 'رقم الهاتف', exact: true }).fill(patientPhone);
  await page.getByLabel('كلمة المرور', { exact: true }).fill(patientPassword);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'إنشاء حساب', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'مفتاح رجوعك لحسابك.' })).toBeVisible();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'الانتقال إلى حسابي' }).click();
  await expect(page).toHaveURL(/\/account$/);
  await page.getByRole('link', { name: 'احجزي موعدًا جديدًا' }).click();
  await expect(page.locator('.booking-day-card, .days .day').first()).toBeVisible();
  let picked = false;
  for (const day of await page.locator('.booking-day-card, .days .day').all()) {
    if ((await day.textContent())?.includes('مغلق') || (await day.textContent())?.includes('عطلة')) continue;
    await day.click();
    await expect(page.locator('.slot-area')).not.toHaveAttribute('aria-busy', 'true');
    await page.waitForTimeout(120);
    const slot = page.locator('.times button:not(:disabled)').first();
    if (await slot.count()) {
      await slot.click();
      picked = true;
      break;
    }
  }
  expect(picked).toBe(true);
  await page.getByRole('button', { name: 'متابعة لبياناتك' }).click();
  await expect(page.getByRole('textbox', { name: 'الاسم بالكامل' })).toHaveValue(
    'عميلة اختبار المرحلة الرابعة',
  );
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'إرسال طلب الموعد', exact: true }).click();
  await expect(page).toHaveURL(/\/account$/);
  await expect(page.getByText('بانتظار الموافقة', { exact: true })).toBeVisible();
  const rawRef = (await page
    .locator('.member-appointment .reference-small')
    .first()
    .textContent())!;
  const reference = rawRef.match(/FC-[0-9]+/)?.[0] || rawRef.trim();
  await page.screenshot({
    path: 'artifacts/account-mobile.png',
    fullPage: true,
    animations: 'disabled',
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const admin = await context.newPage();
  await adminLogin(admin);
  await admin.getByRole('textbox', { name: 'البحث عن موعد' }).fill(reference);
  await expect(admin.locator('.console-table tbody tr')).toHaveCount(1);
  await admin
    .locator('.console-table')
    .getByRole('button', { name: 'التفاصيل', exact: true })
    .click();
  await admin.getByRole('button', { name: 'تأكيد الموعد', exact: true }).click();
  await admin.getByRole('dialog').getByRole('button', { name: 'تأكيد وحفظ القرار' }).click();
  await expect(admin.locator('.appointment-review .state-badge')).toHaveText('مؤكد');
  await admin.evaluate(() => {
    window.scrollTo(0, 0);
    (document.activeElement as HTMLElement)?.blur();
  });
  await admin.screenshot({
    path: 'artifacts/admin-appointments-desktop.png',
    fullPage: true,
    animations: 'disabled',
  });
  await page.reload();
  await expect(page.getByText('مؤكد', { exact: true })).toBeVisible();
  await admin.goto('/admin/patients');
  await admin.getByRole('button', { name: /حسابات العملاء/ }).click();
  const patient = admin
    .locator('.patients-list>div')
    .filter({ hasText: 'عميلة اختبار المرحلة الرابعة' });
  await patient.getByRole('button', { name: 'إضافة اشتراك' }).click();
  const dialog = admin.getByRole('dialog');
  await dialog.getByLabel('البرنامج', { exact: true }).selectOption('monthly');
  await dialog.getByLabel('الحالة', { exact: true }).selectOption('active');
  await dialog.getByLabel('القيمة المتفق عليها بالجنيه').fill('1300');
  await dialog.getByRole('button', { name: 'حفظ الاشتراك', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await page.goto('/account?tab=programs');
  await expect(page.locator('.subscription-card')).toBeVisible();
  await expect(page.locator('.subscription-card')).toContainText('نشط');
  await page.getByRole('button', { name: 'تسجيل الخروج', exact: true }).click();
  await expect(page).toHaveURL(/\/login/);
  expect(errors).toEqual([]);
  await context.close();
});
test('admin edits a program and article, preserves settings and fits all console widths', async ({
  page,
}) => {
  test.setTimeout(120000);
  await adminLogin(page);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const id = 'e2e-program-' + randomUUID().slice(0, 8);
  await page.goto('/admin/programs');
  await page.getByRole('button', { name: 'إضافة برنامج', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('معرّف ثابت بالإنجليزية').fill(id);
  await dialog.getByLabel('اسم البرنامج', { exact: true }).fill('برنامج اختبار الإدارة');
  await dialog.getByLabel('رابط صفحة البرنامج بالإنجليزية').fill(id);
  await dialog.getByLabel('وصف مختصر').fill('وصف تجريبي لفحص إدارة البرامج والأسعار.');
  await dialog.getByLabel('السعر بالجنيه').fill('999');
  await dialog.getByLabel('المميزات (كل ميزة في سطر)').fill('متابعة شخصية\nمراجعة الجلسات');
  await dialog
    .getByLabel('تفاصيل الصفحة (كل فقرة في سطر)')
    .fill('تفاصيل برنامج اختباري غير معتمد.');
  await dialog.getByRole('button', { name: 'حفظ البرنامج', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.locator('.admin-program').filter({ hasText: 'برنامج اختبار الإدارة' }),
  ).toBeVisible();
  await page.goto('/programs/' + id);
  await expect(
    page.getByRole('heading', { name: 'برنامج اختبار الإدارة', exact: true }),
  ).toBeVisible();
  await page.goto('/admin/articles');
  await page.getByRole('button', { name: 'إضافة مقال', exact: true }).click();
  await dialog.getByLabel('رابط المقال بالإنجليزية').fill(id);
  await dialog.getByLabel('عنوان المقال').fill('مقال اختبار الإدارة');
  await dialog.getByLabel('المقدمة', { exact: true }).fill('مقدمة تجريبية لاختبار حفظ المسودة.');
  await dialog
    .getByLabel('المحتوى (كل فقرة في سطر)')
    .fill('محتوى تجريبي للتحقق من النشر عبر لوحة الإدارة.');
  await dialog.getByRole('button', { name: 'حفظ المقال', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.locator('.admin-article-list article').filter({ hasText: 'مقال اختبار الإدارة' }),
  ).toContainText('مسودة');
  for (const width of [1440, 1024, 768, 640, 430, 390, 360]) {
    await page.setViewportSize({ width, height: 940 });
    for (const route of [
      '/admin',
      '/admin/programs',
      '/admin/patients',
      '/admin/articles',
      '/admin/schedule',
      '/admin/settings',
    ]) {
      await page.goto(route);
      await expect(page.locator('main h1').first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
        route + ' at ' + width,
      ).toBe(false);
    }
  }
  await page.goto('/admin');
  await page.getByRole('button', { name: 'فتح قائمة الإدارة' }).click();
  await page
    .getByRole('navigation', { name: 'لوحة الإدارة' })
    .getByRole('link', { name: 'البرامج والأسعار' })
    .click();
  await expect(page).toHaveURL(/\/admin\/programs$/);
  await expect(page.locator('.console-sidebar')).not.toHaveClass(/is-open/);
  await page.screenshot({
    path: 'artifacts/admin-programs-mobile.png',
    fullPage: true,
    animations: 'disabled',
  });
  expect(errors).toEqual([]);
});
test('auth screens and protected-route redirects fit compact devices', async ({ page }) => {
  for (const width of [1440, 768, 390, 360]) {
    await page.setViewportSize({ width, height: 940 });
    for (const route of ['/login', '/register', '/recover']) {
      await page.goto(route);
      await expect(page.locator('h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(
        false,
      );
    }
  }
  await page.goto('/account');
  await expect(page).toHaveURL(/\/login\?next=/);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/login');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'artifacts/login-desktop.png', fullPage: true });
});

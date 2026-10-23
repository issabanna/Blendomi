// Run against npm run dev. Uses Playwright from the development environment.
const assert = require("node:assert/strict");
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  ({
    chromium,
  } = require("/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright"));
}
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1100 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(process.env.APP_URL || "http://127.0.0.1:5173");
  assert.equal(await page.locator("html").getAttribute("dir"), "rtl");
  await page.screenshot({
    path: "/tmp/wholesale-ar-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "English", exact: true }).click();
  await page
    .getByRole("heading", { name: "Big possibilities. Better stocked." })
    .waitFor();
  await page
    .locator(".main-nav")
    .getByRole("button", { name: "All products", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "Add to order Long grain basmati rice",
      exact: true,
    })
    .first()
    .click();
  await page.locator(".cart-button").click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByText("13.00 JOD more to reach the minimum", { exact: true })
    .waitFor();
  assert(
    await dialog
      .getByRole("button", { name: "Continue to checkout" })
      .isDisabled(),
  );
  await dialog
    .getByRole("button", {
      name: "Quantity + Long grain basmati rice",
      exact: true,
    })
    .click();
  await dialog.getByRole("button", { name: "Continue to checkout" }).click();
  await page.getByLabel("Shop name", { exact: true }).fill("Test Market");
  await page.getByLabel("Contact name", { exact: true }).fill("Test Owner");
  await page.getByLabel("Jordanian mobile number", { exact: true }).fill("123");
  await page
    .getByLabel("Full delivery address", { exact: true })
    .fill("Test street, building 12");
  await page
    .getByRole("button", { name: "Place demo order", exact: true })
    .click();
  await page
    .getByRole("alert")
    .getByText(/valid Jordanian/)
    .waitFor();
  await page
    .getByLabel("Jordanian mobile number", { exact: true })
    .fill("0791234567");
  await page.getByLabel("City", { exact: true }).selectOption("aqaba");
  await page
    .getByRole("button", { name: "Place demo order", exact: true })
    .click();
  await page
    .getByRole("status")
    .getByText("This supplier does not deliver to the selected city.")
    .waitFor();
  assert.equal(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("wholesale-v1-orders") || "[]").length,
    ),
    0,
  );
  await page.getByLabel("City", { exact: true }).selectOption("amman");
  await page
    .getByRole("button", { name: "Place demo order", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "A good day for your shelves." })
    .waitFor();
  let data = await page.evaluate(() => ({
    orders: JSON.parse(localStorage.getItem("wholesale-v1-orders")),
    products: JSON.parse(localStorage.getItem("wholesale-v1-products")),
    cart: JSON.parse(localStorage.getItem("wholesale-v1-cart")),
  }));
  assert.equal(data.orders.length, 1);
  assert.equal(data.orders[0].total, 58.5);
  assert.equal(data.products.find((p) => p.id === "rice").stock, 117);
  assert.equal(data.cart.items.length, 0);
  await dialog.getByRole("button", { name: "Track your order" }).click();
  await dialog
    .getByText("Awaiting confirmation", { exact: true })
    .first()
    .waitFor();
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await page
    .locator(".shop-actions")
    .getByRole("button", { name: "Supplier workspace", exact: true })
    .click();
  for (const action of [
    "Confirm order",
    "Start preparing",
    "Dispatch order",
    "Mark delivered",
  ])
    await page.getByRole("button", { name: action, exact: true }).click();
  await page.getByText("Delivered", { exact: true }).waitFor();
  await page
    .getByRole("button", { name: "Manage products", exact: true })
    .click();
  const row = page.locator(".inventory-row").first();
  await row.getByLabel("Wholesale price (JOD)", { exact: true }).fill("20");
  await row.getByRole("button", { name: "Save changes", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: /^My orders/ }).click();
  await page.getByText("Delivered", { exact: true }).waitFor();
  await page.getByRole("button", { name: "Order again", exact: true }).click();
  await dialog.getByText("60.00 JOD", { exact: true }).waitFor();
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await page
    .locator(".main-nav")
    .getByRole("button", { name: "All products", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add to order Full cream milk", exact: true })
    .first()
    .click();
  await dialog
    .getByRole("heading", { name: "Start with a different supplier?" })
    .waitFor();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("wholesale-v1-cart")).supplier,
    ),
    "nour",
  );
  await page
    .getByRole("button", { name: "Add to order Full cream milk", exact: true })
    .first()
    .click();
  await dialog
    .getByRole("button", { name: "Replace basket & continue" })
    .click();
  await page.locator(".cart-button").click();
  assert(
    await dialog
      .getByRole("button", { name: "Continue to checkout" })
      .isDisabled(),
  );
  await dialog
    .getByRole("button", { name: "Quantity + Full cream milk", exact: true })
    .click();
  await dialog.getByRole("button", { name: "Continue to checkout" }).click();
  await page
    .getByRole("button", { name: "Place demo order", exact: true })
    .click();
  await dialog.getByRole("button", { name: "Track your order" }).click();
  await dialog
    .getByRole("button", { name: "Cancel order", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "Cancel order", exact: true })
    .click();
  data = await page.evaluate(() => ({
    orders: JSON.parse(localStorage.getItem("wholesale-v1-orders")),
    products: JSON.parse(localStorage.getItem("wholesale-v1-products")),
  }));
  assert.equal(data.orders[0].status, "cancelled");
  assert.equal(data.products.find((p) => p.id === "milk").stock, 60);
  await page
    .locator(".main-nav")
    .getByRole("button", { name: "All products", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Search suppliers or products…" })
    .fill("labneh");
  assert.equal(await page.locator(".product-card").count(), 1);
  await page.getByRole("button", { name: "العربية", exact: true }).click();
  assert.equal(await page.locator("html").getAttribute("dir"), "rtl");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page
    .locator(".main-nav")
    .getByRole("button", { name: "اكتشف الموردين", exact: true })
    .click();
  assert(
    !(await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    )),
    "Arabic mobile overflow",
  );
  await page.screenshot({
    path: "/tmp/wholesale-ar-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "English", exact: true }).click();
  assert(
    !(await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    )),
    "English mobile overflow",
  );
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.screenshot({
    path: "/tmp/wholesale-en-desktop.png",
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  console.log(
    "PASS: Arabic/English, MOQ, minimum order value, invalid phone, delivery coverage, order placement, stock reservation, supplier fulfillment, inventory editing, reload persistence, current-price reorder, single-supplier replacement, cancellation/restock, search, mobile navigation, and RTL/LTR overflow. No runtime errors.",
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

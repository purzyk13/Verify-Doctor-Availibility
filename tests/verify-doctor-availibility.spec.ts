/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { expect, Locator, Page, test } from "@playwright/test";
import { appendToSheet } from "../src/appendToSheet";

// Funkcja do sprawdzania dostępności lekarza
async function verifyDoctorAvailibility(
  page: Page,
  doctorModule: Locator,
  doctorName: string,
): Promise<string> {
  const doctorCounter = await doctorModule.count();
  const iframe = page.frameLocator(".mydr-pp-root iframe");
  const iframeMessage = iframe.locator(".no-terms__content");
  let result = "";

  for (let i = 0; i < doctorCounter; i++) {
    const targetDoctor = doctorModule.nth(i);
    const doctorText = await targetDoctor.locator(".title").textContent();

    if (doctorText?.trim() === doctorName) {
      await targetDoctor.locator("button").click();
      // await iframe.locator(".dates__btn--next").click();
      await iframe.locator(".app-loader").waitFor({ state: "hidden" });

      await expect(iframe.locator(".facility-item")).toBeVisible();
      if (await iframeMessage.isVisible()) {
        result += await iframeMessage.textContent();
      } else {
        for (const date of await iframe
          .locator(".dates .dates__terms .term-item")
          .all()) {
          const text = await date.textContent();
          const match = text?.match(/\(\d+\)/);

          if (text && match) {
            result += text.trim() + "\n"; // Only use text if it's not null
          }
        }
      }
      break; // Znaleźliśmy lekarza, więc możemy przerwać pętlę
    }
  }

  return result.trim();
}

test.only("GO to site", async ({ page }) => {
  const url = process.env.URL;
  const doctorName = process.env.DOCTOR;

  if (!url || !doctorName) {
    throw new Error("url or doctorName environment variables are not defined");
  }

  await page.goto(url);
  const dateTime = new Date().toLocaleString();
  const doctorModule = page.locator(".lekarz");

  // Wywołanie funkcji i wyświetlenie resultu
  const availibilityInfo =
    String(dateTime) +
    ", " +
    (await verifyDoctorAvailibility(page, doctorModule, doctorName));
  console.log(await availibilityInfo);
  // const result = availibilityInfo; // <- np. result scrape'u
  await appendToSheet(await availibilityInfo);
  page.close();
});

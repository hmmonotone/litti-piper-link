
import puppeteer, { Page } from 'puppeteer';
import { Transaction } from '../types/transaction';

export interface AutomationConfig {
  portalUrl: string;
  username: string;
  password: string;
  headless?: boolean;
  timeout?: number;
}

export interface AutomationResult {
  success: boolean;
  orderId?: string;
  error?: string;
  screenshot?: string;
}

export class UrbanPiperAutomation {
  private config: AutomationConfig;

  constructor(config: AutomationConfig) {
    this.config = {
      headless: true,
      timeout: 30000,
      ...config
    };
  }

  async createOrder(transaction: Transaction): Promise<AutomationResult> {
    let browser;
    let page;

    try {
      // Launch browser
      browser = await puppeteer.launch({
        headless: this.config.headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });

      // Set timeout
      page.setDefaultTimeout(this.config.timeout);

      // Navigate to portal
      console.log('Navigating to Urban Piper portal...');
      await page.goto(this.config.portalUrl);

      // Login
      await this.login(page);

      // Navigate to order creation
      await this.navigateToOrderCreation(page);

      // Fill order details
      await this.fillOrderDetails(page, transaction);

      // Submit order
      const orderId = await this.submitOrder(page);

      // Take screenshot for verification
      const screenshot = await page.screenshot({ 
        encoding: 'base64',
        fullPage: true 
      });

      return {
        success: true,
        orderId,
        screenshot
      };

    } catch (error) {
      console.error('Automation error:', error);
      
      // Take screenshot on error
      let screenshot;
      if (page) {
        try {
          screenshot = await page.screenshot({ 
            encoding: 'base64',
            fullPage: true 
          });
        } catch (screenshotError) {
          console.error('Screenshot error:', screenshotError);
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        screenshot
      };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  private async login(page: Page): Promise<void> {
    console.log('Logging in...');
    
    // Wait for login form
    await page.waitForSelector('#username, [name="username"], [type="email"]');
    await page.waitForSelector('#password, [name="password"], [type="password"]');

    // Fill credentials
    await page.type('#username, [name="username"], [type="email"]', this.config.username);
    await page.type('#password, [name="password"], [type="password"]', this.config.password);

    // Click login button
    await page.click('button[type="submit"], .login-button, #login-btn');

    // Wait for login to complete
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    console.log('Login successful');
  }

  private async navigateToOrderCreation(page: Page): Promise<void> {
    console.log('Navigating to order creation...');
    
    // Look for common order creation navigation elements
    const orderCreationSelectors = [
      'a[href*="order"]',
      'button:contains("New Order")',
      '.new-order-btn',
      '#create-order'
    ];

    for (const selector of orderCreationSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        await page.click(selector);
        break;
      } catch (error) {
        console.log(`Selector ${selector} not found, trying next...`);
      }
    }

    // Wait for order form to load
    await page.waitForSelector('form, .order-form', { timeout: 10000 });
    console.log('Order creation page loaded');
  }

  private async fillOrderDetails(page: Page, transaction: Transaction): Promise<void> {
    console.log('Filling order details...');

    // Fill item quantities
    if (transaction.fullPlate > 0) {
      await this.fillQuantity(page, 'full-plate', transaction.fullPlate);
    }

    if (transaction.halfPlate > 0) {
      await this.fillQuantity(page, 'half-plate', transaction.halfPlate);
    }

    if (transaction.water > 0) {
      await this.fillQuantity(page, 'water', transaction.water);
    }

    if (transaction.packing > 0) {
      await this.fillQuantity(page, 'packing', transaction.packing);
    }

    // Set order date if needed
    await this.setOrderDate(page, transaction.date);

    console.log('Order details filled');
  }

  private async fillQuantity(page: Page, itemType: string, quantity: number): Promise<void> {
    const selectors = [
      `#${itemType}-qty`,
      `[name="${itemType}"]`,
      `input[data-item="${itemType}"]`,
      `.${itemType}-input`
    ];

    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        await page.clear(selector);
        await page.type(selector, quantity.toString());
        console.log(`Set ${itemType} quantity to ${quantity}`);
        return;
      } catch (error) {
        console.log(`Selector ${selector} not found for ${itemType}`);
      }
    }

    console.warn(`Could not find input for ${itemType}`);
  }

  private async setOrderDate(page: Page, date: string): Promise<void> {
    try {
      const dateSelectors = [
        'input[type="date"]',
        '#order-date',
        '[name="date"]'
      ];

      for (const selector of dateSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 3000 });
          await page.evaluate((sel: string, dateValue: string) => {
            const element = document.querySelector(sel) as HTMLInputElement;
            if (element) {
              element.value = dateValue;
              element.dispatchEvent(new Event('change', { bubbles: true }));
            }
          }, selector, date);
          console.log(`Set order date to ${date}`);
          return;
        } catch (error) {
          console.log(`Date selector ${selector} not found`);
        }
      }
    } catch (error) {
      console.log('Could not set order date:', error);
    }
  }

  private async submitOrder(page: Page): Promise<string> {
    console.log('Submitting order...');

    // Click submit button
    const submitSelectors = [
      'button[type="submit"]',
      '.submit-order',
      '#submit-btn',
      'button:contains("Submit")',
      'button:contains("Create Order")'
    ];

    for (const selector of submitSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        await page.click(selector);
        break;
      } catch (error) {
        console.log(`Submit selector ${selector} not found`);
      }
    }

    // Wait for order confirmation
    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // Extract order ID from confirmation page
    const orderId = await page.evaluate(() => {
      const orderIdElements = [
        document.querySelector('.order-id'),
        document.querySelector('#order-number'),
        document.querySelector('[data-order-id]')
      ];

      for (const element of orderIdElements) {
        if (element && element.textContent) {
          return element.textContent.trim();
        }
      }

      // Fallback: look for patterns in the page text
      const pageText = document.body.innerText;
      const orderIdMatch = pageText.match(/Order\s+(?:ID|#)?\s*:?\s*(\w+)/i);
      return orderIdMatch ? orderIdMatch[1] : `AUTO-${Date.now()}`;
    });

    console.log(`Order created with ID: ${orderId}`);
    return orderId;
  }
}

// Default automation service instance
export const urbanPiperAutomation = new UrbanPiperAutomation({
  portalUrl: 'https://prime.urbanpiper.com', // Update with actual portal URL
  username: '', // Will be set by user
  password: '', // Will be set by user
  headless: true
});


import { Transaction } from '../types/transaction';
import { Builder, By, until, WebDriver, Key } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';

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
  private driver: WebDriver | null = null;

  constructor(config: AutomationConfig) {
    this.config = {
      headless: true,
      timeout: 30000,
      ...config
    };
  }

  private async initializeDriver(): Promise<WebDriver> {
    const options = new chrome.Options();
    
    if (this.config.headless) {
      options.addArguments('--headless');
    }
    
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-web-security');
    options.addArguments('--disable-features=VizDisplayCompositor');
    
    this.driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
    
    await this.driver.manage().setTimeouts({
      implicit: this.config.timeout || 30000,
      pageLoad: this.config.timeout || 30000,
      script: this.config.timeout || 30000
    });
    
    return this.driver;
  }

  private async login(): Promise<void> {
    if (!this.driver) throw new Error('Driver not initialized');
    
    console.log('Navigating to Urban Piper login page...');
    await this.driver.get(this.config.portalUrl);
    
    // Wait for login form
    await this.driver.wait(until.elementLocated(By.css('input[type="email"], input[name="username"]')), 10000);
    
    // Enter username
    const usernameField = await this.driver.findElement(By.css('input[type="email"], input[name="username"]'));
    await usernameField.clear();
    await usernameField.sendKeys(this.config.username);
    
    // Enter password
    const passwordField = await this.driver.findElement(By.css('input[type="password"], input[name="password"]'));
    await passwordField.clear();
    await passwordField.sendKeys(this.config.password);
    
    // Submit form
    const loginButton = await this.driver.findElement(By.css('button[type="submit"], .login-button, .btn-login'));
    await loginButton.click();
    
    // Wait for successful login (look for dashboard elements)
    await this.driver.wait(until.elementLocated(By.css('.dashboard, .main-content, .pos-interface')), 15000);
    console.log('Successfully logged in to Urban Piper');
  }

  private async navigateToOrderCreation(): Promise<void> {
    if (!this.driver) throw new Error('Driver not initialized');
    
    console.log('Navigating to order creation page...');
    
    // Look for "New Order" or similar button
    const newOrderButton = await this.driver.wait(
      until.elementLocated(By.css('.new-order, .create-order, [data-testid="new-order"]')), 
      10000
    );
    await newOrderButton.click();
    
    // Wait for order creation interface
    await this.driver.wait(until.elementLocated(By.css('.order-interface, .pos-interface, .menu-items')), 10000);
    console.log('Order creation interface loaded');
  }

  private async addMenuItem(itemName: string, quantity: number): Promise<void> {
    if (!this.driver) throw new Error('Driver not initialized');
    
    console.log(`Adding ${quantity}x ${itemName} to order...`);
    
    // Search for the menu item
    const searchBox = await this.driver.findElement(By.css('input[placeholder*="Search"], .search-input'));
    await searchBox.clear();
    await searchBox.sendKeys(itemName);
    await this.driver.sleep(1000); // Wait for search results
    
    // Click on the first matching item
    const menuItem = await this.driver.wait(
      until.elementLocated(By.css('.menu-item, .product-item, .item-card')), 
      5000
    );
    await menuItem.click();
    
    // Update quantity if needed
    if (quantity > 1) {
      const quantityInput = await this.driver.findElement(By.css('input[type="number"], .quantity-input'));
      await quantityInput.clear();
      await quantityInput.sendKeys(quantity.toString());
    }
    
    // Add to cart
    const addButton = await this.driver.findElement(By.css('.add-to-cart, .add-item, .btn-add'));
    await addButton.click();
    
    console.log(`Added ${quantity}x ${itemName} to cart`);
  }

  private async processOrder(transaction: Transaction): Promise<string> {
    if (!this.driver) throw new Error('Driver not initialized');
    
    console.log('Processing order for transaction:', transaction.id);
    
    // Add full plates
    if (transaction.fullPlate > 0) {
      await this.addMenuItem('Stall Litti Chokha', transaction.fullPlate);
    }
    
    // Add half plates
    if (transaction.halfPlate > 0) {
      await this.addMenuItem('Stall Litti Chokha Half', transaction.halfPlate);
    }
    
    // Add water
    if (transaction.water > 0) {
      await this.addMenuItem('Water Bottle', transaction.water);
    }
    
    // Add packing charges
    if (transaction.packing > 0) {
      await this.addMenuItem('Packing Charges', transaction.packing);
    }
    
    // Proceed to checkout
    const checkoutButton = await this.driver.findElement(By.css('.checkout, .proceed-to-pay, .btn-checkout'));
    await checkoutButton.click();
    
    // Wait for payment interface
    await this.driver.wait(until.elementLocated(By.css('.payment-interface, .payment-methods')), 10000);
    
    // Select cash payment
    const cashPayment = await this.driver.findElement(By.css('.payment-cash, .cash-payment, [data-payment="cash"]'));
    await cashPayment.click();
    
    // Enter payment amount
    const amountInput = await this.driver.findElement(By.css('input[name="amount"], .amount-input'));
    await amountInput.clear();
    await amountInput.sendKeys(transaction.paidAmount.toString());
    
    // Complete payment
    const payButton = await this.driver.findElement(By.css('.pay-now, .complete-payment, .btn-pay'));
    await payButton.click();
    
    // Wait for order confirmation
    await this.driver.wait(until.elementLocated(By.css('.order-success, .order-confirmation')), 10000);
    
    // Extract order ID
    const orderIdElement = await this.driver.findElement(By.css('.order-id, .order-number'));
    const orderId = await orderIdElement.getText();
    
    console.log('Order created successfully:', orderId);
    return orderId.replace(/\D/g, ''); // Extract only numbers
  }

  private async takeScreenshot(): Promise<string> {
    if (!this.driver) throw new Error('Driver not initialized');
    
    const screenshot = await this.driver.takeScreenshot();
    return screenshot;
  }

  private async cleanup(): Promise<void> {
    if (this.driver) {
      await this.driver.quit();
      this.driver = null;
    }
  }

  async createOrder(transaction: Transaction): Promise<AutomationResult> {
    try {
      console.log('Starting Urban Piper automation for transaction:', transaction.id);
      
      // Initialize Selenium WebDriver
      await this.initializeDriver();
      
      // Login to Urban Piper
      await this.login();
      
      // Navigate to order creation
      await this.navigateToOrderCreation();
      
      // Process the order
      const orderId = await this.processOrder(transaction);
      
      // Take screenshot for verification
      const screenshot = await this.takeScreenshot();
      
      return {
        success: true,
        orderId,
        screenshot
      };
      
    } catch (error) {
      console.error('Urban Piper automation failed:', error);
      
      // Take screenshot on error
      let screenshot: string | undefined;
      try {
        screenshot = await this.takeScreenshot();
      } catch (screenshotError) {
        console.error('Failed to take error screenshot:', screenshotError);
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown automation error',
        screenshot
      };
      
    } finally {
      await this.cleanup();
    }
  }
}

// Default automation service instance
export const urbanPiperAutomation = new UrbanPiperAutomation({
  portalUrl: 'https://prime.urbanpiper.com',
  username: '',
  password: '',
  headless: true
});

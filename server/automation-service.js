
// This is the actual working Selenium automation service
// Run this as a separate Node.js server

const express = require('express');
const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

class SeleniumUrbanPiperAutomation {
  constructor(config) {
    this.config = config;
    this.driver = null;
  }

  async initializeDriver() {
    const options = new chrome.Options();
    
    if (this.config.headless) {
      options.addArguments('--headless');
    }
    
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1920,1080');

    this.driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    await this.driver.manage().setTimeouts({ implicit: this.config.timeout });
  }

  async login() {
    console.log('Navigating to Urban Piper login page...');
    await this.driver.get(this.config.portalUrl);

    // Wait for login form
    await this.driver.wait(until.elementLocated(By.name('username')), 10000);
    
    // Enter credentials
    await this.driver.findElement(By.name('username')).sendKeys(this.config.username);
    await this.driver.findElement(By.name('password')).sendKeys(this.config.password);
    
    // Submit login
    await this.driver.findElement(By.css('button[type="submit"]')).click();
    
    // Wait for dashboard
    await this.driver.wait(until.elementLocated(By.css('.dashboard, .pos-dashboard')), 10000);
    console.log('Login successful');
  }

  async createOrder(transaction) {
    try {
      console.log(`Creating order for transaction: ${transaction.id}`);
      
      // Navigate to POS or order creation page
      await this.driver.get(`${this.config.portalUrl}/pos`);
      
      // Wait for POS interface
      await this.driver.wait(until.elementLocated(By.css('.pos-interface, .order-interface')), 10000);
      
      // Add items based on transaction
      if (transaction.fullPlate > 0) {
        await this.addMenuItem('Full Plate', transaction.fullPlate);
      }
      
      if (transaction.halfPlate > 0) {
        await this.addMenuItem('Half Plate', transaction.halfPlate);
      }
      
      if (transaction.water > 0) {
        await this.addMenuItem('Water', transaction.water);
      }
      
      if (transaction.packing > 0) {
        await this.addMenuItem('Packing', transaction.packing);
      }
      
      // Complete the order
      const orderId = await this.completeOrder(transaction.paidAmount);
      
      // Take screenshot
      const screenshot = await this.takeScreenshot();
      
      return {
        success: true,
        orderId,
        screenshot
      };
      
    } catch (error) {
      console.error('Error creating order:', error);
      const screenshot = await this.takeScreenshot();
      
      return {
        success: false,
        error: error.message,
        screenshot
      };
    }
  }

  async addMenuItem(itemName, quantity) {
    // Search for menu item
    const searchBox = await this.driver.findElement(By.css('input[placeholder*="Search"], .search-input'));
    await searchBox.clear();
    await searchBox.sendKeys(itemName);
    await searchBox.sendKeys(Key.ENTER);
    
    // Wait for search results
    await this.driver.sleep(1000);
    
    // Click on the item
    const menuItem = await this.driver.wait(
      until.elementLocated(By.css('.menu-item, .product-item')), 
      5000
    );
    
    // Add quantity
    for (let i = 0; i < quantity; i++) {
      await menuItem.click();
      await this.driver.sleep(500);
    }
    
    console.log(`Added ${quantity} x ${itemName}`);
  }

  async completeOrder(totalAmount) {
    // Click checkout/complete order button
    const checkoutBtn = await this.driver.findElement(By.css('.checkout-btn, .complete-order'));
    await checkoutBtn.click();
    
    // Handle payment
    await this.driver.wait(until.elementLocated(By.css('.payment-section')), 5000);
    
    // Select cash payment
    const cashBtn = await this.driver.findElement(By.css('.payment-cash, [data-payment="cash"]'));
    await cashBtn.click();
    
    // Enter amount
    const amountInput = await this.driver.findElement(By.css('.amount-input, input[type="number"]'));
    await amountInput.sendKeys(totalAmount.toString());
    
    // Confirm payment
    const confirmBtn = await this.driver.findElement(By.css('.confirm-payment, .pay-btn'));
    await confirmBtn.click();
    
    // Wait for order confirmation and extract order ID
    await this.driver.wait(until.elementLocated(By.css('.order-confirmation, .order-id')), 10000);
    
    const orderIdElement = await this.driver.findElement(By.css('.order-id, .order-number'));
    const orderId = await orderIdElement.getText();
    
    console.log(`Order created with ID: ${orderId}`);
    return orderId;
  }

  async takeScreenshot() {
    try {
      const screenshot = await this.driver.takeScreenshot();
      const filename = `screenshot_${Date.now()}.png`;
      const filepath = path.join(__dirname, 'screenshots', filename);
      
      // Ensure screenshots directory exists
      if (!fs.existsSync(path.dirname(filepath))) {
        fs.mkdirSync(path.dirname(filepath), { recursive: true });
      }
      
      fs.writeFileSync(filepath, screenshot, 'base64');
      return filename;
    } catch (error) {
      console.error('Error taking screenshot:', error);
      return null;
    }
  }

  async cleanup() {
    if (this.driver) {
      await this.driver.quit();
    }
  }
}

// API endpoints
app.post('/api/automation', async (req, res) => {
  const { action, transaction, transactions, config } = req.body;
  
  const automation = new SeleniumUrbanPiperAutomation(config);
  
  try {
    await automation.initializeDriver();
    await automation.login();
    
    if (action === 'createOrder') {
      const result = await automation.createOrder(transaction);
      res.json(result);
    } else if (action === 'createOrderBatch') {
      const results = [];
      for (const trans of transactions) {
        const result = await automation.createOrder(trans);
        results.push(result);
        // Add delay between orders
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      res.json(results);
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
    
  } catch (error) {
    console.error('Automation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  } finally {
    await automation.cleanup();
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Automation service running on port ${PORT}`);
});

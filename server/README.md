
# Urban Piper Automation Server

This is the backend service that handles actual Selenium automation for Urban Piper order creation.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Install Chrome and ChromeDriver:
```bash
# On Ubuntu/Debian
sudo apt-get install google-chrome-stable

# Install ChromeDriver
sudo apt-get install chromium-chromedriver
```

3. Start the server:
```bash
npm start
```

## Configuration

Update the frontend automation service to point to your server:

```javascript
export const urbanPiperAutomation = new UrbanPiperAutomation({
  portalUrl: 'https://prime.urbanpiper.com',
  username: 'your-username',
  password: 'your-password',
  headless: true,
  serverUrl: 'http://localhost:3001/api/automation' // Your server URL
});
```

## API Endpoints

- `POST /api/automation` - Create orders via Selenium automation

## Usage

The frontend will now make API calls to this backend service which will:
1. Initialize Chrome WebDriver
2. Login to Urban Piper
3. Navigate to POS interface
4. Add menu items based on transaction data
5. Complete payment and checkout
6. Return order ID and screenshot

This is actual working code that will perform real automation.

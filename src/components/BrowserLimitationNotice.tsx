
import React from 'react';
import { AlertCircle, Server, Chrome } from 'lucide-react';

const BrowserLimitationNotice: React.FC = () => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div>
          <h4 className="font-semibold text-yellow-800 mb-2">Browser Automation Limitation</h4>
          <p className="text-sm text-yellow-700 mb-3">
            Puppeteer-based automation cannot run directly in the browser due to security restrictions. 
            Browser environments don't have access to Node.js APIs required for headless browser automation.
          </p>
          <div className="space-y-2">
            <h5 className="font-medium text-yellow-800">Alternative Solutions:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <Server className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div>
                  <strong>Server-Side Implementation:</strong>
                  <p className="text-yellow-600">Deploy automation on a Node.js server with API endpoints</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Chrome className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div>
                  <strong>Browser Extension:</strong>
                  <p className="text-yellow-600">Create a Chrome extension with appropriate permissions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserLimitationNotice;

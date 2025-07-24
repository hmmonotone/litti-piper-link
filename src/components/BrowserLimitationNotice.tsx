
import React from 'react';
import { AlertCircle, Server, Chrome, CheckCircle } from 'lucide-react';

const BrowserLimitationNotice: React.FC = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
        <div>
          <h4 className="font-semibold text-blue-800 mb-2">Selenium WebDriver Integration</h4>
          <p className="text-sm text-blue-700 mb-3">
            This application now uses Selenium WebDriver for Urban Piper automation. 
            Selenium provides better browser compatibility and can work in various environments.
          </p>
          <div className="space-y-2">
            <h5 className="font-medium text-blue-800">Requirements:</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-start gap-2">
                <Chrome className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <strong>Chrome Browser:</strong>
                  <p className="text-blue-600">Requires Chrome browser to be installed</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Server className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <strong>WebDriver:</strong>
                  <p className="text-blue-600">ChromeDriver will be automatically managed</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 text-sm text-blue-600">
            <strong>Note:</strong> Configure your Urban Piper credentials in the settings above to start automation.
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserLimitationNotice;

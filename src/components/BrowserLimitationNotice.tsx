
import React from 'react';
import { AlertTriangle, Server, Code } from 'lucide-react';

const BrowserLimitationNotice: React.FC = () => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <Server className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold text-blue-800 mb-2">Server-Side Automation Required</h4>
          <div className="text-sm text-blue-700 space-y-2">
            <p>
              This automation service requires a backend server to run Selenium WebDriver.
              The server code has been generated for you.
            </p>
            
            <div className="mt-3">
              <p className="font-medium mb-1">To enable automation:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li className="flex items-center gap-2">
                  <Server className="h-3 w-3" />
                  <span>Run the Node.js server from the /server directory</span>
                </li>
                <li className="flex items-center gap-2">
                  <Code className="h-3 w-3" />
                  <span>Install Chrome and ChromeDriver on your server</span>
                </li>
                <li className="flex items-center gap-2">
                  <Server className="h-3 w-3" />
                  <span>Configure your credentials in the settings</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserLimitationNotice;

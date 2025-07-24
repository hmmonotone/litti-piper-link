
import React from 'react';
import { AlertTriangle, Server, Code } from 'lucide-react';

const BrowserLimitationNotice: React.FC = () => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold text-amber-800 mb-2">Browser Automation Limitations</h4>
          <div className="text-sm text-amber-700 space-y-2">
            <p>
              Direct browser automation (like Selenium) cannot run in web applications due to security restrictions.
              Currently, the automation will simulate order creation for demonstration purposes.
            </p>
            
            <div className="mt-3">
              <p className="font-medium mb-1">For production use, consider:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li className="flex items-center gap-2">
                  <Server className="h-3 w-3" />
                  <span>Server-side automation with Node.js + Selenium</span>
                </li>
                <li className="flex items-center gap-2">
                  <Code className="h-3 w-3" />
                  <span>Direct API integration with Urban Piper</span>
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

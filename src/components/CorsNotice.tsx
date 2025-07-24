
import React from 'react';
import { AlertCircle, ExternalLink, Info } from 'lucide-react';

const CorsNotice: React.FC = () => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-yellow-800 mb-2">CORS Configuration Required</h4>
          <div className="text-sm text-yellow-700 space-y-2">
            <p>
              The Urban Piper API requires CORS configuration to work from the browser. 
              Here are a few solutions:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                <strong>Temporary Solution:</strong> Visit{' '}
                <a 
                  href="https://cors-anywhere.herokuapp.com/corsdemo" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1"
                >
                  CORS Anywhere Demo
                  <ExternalLink className="h-3 w-3" />
                </a>
                {' '}and click "Request temporary access"
              </li>
              <li>
                <strong>Production Solution:</strong> Implement a backend proxy server to handle API calls
              </li>
              <li>
                <strong>Alternative:</strong> Use a browser extension like "CORS Unblock" for development
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorsNotice;

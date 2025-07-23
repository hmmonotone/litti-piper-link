import * as XLSX from 'xlsx';
import { Transaction } from '../types/transaction';

// Menu prices in Indian Rupees
const MENU_PRICES = {
  fullPlate: 89,
  halfPlate: 49,
  water: 10,
  packing: 5
};

export const processExcelFile = async (file: File): Promise<Transaction[]> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
    
    console.log('Raw Excel data:', jsonData);
    
    const transactions: Transaction[] = [];
    
    // Find the actual transaction data header row
    // Look for "Transaction Date" or "Date" in the first column
    let dataStartIndex = -1;
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      if (row && row[0] && typeof row[0] === 'string') {
        const firstCell = row[0].toString().toLowerCase();
        if (firstCell.includes('transaction date') || 
            (firstCell.includes('date') && row[1] && row[1].toString().toLowerCase().includes('particular'))) {
          dataStartIndex = i;
          console.log('Found transaction header at index:', i);
          break;
        }
      }
    }
    
    if (dataStartIndex === -1) {
      throw new Error('Could not find transaction data section in Excel file');
    }
    
    console.log('Transaction data starts at index:', dataStartIndex);
    console.log('Header row:', jsonData[dataStartIndex]);
    
    // Process transactions starting from the row after header
    for (let i = dataStartIndex + 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      
      // Skip empty rows or rows without proper data
      if (!row || row.length < 5 || !row[0] || !row[1]) continue;
      
      const date = row[0]?.toString() || '';
      const particulars = row[1]?.toString() || '';
      const withdrawal = parseFloat(row[2]?.toString().replace(/[^\d.-]/g, '') || '0') || 0;
      const deposit = parseFloat(row[3]?.toString().replace(/[^\d.-]/g, '') || '0') || 0;
      const balance = parseFloat(row[4]?.toString().replace(/[^\d.-]/g, '') || '0') || 0;
      
      console.log(`Row ${i}: Date=${date}, Particulars=${particulars}, Deposit=${deposit}, Withdrawal=${withdrawal}`);
      
      // Process only credit transactions (deposits > 0) that contain "dLITTIc"
      if (deposit > 0 && particulars.toLowerCase().includes('dlittlc')) {
        console.log(`Processing dLITTIc credit transaction: ${particulars} - ₹${deposit}`);
        
        // Parse order details from transaction amount
        const orderDetails = parseOrderFromAmount(deposit);
        
        if (orderDetails) {
          const expectedCost = calculateExpectedCost(orderDetails);
          let adjustment = deposit - expectedCost;
          
          // Apply water adjustment if overpaid by more than ₹10
          let finalOrder = { ...orderDetails };
          if (adjustment > 10) {
            const extraWater = Math.floor(adjustment / 10);
            finalOrder.water += extraWater;
            adjustment = adjustment % 10;
          }
          
          const transaction: Transaction = {
            id: `txn-${Date.now()}-${i}`,
            date,
            valueDate: date, // Using same date as value date
            details: particulars,
            paidAmount: deposit,
            fullPlate: finalOrder.fullPlate,
            halfPlate: finalOrder.halfPlate,
            water: finalOrder.water,
            packing: finalOrder.packing,
            expectedCost: calculateExpectedCost(finalOrder),
            adjustment,
            status: 'success'
          };
          
          transactions.push(transaction);
          console.log('Added transaction:', transaction);
        }
      }
    }
    
    console.log(`Processed ${transactions.length} dLITTIc credit transactions`);
    return transactions;
    
  } catch (error) {
    console.error('Error processing Excel file:', error);
    throw new Error('Failed to process Excel file. Please ensure it\'s a valid IDFC First Bank statement.');
  }
};

const parseOrderFromAmount = (paidAmount: number): any | null => {
  console.log(`Parsing order from amount: ₹${paidAmount}`);
  
  // Start with the most expensive items first (full plates)
  let remainingAmount = paidAmount;
  let fullPlate = 0;
  let halfPlate = 0;
  let water = 0;
  let packing = 0;
  
  // Calculate full plates
  if (remainingAmount >= MENU_PRICES.fullPlate) {
    fullPlate = Math.floor(remainingAmount / MENU_PRICES.fullPlate);
    remainingAmount = remainingAmount % MENU_PRICES.fullPlate;
  }
  
  // Calculate half plates
  if (remainingAmount >= MENU_PRICES.halfPlate) {
    halfPlate = Math.floor(remainingAmount / MENU_PRICES.halfPlate);
    remainingAmount = remainingAmount % MENU_PRICES.halfPlate;
  }
  
  // Calculate water
  if (remainingAmount >= MENU_PRICES.water) {
    water = Math.floor(remainingAmount / MENU_PRICES.water);
    remainingAmount = remainingAmount % MENU_PRICES.water;
  }
  
  // Calculate packing
  if (remainingAmount >= MENU_PRICES.packing) {
    packing = Math.floor(remainingAmount / MENU_PRICES.packing);
    remainingAmount = remainingAmount % MENU_PRICES.packing;
  }
  
  console.log(`Parsed order: Full=${fullPlate}, Half=${halfPlate}, Water=${water}, Packing=${packing}, Remaining=₹${remainingAmount}`);
  
  return {
    fullPlate,
    halfPlate,
    water,
    packing
  };
};

const calculateExpectedCost = (orderDetails: any): number => {
  return (
    orderDetails.fullPlate * MENU_PRICES.fullPlate +
    orderDetails.halfPlate * MENU_PRICES.halfPlate +
    orderDetails.water * MENU_PRICES.water +
    orderDetails.packing * MENU_PRICES.packing
  );
};

export const processRealExcelFile = async (file: File): Promise<Transaction[]> => {
  return processExcelFile(file);
};

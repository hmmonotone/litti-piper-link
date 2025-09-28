import * as XLSX from 'xlsx';
import { Transaction } from '../types/transaction';

// Menu prices in Indian Rupees
const MENU_PRICES = {
  fullPlate: 89,
  halfPlate: 49,
  water: 10,
  packing: 5
};

export const processExcelFile = async (
  file: File, 
  startDate?: Date | null, 
  endDate?: Date | null,
  keyword: string = 'dlittic'
): Promise<Transaction[]> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
    
    console.log('Raw Excel data:', jsonData);
    
    const transactions: Transaction[] = [];
    
    // Find the actual transaction data header row
    // Look for "Transaction Date" in the first column
    let dataStartIndex = -1;
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      if (row && row[0] && typeof row[0] === 'string') {
        const firstCell = row[0].toString().toLowerCase();
        if (firstCell.includes('transaction date')) {
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
      if (!row || row.length < 7 || !row[0] || !row[2]) continue;
      
      const transactionDate = row[0]?.toString() || '';
      const valueDate = row[1]?.toString() || '';
      const particulars = row[2]?.toString() || '';
      const debit = parseFloat(row[4]?.toString().replace(/[^\d.-]/g, '') || '0') || 0;
      const credit = parseFloat(row[5]?.toString().replace(/[^\d.-]/g, '') || '0') || 0;
      const balance = parseFloat(row[6]?.toString().replace(/[^\d.-]/g, '') || '0') || 0;
      
      console.log(`Row ${i}: TransactionDate=${transactionDate}, Particulars=${particulars}, Credit=${credit}, Debit=${debit}`);
      
      // Check if transaction date is valid (not empty and not just a date header)
      const isValidDate = transactionDate && 
                         transactionDate.trim() !== '' && 
                         !transactionDate.toLowerCase().includes('transaction date');
      
      // Parse transaction date for filtering
      let transactionDateObj: Date | null = null;
      if (isValidDate) {
        // Try to parse the date from the transaction
        transactionDateObj = parseTransactionDate(transactionDate);
      }
      
      // Apply date range filter if dates are provided
      let isInDateRange = true;
      if (transactionDateObj && (startDate || endDate)) {
        if (startDate && transactionDateObj < startDate) {
          isInDateRange = false;
        }
        if (endDate && transactionDateObj > endDate) {
          isInDateRange = false;
        }
      }
      
      // Filter conditions:
      // 1. Must have a valid transaction date
      // 2. Must be a credit transaction (credit > 0)
      // 3. Must contain the specified keyword at the end of particulars
      // 4. Must be within the specified date range (if provided)
      if (isValidDate && 
          credit > 0 && 
          particulars.trim().endsWith(keyword) &&
          isInDateRange) {
        console.log(`Processing ${keyword} credit transaction: ${particulars} - ₹${credit}`);
        
        // Parse order details from transaction amount
        const orderDetails = parseOrderFromAmount(credit);
        
        if (orderDetails) {
          const expectedCost = calculateExpectedCost(orderDetails);
          let adjustment = credit - expectedCost;
          
          // Apply water adjustment if overpaid by more than ₹10
          let finalOrder = { ...orderDetails };
          if (adjustment > 10) {
            const extraWater = Math.floor(adjustment / 10);
            finalOrder.water += extraWater;
            adjustment = adjustment % 10;
          }
          
          const transaction: Transaction = {
            id: `txn-${Date.now()}-${i}`,
            date: transactionDate,
            valueDate: valueDate || transactionDate,
            details: particulars,
            paidAmount: credit,
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
    
    console.log(`Processed ${transactions.length} ${keyword} credit transactions`);
    return transactions;
    
  } catch (error) {
    console.error('Error processing Excel file:', error);
    throw new Error('Failed to process Excel file. Please ensure it\'s a valid IDFC First Bank statement.');
  }
};

const parseTransactionDate = (dateString: string): Date | null => {
  // Try different date formats commonly used in bank statements
  const formats = [
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,  // DD/MM/YYYY or MM/DD/YYYY
    /(\d{1,2})-(\d{1,2})-(\d{4})/,   // DD-MM-YYYY or MM-DD-YYYY
    /(\d{4})-(\d{1,2})-(\d{1,2})/,   // YYYY-MM-DD
    /(\d{1,2})\.(\d{1,2})\.(\d{4})/  // DD.MM.YYYY
  ];
  
  for (const format of formats) {
    const match = dateString.match(format);
    if (match) {
      const [, part1, part2, part3] = match;
      
      // For YYYY-MM-DD format
      if (format.source.includes('(\\d{4})-(\\d{1,2})-(\\d{1,2})')) {
        return new Date(parseInt(part1), parseInt(part2) - 1, parseInt(part3));
      }
      
      // For other formats, assume DD/MM/YYYY (Indian bank format)
      return new Date(parseInt(part3), parseInt(part2) - 1, parseInt(part1));
    }
  }
  
  // Fallback: try to parse as a standard date
  const fallbackDate = new Date(dateString);
  return isNaN(fallbackDate.getTime()) ? null : fallbackDate;
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


import * as XLSX from 'xlsx';
import { Transaction } from '../types/transaction';

// Menu prices
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
    
    // Skip metadata rows (1-6) and header row (7), start from row 8 (index 7)
    for (let i = 7; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      
      // Skip empty rows
      if (!row || row.length === 0 || !row[0]) continue;
      
      const date = row[0]?.toString() || '';
      const valueDate = row[1]?.toString() || '';
      const details = row[2]?.toString() || '';
      const withdrawal = parseFloat(row[3]?.toString() || '0') || 0;
      const deposit = parseFloat(row[4]?.toString() || '0') || 0;
      const balance = parseFloat(row[5]?.toString() || '0') || 0;
      
      // Process only credit transactions (deposits > 0)
      if (deposit > 0) {
        console.log(`Processing credit transaction: ${details} - ₹${deposit}`);
        
        // Parse order details from transaction description
        const orderDetails = parseOrderFromDetails(details, deposit);
        
        if (orderDetails) {
          const expectedCost = calculateExpectedCost(orderDetails);
          const adjustment = calculateAdjustment(deposit, expectedCost);
          
          // Apply water adjustment if overpaid by more than ₹10
          let finalOrder = { ...orderDetails };
          if (deposit - expectedCost > 10) {
            const extraWater = Math.floor((deposit - expectedCost) / 10);
            finalOrder.water += extraWater;
          }
          
          const transaction: Transaction = {
            id: `txn-${Date.now()}-${i}`,
            date,
            valueDate,
            details,
            paidAmount: deposit,
            fullPlate: finalOrder.fullPlate,
            halfPlate: finalOrder.halfPlate,
            water: finalOrder.water,
            packing: finalOrder.packing,
            expectedCost,
            adjustment,
            status: 'success'
          };
          
          transactions.push(transaction);
        }
      }
    }
    
    console.log(`Processed ${transactions.length} credit transactions`);
    return transactions;
    
  } catch (error) {
    console.error('Error processing Excel file:', error);
    throw new Error('Failed to process Excel file. Please ensure it\'s a valid IDFC First Bank statement.');
  }
};

const parseOrderFromDetails = (details: string, paidAmount: number): any | null => {
  // This is a simplified parser - in reality, you'd need more sophisticated logic
  // to extract order details from transaction descriptions
  
  console.log(`Parsing order from: ${details}`);
  
  // For now, we'll use a simple heuristic based on amount paid
  // This should be replaced with actual parsing logic based on your transaction format
  
  if (paidAmount >= 89) {
    const fullPlates = Math.floor(paidAmount / 89);
    const remainder = paidAmount % 89;
    
    let halfPlates = 0;
    let water = 0;
    let packing = 0;
    
    if (remainder >= 49) {
      halfPlates = Math.floor(remainder / 49);
      const newRemainder = remainder % 49;
      
      if (newRemainder >= 10) {
        water = Math.floor(newRemainder / 10);
        const finalRemainder = newRemainder % 10;
        
        if (finalRemainder >= 5) {
          packing = Math.floor(finalRemainder / 5);
        }
      }
    }
    
    return {
      fullPlate: fullPlates,
      halfPlate: halfPlates,
      water: water,
      packing: packing
    };
  } else if (paidAmount >= 49) {
    const halfPlates = Math.floor(paidAmount / 49);
    const remainder = paidAmount % 49;
    
    let water = 0;
    let packing = 0;
    
    if (remainder >= 10) {
      water = Math.floor(remainder / 10);
      const finalRemainder = remainder % 10;
      
      if (finalRemainder >= 5) {
        packing = Math.floor(finalRemainder / 5);
      }
    }
    
    return {
      fullPlate: 0,
      halfPlate: halfPlates,
      water: water,
      packing: packing
    };
  } else {
    // For small amounts, assume it's water and packing
    let water = 0;
    let packing = 0;
    
    if (paidAmount >= 10) {
      water = Math.floor(paidAmount / 10);
      const remainder = paidAmount % 10;
      
      if (remainder >= 5) {
        packing = Math.floor(remainder / 5);
      }
    }
    
    return {
      fullPlate: 0,
      halfPlate: 0,
      water: water,
      packing: packing
    };
  }
};

const calculateExpectedCost = (orderDetails: any): number => {
  return (
    orderDetails.fullPlate * MENU_PRICES.fullPlate +
    orderDetails.halfPlate * MENU_PRICES.halfPlate +
    orderDetails.water * MENU_PRICES.water +
    orderDetails.packing * MENU_PRICES.packing
  );
};

const calculateAdjustment = (paidAmount: number, expectedCost: number): number => {
  const difference = paidAmount - expectedCost;
  
  if (difference <= 10 && difference > 0) {
    // Straight rounding for small overpayments
    return difference;
  } else if (difference > 10) {
    // For larger overpayments, calculate remainder after extra water
    const remainder = difference % 10;
    return remainder;
  }
  
  // For exact payments or underpayments
  return difference;
};

export const processRealExcelFile = async (file: File): Promise<Transaction[]> => {
  return processExcelFile(file);
};

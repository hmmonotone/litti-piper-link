
import { UrbanPiperConfig, UrbanPiperOrder, UrbanPiperResponse } from '../types/urbanPiper';
import { Transaction } from '../types/transaction';

// Default Urban Piper configuration - these should be configurable
const DEFAULT_CONFIG: UrbanPiperConfig = {
  baseUrl: 'https://prime-dr3.svc.urbanpiper.com/api/v1/dr3',
  authToken: 'yy9mUMgxFASYjlwKThzRYOV74Figc001',
  locationId: 181155,
  registerId: 58309,
  registerName: "d'LITTIcious - POS - Himanshu Mishra",
  locationName: "d'LITTIcious - POS",
  companyId: 11777,
  cashierId: 129590,
  cashierName: "Himanshu Mishra",
  tableId: 69624
};

// Product mapping for menu items
const PRODUCT_MAPPING = {
  fullPlate: {
    variantId: 1336765,
    productId: 1339679,
    name: "Stall Litti Chokha",
    modifierId: 680845,
    modifierName: "Full",
    price: 84.7619,
    categoryId: 194536,
    code: "1040",
    sku: "1040"
  },
  halfPlate: {
    variantId: 1336766, // Placeholder - needs actual half plate variant ID
    productId: 1339680, // Placeholder - needs actual half plate product ID
    name: "Stall Litti Chokha Half",
    modifierId: 680846, // Placeholder - needs actual half modifier ID
    modifierName: "Half",
    price: 49,
    categoryId: 194536,
    code: "1041",
    sku: "1041"
  },
  water: {
    variantId: 1336767, // Placeholder - needs actual water variant ID
    productId: 1339681, // Placeholder - needs actual water product ID
    name: "Water Bottle",
    price: 10,
    categoryId: 194537, // Placeholder - needs actual water category ID
    code: "1042",
    sku: "1042"
  },
  packing: {
    variantId: 1336768, // Placeholder - needs actual packing variant ID
    productId: 1339682, // Placeholder - needs actual packing product ID
    name: "Packing Charges",
    price: 5,
    categoryId: 194538, // Placeholder - needs actual packing category ID
    code: "1043",
    sku: "1043"
  }
};

export class UrbanPiperService {
  private config: UrbanPiperConfig;

  constructor(config: Partial<UrbanPiperConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private generateOrderId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateKotId(): string {
    return `${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 12)}`;
  }

  private createOrderLine(itemType: string, quantity: number, orderSequence: number, kotId: string): any {
    const product = PRODUCT_MAPPING[itemType as keyof typeof PRODUCT_MAPPING];
    if (!product) return null;

    const lineId = this.generateOrderId();
    const salesPrice = product.price * quantity;
    const taxRate = 0.05; // 5% total tax (2.5% SGST + 2.5% CGST)
    const taxAmount = salesPrice * taxRate;

    return {
      id: lineId,
      text: null,
      variant: {
        id: product.variantId,
        type: "catalogue-item",
        product_id: product.productId,
        full_name: product.name,
        short_name: product.name,
        product_name: product.name,
        attr_values: [],
        kot_type_id: "kot/kot",
        kot_subtype: "kot",
        kot_subtype_text: "KOT",
        is_inventory_tracked: false,
        code: product.code,
        sku: product.sku,
        barcode: null,
        sell_by_weight: false,
        hsn: null,
        category_id: product.categoryId
      },
      stock_quantity: 99999999,
      meta: {},
      units: {
        default: "pcs",
        purchase: "pcs",
        transfer: "pcs",
        base: "pcs",
        scales: { pcs: 1 }
      },
      unit: "pcs",
      unit_scale: 1,
      unit_quantity: 1,
      taxes: [
        {
          id: 10315,
          name: "SGST",
          code: "SGST",
          rate: 0.025,
          config: {
            amount: 2.5,
            amount_field: "item_price",
            amount_type: "percent",
            applicable_modes: ["in-store", "online"]
          }
        },
        {
          id: 10316,
          name: "CGST",
          code: "CGST",
          rate: 0.025,
          config: {
            amount: 2.5,
            amount_field: "item_price",
            amount_type: "percent",
            applicable_modes: ["in-store", "online"]
          }
        }
      ],
      fees: [],
      applied_taxes: [
        {
          id: 10315,
          name: "SGST",
          code: "SGST",
          note: null,
          on_amount: salesPrice,
          amount: taxAmount / 2,
          charge_id: null
        },
        {
          id: 10316,
          name: "CGST",
          code: "CGST",
          note: null,
          on_amount: salesPrice,
          amount: taxAmount / 2,
          charge_id: null
        }
      ],
      applied_fees: [],
      quantity: quantity,
      pricing: {
        markup_price: null,
        base: { price: 0 },
        units: []
      },
      cost_price: null,
      orderSequence: orderSequence,
      sales_price: salesPrice,
      modifiers: product.modifierId ? [{
        id: product.modifierId,
        name: product.modifierName,
        short_name: product.modifierName,
        modifier_group: product.name,
        modifier_group_title: product.name,
        modifier_group_id: 249016,
        modifier_group_sort_order: 1,
        sales_price: salesPrice,
        sort_order: 1,
        parent_id: product.productId,
        hsn: null,
        unit_quantity: 1
      }] : [],
      discount_type: "no",
      discount_type_value: 0,
      discount_amount: 0,
      note: "",
      note_internal: "",
      client_created_at: Math.floor(Date.now() / 1000),
      type: "normal",
      total_sales_price: salesPrice,
      total: salesPrice,
      sell_by_weight: false,
      food_type: "veg",
      hsn: null,
      discount_subtotal_last: salesPrice,
      bill_discount: 0,
      bill_cashback: 0,
      total_tax: taxAmount,
      total_fee: 0,
      kot_id: kotId,
      sort_order: orderSequence
    };
  }

  public transformTransactionToOrder(transaction: Transaction): UrbanPiperOrder {
    const orderId = this.generateOrderId();
    const kotId = this.generateKotId();
    const clientCreatedAt = Math.floor(Date.now() / 1000);
    const businessDate = new Date().toISOString().split('T')[0] + 'T00:00:00+05:30';

    const billLines: any[] = [];
    let orderSequence = 1;
    let totalSalesPrice = 0;
    let totalTax = 0;

    // Add full plates
    if (transaction.fullPlate > 0) {
      const line = this.createOrderLine('fullPlate', transaction.fullPlate, orderSequence++, kotId);
      if (line) {
        billLines.push(line);
        totalSalesPrice += line.total_sales_price;
        totalTax += line.total_tax;
      }
    }

    // Add half plates
    if (transaction.halfPlate > 0) {
      const line = this.createOrderLine('halfPlate', transaction.halfPlate, orderSequence++, kotId);
      if (line) {
        billLines.push(line);
        totalSalesPrice += line.total_sales_price;
        totalTax += line.total_tax;
      }
    }

    // Add water
    if (transaction.water > 0) {
      const line = this.createOrderLine('water', transaction.water, orderSequence++, kotId);
      if (line) {
        billLines.push(line);
        totalSalesPrice += line.total_sales_price;
        totalTax += line.total_tax;
      }
    }

    // Add packing
    if (transaction.packing > 0) {
      const line = this.createOrderLine('packing', transaction.packing, orderSequence++, kotId);
      if (line) {
        billLines.push(line);
        totalSalesPrice += line.total_sales_price;
        totalTax += line.total_tax;
      }
    }

    const total = totalSalesPrice + totalTax;

    return {
      client_bill_id: orderId,
      version: 1,
      payload: {
        clientBill: true,
        version: 1,
        id: orderId,
        owner: {
          register_id: this.config.registerId,
          register_name: this.config.registerName,
          location_name: this.config.locationName,
          location_id: this.config.locationId,
          name: this.config.registerName,
          location: this.config.locationName
        },
        location: {
          id: this.config.locationId
        },
        customer: null,
        frozen: false,
        payment_extra: {},
        total_payment_amount: total,
        payments: [],
        payment_outstanding: total,
        type: "sale",
        status: "pending",
        discount_percent: null,
        discount_amount: 0,
        taxes: {},
        total_sales_price: totalSalesPrice,
        total_tax: totalTax,
        sub_total: totalSalesPrice,
        total: total,
        payment_uid: 0,
        mode: "restaurant",
        client_created_at: clientCreatedAt,
        client_created_by: this.config.cashierId,
        client_created_by_name: this.config.cashierName,
        bill_lines: billLines,
        kots: [],
        currencies: [],
        meta: {},
        business_date: businessDate,
        schema_version: 1,
        company_id: this.config.companyId,
        cashier: {
          id: this.config.cashierId,
          name: this.config.cashierName
        },
        table: {
          id: this.config.tableId,
          name: "Takeaway",
          floor_name: "Take away",
          name_text: "Take away / Takeaway",
          x: 5,
          y: 5,
          details: {
            size: 1,
            type: "ellipse",
            orientation: "default"
          },
          floor_id: 11570,
          cover: 1
        },
        temp_number: `T/2/${Math.floor(Math.random() * 1000)}`,
        sub_type_text: "Takeaway",
        delivery: false,
        sub_type: "takeaway",
        sub_type_object: {
          id: "takeaway",
          typeId: 12747,
          key: "takeaway",
          text: "Takeaway",
          name: "Takeaway",
          extra: {
            layout_type: "list"
          }
        },
        itemTotals: {},
        bxgyDiscounts: [],
        discount_amount_last: "0",
        cashback: 0,
        applied_fees: [],
        applied_taxes: [],
        total_line_fee: 0,
        total_line_tax: totalTax,
        total_line_discount: 0,
        total_line_cashback: 0,
        total_bill_fee: 0,
        total_bill_tax: 0,
        total_fee: 0,
        total_discount: 0,
        total_cashback: 0,
        round_off_amount: 0,
        transaction_pending: total,
        cash_received: total,
        current_order: [],
        syncInProgressVersion: 0,
        discount_subtotal_last: totalSalesPrice,
        last_added_line: billLines[billLines.length - 1]?.id || "",
        lastOrderSequence: orderSequence - 1,
        logs: [{
          event: "New Order Created",
          event_type: "finish-order",
          description: `New bill created\nNew Items : ${billLines.length} , Total Quantity: ${billLines.reduce((sum, line) => sum + line.quantity, 0)} , Draft Total : ₹${total}`,
          timestamp: clientCreatedAt,
          user: {
            username: this.config.cashierName,
            id: this.config.cashierId
          }
        }],
        cash_balance: 0,
        number: `2/000${Math.floor(Math.random() * 1000)}`,
        number_sequence: Math.floor(Math.random() * 1000),
        version_check: true
      },
      owner: {
        register_id: this.config.registerId,
        register_name: this.config.registerName,
        location_name: this.config.locationName,
        location_id: this.config.locationId,
        name: this.config.registerName,
        location: this.config.locationName
      },
      is_external: false,
      company_id: this.config.companyId
    };
  }

  public async createOrder(order: UrbanPiperOrder): Promise<UrbanPiperResponse> {
    const response = await fetch(`${this.config.baseUrl}/bills`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.authToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Prime-Language': 'en',
        'X-Client': 'Web-1.100.24'
      },
      body: JSON.stringify(order)
    });

    if (!response.ok) {
      throw new Error(`Failed to create order: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  public async settleOrder(orderId: string, order: UrbanPiperOrder): Promise<UrbanPiperResponse> {
    // Update order for settlement
    const settleOrder = {
      ...order.payload,
      version: 2,
      frozen: true,
      status: "settled",
      payment_outstanding: 0,
      payments: [{
        method: "cash",
        amount: order.payload.total,
        online_payment_id: null,
        payment_mode: "offline",
        status: "success",
        uid: 1,
        created_at: new Date().toLocaleString('en-IN', { 
          timeZone: 'Asia/Kolkata',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }).replace(',', ' -'),
        received_amount: order.payload.total
      }],
      payment_uid: 1,
      transaction_pending: 0,
      cash_received: 0,
      cash_balance: -order.payload.total,
      syncInProgressVersion: 1,
      logs: [
        {
          event: "Bill settled",
          event_type: "settle",
          description: `Payment Mode : offline , Value : ₹${order.payload.total}`,
          timestamp: Math.floor(Date.now() / 1000),
          user: {
            username: this.config.cashierName,
            id: this.config.cashierId
          }
        },
        ...order.payload.logs
      ],
      settled_at: Math.floor(Date.now() / 1000),
      register_session: {
        id: Math.floor(Math.random() * 10000000)
      },
      register_name: this.config.registerName
    };

    const response = await fetch('https://prime.urbanpiper.com/api/v1/sales/bills', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.authToken}`,
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json',
        'X-Prime-Language': 'en',
        'X-Client': 'Web-1.100.24'
      },
      body: JSON.stringify(settleOrder)
    });

    if (!response.ok) {
      throw new Error(`Failed to settle order: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  public async createAndSettleOrder(transaction: Transaction): Promise<{ createResponse: UrbanPiperResponse, settleResponse: UrbanPiperResponse }> {
    const order = this.transformTransactionToOrder(transaction);
    
    console.log('Creating Urban Piper order:', order);
    const createResponse = await this.createOrder(order);
    
    console.log('Order created:', createResponse);
    const settleResponse = await this.settleOrder(createResponse._id, order);
    
    console.log('Order settled:', settleResponse);
    
    return { createResponse, settleResponse };
  }
}

export const urbanPiperService = new UrbanPiperService();

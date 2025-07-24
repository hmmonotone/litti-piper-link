
export interface UrbanPiperConfig {
  baseUrl: string;
  authToken: string;
  locationId: number;
  registerId: number;
  registerName: string;
  locationName: string;
  companyId: number;
  cashierId: number;
  cashierName: string;
  tableId: number;
}

export interface UrbanPiperProduct {
  id: number;
  name: string;
  variantId: number;
  productId: number;
  modifierId?: number;
  price: number;
  categoryId: number;
  code: string;
  sku: string;
}

export interface UrbanPiperOrderLine {
  id: string;
  variant: {
    id: number;
    type: string;
    product_id: number;
    full_name: string;
    short_name: string;
    product_name: string;
    attr_values: any[];
    kot_type_id: string;
    kot_subtype: string;
    kot_subtype_text: string;
    is_inventory_tracked: boolean;
    code: string;
    sku: string;
    barcode: string | null;
    sell_by_weight: boolean;
    hsn: string | null;
    category_id: number;
  };
  quantity: number;
  unit_quantity: number;
  unit_scale: number;
  unit: string;
  sales_price: number;
  modifiers: any[];
  discount_type: string;
  discount_type_value: number;
  discount_amount: number;
  note: string;
  note_internal: string;
  client_created_at: number;
  type: string;
  total_sales_price: number;
  total: number;
  sell_by_weight: boolean;
  food_type: string;
  hsn: string | null;
  discount_subtotal_last: number;
  bill_discount: number;
  bill_cashback: number;
  total_tax: number;
  total_fee: number;
  kot_id: string;
  sort_order: number;
  taxes: any[];
  fees: any[];
  applied_taxes: any[];
  applied_fees: any[];
  pricing: any;
  cost_price: number | null;
  orderSequence: number;
  stock_quantity: number;
  meta: any;
  units: any;
  text: string | null;
}

export interface UrbanPiperOrder {
  client_bill_id: string;
  version: number;
  payload: {
    clientBill: boolean;
    version: number;
    id: string;
    owner: {
      register_id: number;
      register_name: string;
      location_name: string;
      location_id: number;
      name: string;
      location: string;
    };
    location: {
      id: number;
    };
    customer: null;
    frozen: boolean;
    payment_extra: any;
    total_payment_amount: number;
    payments: any[];
    payment_outstanding: number;
    type: string;
    status: string;
    discount_percent: null;
    discount_amount: number;
    taxes: any;
    total_sales_price: number;
    total_tax: number;
    sub_total: number;
    total: number;
    payment_uid: number;
    mode: string;
    client_created_at: number;
    client_created_by: number;
    client_created_by_name: string;
    bill_lines: UrbanPiperOrderLine[];
    kots: any[];
    currencies: any[];
    meta: any;
    business_date: string;
    schema_version: number;
    company_id: number;
    cashier: {
      id: number;
      name: string;
    };
    table: {
      id: number;
      name: string;
      floor_name: string;
      name_text: string;
      x: number;
      y: number;
      details: any;
      floor_id: number;
      cover: number;
    };
    temp_number: string;
    sub_type_text: string;
    delivery: boolean;
    sub_type: string;
    sub_type_object: any;
    itemTotals: any;
    bxgyDiscounts: any[];
    discount_amount_last: string;
    cashback: number;
    applied_fees: any[];
    applied_taxes: any[];
    total_line_fee: number;
    total_line_tax: number;
    total_line_discount: number;
    total_line_cashback: number;
    total_bill_fee: number;
    total_bill_tax: number;
    total_fee: number;
    total_discount: number;
    total_cashback: number;
    round_off_amount: number;
    transaction_pending: number;
    cash_received: number;
    current_order: any[];
    syncInProgressVersion: number;
    discount_subtotal_last: number;
    last_added_line: string;
    lastOrderSequence: number;
    logs: any[];
    cash_balance: number;
    number: string;
    number_sequence: number;
    version_check: boolean;
  };
  owner: {
    register_id: number;
    register_name: string;
    location_name: string;
    location_id: number;
    name: string;
    location: string;
  };
  is_external: boolean;
  company_id: number;
}

export interface UrbanPiperResponse {
  _id: string;
  version: number;
  payload: any;
  owner: any;
  is_external: boolean;
  ext_order_number: string | null;
  company_id: number;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

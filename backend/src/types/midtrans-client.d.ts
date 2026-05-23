declare module 'midtrans-client' {
  interface MidtransConfig {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  interface TransactionDetails {
    order_id: string;
    gross_amount: number;
  }

  interface ItemDetail {
    id: string;
    price: number;
    quantity: number;
    name: string;
  }

  interface CustomerDetails {
    first_name: string;
    email: string;
    last_name?: string;
    phone?: string;
  }

  interface Callbacks {
    finish?: string;
    error?: string;
    pending?: string;
  }

  interface TransactionParameter {
    transaction_details: TransactionDetails;
    item_details?: ItemDetail[];
    customer_details?: CustomerDetails;
    callbacks?: Callbacks;
    credit_card?: {
      secure?: boolean;
    };
  }

  interface SnapResponse {
    token: string;
    redirect_url: string;
  }

  interface TransactionStatus {
    transaction_status: string;
    fraud_status?: string;
    payment_type: string;
    order_id: string;
    gross_amount: string;
    status_code: string;
    transaction_id: string;
    transaction_time: string;
    settlement_time?: string;
  }

  class Snap {
    constructor(config: MidtransConfig);
    createTransaction(parameter: TransactionParameter): Promise<SnapResponse>;
    createTransactionToken(parameter: TransactionParameter): Promise<string>;
    createTransactionRedirectUrl(parameter: TransactionParameter): Promise<string>;
  }

  class CoreApi {
    constructor(config: MidtransConfig);
    transaction: {
      status(orderId: string): Promise<TransactionStatus>;
      cancel(orderId: string): Promise<any>;
      expire(orderId: string): Promise<any>;
      refund(orderId: string, parameter?: any): Promise<any>;
    };
    charge(parameter: any): Promise<any>;
  }
}

const API_URL = 'http://localhost:5000';

export interface EsewaPaymentData {
  paymentUrl: string;
  amount: string;
  tax_amount: string;
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  product_service_charge: string;
  product_delivery_charge: string;
  success_url: string;
  failure_url: string;
  signed_field_names: string;
  signature: string;
}

export interface EsewaInitiateResponse {
  success: boolean;

  payment: {
    id: string;
    transactionUuid: string;
    amount: number;
    currency: string;
    provider: string;
    status: string;
  };

  esewa: EsewaPaymentData;
}

export const initiateEsewaPayment = async (
  packageId: string
): Promise<EsewaInitiateResponse> => {
  const token = localStorage.getItem('token');

  const response = await fetch(
    `${API_URL}/payments/esewa/initiate`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },

      body: JSON.stringify({
        packageId
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || 'Failed to initiate eSewa payment'
    );
  }

  return data;
};

// ============================================================
// INVOICES
// ============================================================

export type InvoiceStatus =
  | 'paid'
  | 'pending'
  | 'failed'
  | 'refunded';


export interface Invoice {
  id: string;
  invoiceNumber: string;
  subscriptionId?: string;
  packageId?: string | null;
  packageName: string;
  billingCycle?: string | null;
  amount: number;
  currency: string;
  status: InvoiceStatus;
  paymentMethod?: string;
  transactionCode?: string | null;
  transactionUuid?: string;
  createdAt: string;
  paidAt?: string | null;
}


export interface InvoiceSummary {
  totalInvoices: number;
  paidInvoices: number;
  totalPaid: number;
  currency: string;
}


export interface MyInvoicesResponse {
  success: boolean;
  summary: InvoiceSummary;
  data: Invoice[];
  message?: string;
}


export const getMyInvoices =
  async (): Promise<MyInvoicesResponse> => {

    const token =
      localStorage.getItem('token');


    const response =
      await fetch(
        `${API_URL}/payments/my`,
        {
          method: 'GET',

          headers: {
            'Content-Type':
              'application/json',

            ...(token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : {}),
          },
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        'Failed to load invoices'
      );

    }


    return data;
  };
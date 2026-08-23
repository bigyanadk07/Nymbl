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
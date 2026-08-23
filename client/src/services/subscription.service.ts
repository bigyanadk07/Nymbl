const API_URL = 'http://localhost:5000';


export interface Subscription {
  id: string;

  package: {
    id: string;
    name: string;
    price: number;
    billingCycle: string;
    description?: string;
  } | null;

  status: string;

  currentPeriodStart: string | null;

  currentPeriodEnd: string | null;

  createdAt: string;
}


export interface CreateSubscriptionResponse {
  success: boolean;

  message?: string;

  subscription: {
    id: string;

    packageId: string;

    status: string;

    currentPeriodStart: string | null;

    currentPeriodEnd: string | null;
  };
}


// ============================================================
// CREATE SUBSCRIPTION
// ============================================================
//
// NOTE:
// This endpoint is NOT used by the eSewa Subscribe button.
//
// The actual payment flow is:
//
// PackageDetails
//      ↓
// /payments/esewa/initiate
//      ↓
// pending subscription
//      ↓
// eSewa
//      ↓
// successful payment
//      ↓
// active subscription
//
// This function remains available for the backend subscription
// endpoint, but it does NOT perform payment.
// ============================================================

export const createSubscription = async (
  packageId: string
): Promise<CreateSubscriptionResponse> => {

  const token =
    localStorage.getItem('token');


  const response =
    await fetch(
      `${API_URL}/subscriptions`,
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',

          Authorization:
            `Bearer ${token}`,
        },

        body: JSON.stringify({
          packageId,
        }),
      }
    );


  const data =
    await response.json();


  if (!response.ok) {

    throw new Error(
      data.message ||
      'Failed to create subscription'
    );

  }


  return data;
};


// ============================================================
// GET MY SUBSCRIPTIONS
// ============================================================

export const getMySubscriptions =
  async (): Promise<Subscription[]> => {

    const token =
      localStorage.getItem('token');


    const response =
      await fetch(
        `${API_URL}/subscriptions/my`,
        {
          method: 'GET',

          headers: {
            'Content-Type':
              'application/json',

            Authorization:
              `Bearer ${token}`,
          },
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        'Failed to load subscriptions'
      );

    }


    return data.subscriptions || [];
  };
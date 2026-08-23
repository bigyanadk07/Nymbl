export interface Api {
  _id: string;
  name: string;
  description: string;
  category: string;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: string;
  features: string[];
  isPopular: boolean;
  apis: Api[];

  // Subscription information
  isSubscribed?: boolean;

  subscription?: {
    id: string;
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
  } | null;
}


const API_URL = 'http://localhost:5000';


// ============================================================
// GET ALL PACKAGES
// ============================================================

export const getPackages = async (): Promise<Package[]> => {

  const response = await fetch(`${API_URL}/packages`);

  if (!response.ok) {
    throw new Error('Failed to fetch packages');
  }

  return response.json();
};


// ============================================================
// GET PACKAGE BY ID
// ============================================================

export const getPackageById = async (
  packageId: string
): Promise<Package> => {

  const token = localStorage.getItem('token');

  const response = await fetch(
    `${API_URL}/packages/${packageId}`,
    {
      method: 'GET',

      headers: {
        'Content-Type': 'application/json',

        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch package');
  }

  return response.json();
};
import React, {
  useEffect,
  useState,
} from 'react';

import {
  Download,
  FileText,
  Eye,
  Receipt,
  Calendar,
  CreditCard,
} from 'lucide-react';


// ============================================================
// TYPES
// ============================================================

interface Invoice {
  id: string;
  invoiceNumber: string;
  subscriptionId?: string;
  packageName: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  paymentMethod?: string;
  createdAt: string;
  paidAt?: string;
}


// ============================================================
// STATUS STYLES
// ============================================================

const STATUS_STYLES: Record<
  Invoice['status'],
  {
    label: string;
    badge: string;
    dot: string;
  }
> = {
  paid: {
    label: 'Paid',
    badge: 'bg-[#E9F5F4] text-[#0B7A79]',
    dot: 'bg-[#0E9594]',
  },

  pending: {
    label: 'Pending',
    badge: 'bg-[#FDF3DF] text-[#946012]',
    dot: 'bg-[#F0A202]',
  },

  failed: {
    label: 'Failed',
    badge: 'bg-[#FBF2F0] text-[#B4442E]',
    dot: 'bg-[#C2604B]',
  },

  refunded: {
    label: 'Refunded',
    badge: 'bg-[#EEEFEC] text-[#5B6270]',
    dot: 'bg-[#A9AEB9]',
  },
};


// ============================================================
// HELPERS
// ============================================================

const formatDate = (
  dateString?: string
) => {

  if (!dateString) {
    return '—';
  }

  return new Date(
    dateString
  ).toLocaleDateString(
    undefined,
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }
  );

};


const formatCurrency = (
  amount: number,
  currency: string
) => {

  return `${currency} ${amount.toLocaleString()}`;

};


// ============================================================
// INVOICE PAGE
// ============================================================

const Invoice: React.FC = () => {

  const [
    invoices,
    setInvoices,
  ] = useState<Invoice[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);


  // ==========================================================
  // LOAD INVOICES
  // ==========================================================

  useEffect(() => {

    const loadInvoices = async () => {

      try {

        setLoading(true);
        setError(null);

        /*
         * Invoice API is not connected yet.
         *
         * Once the backend invoice endpoint exists,
         * replace this section with the invoice service call.
         *
         * Example:
         *
         * const response = await getMyInvoices();
         * setInvoices(response.data);
         */

        setInvoices([]);

      } catch (err) {

        console.error(
          'Invoice loading error:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load invoices'
        );

      } finally {

        setLoading(false);

      }

    };


    loadInvoices();

  }, []);


  // ==========================================================
  // VIEW INVOICE
  // ==========================================================

  const handleViewInvoice = (
    invoice: Invoice
  ) => {

    console.log(
      'View invoice:',
      invoice.id
    );

    /*
     * Backend invoice/document endpoint
     * will be connected here later.
     */

  };


  // ==========================================================
  // DOWNLOAD INVOICE
  // ==========================================================

  const handleDownloadInvoice = (
    invoice: Invoice
  ) => {

    console.log(
      'Download invoice:',
      invoice.id
    );

    /*
     * Backend PDF generation/download endpoint
     * will be connected here later.
     */

  };


  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (loading) {

    return (

      <div className="px-6 py-8 lg:px-10 lg:py-10">

        <div className="mx-auto max-w-7xl">

          <div className="mb-10">

            <div className="h-8 w-48 animate-pulse rounded-md bg-[#E2E4E0]" />

            <div className="mt-3 h-4 w-80 animate-pulse rounded-md bg-[#E2E4E0]" />

          </div>


          <div className="h-64 animate-pulse rounded-lg border border-[#E2E4E0] bg-white" />

        </div>

      </div>

    );

  }


  // ==========================================================
  // ERROR STATE
  // ==========================================================

  if (error) {

    return (

      <div className="px-6 py-8 lg:px-10 lg:py-10">

        <div className="mx-auto max-w-7xl">

          <div className="rounded-lg border border-[#EED0C9] bg-[#FBF2F0] p-6">

            <h2 className="font-semibold text-[#14161F]">
              Unable to load invoices
            </h2>

            <p className="mt-1 text-sm text-[#B4442E]">
              {error}
            </p>

          </div>

        </div>

      </div>

    );

  }


  // ==========================================================
  // MAIN PAGE
  // ==========================================================

  return (

    <div className="px-6 py-8 lg:px-10 lg:py-10">

      <div className="mx-auto max-w-7xl">


        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-10">

          <span className="font-mono text-xs uppercase tracking-wider text-[#0E9594]">
            Billing
          </span>

          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#14161F]">
            Invoice Management
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5B6270]">
            View your purchase history, payment records,
            and invoices for your API subscriptions.
          </p>

        </div>


        {/* ==================================================
            SUMMARY
        ================================================== */}

        <section className="mb-8">

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">


            {/* Total Invoices */}

            <div className="rounded-lg border border-[#E2E4E0] bg-white p-5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-mono uppercase tracking-wide text-[#8B909C]">
                    Total Invoices
                  </p>

                  <p className="mt-2 font-display text-2xl font-semibold text-[#14161F]">
                    {invoices.length}
                  </p>

                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#E9F5F4]">

                  <Receipt
                    size={19}
                    className="text-[#0E9594]"
                  />

                </div>

              </div>

            </div>


            {/* Paid Invoices */}

            <div className="rounded-lg border border-[#E2E4E0] bg-white p-5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-mono uppercase tracking-wide text-[#8B909C]">
                    Paid Invoices
                  </p>

                  <p className="mt-2 font-display text-2xl font-semibold text-[#14161F]">
                    {
                      invoices.filter(
                        invoice =>
                          invoice.status === 'paid'
                      ).length
                    }
                  </p>

                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#E9F5F4]">

                  <CreditCard
                    size={19}
                    className="text-[#0E9594]"
                  />

                </div>

              </div>

            </div>


            {/* Total Paid */}

            <div className="rounded-lg border border-[#E2E4E0] bg-white p-5">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-mono uppercase tracking-wide text-[#8B909C]">
                    Total Paid
                  </p>

                  <p className="mt-2 font-display text-2xl font-semibold text-[#14161F]">

                    {
                      formatCurrency(
                        invoices
                          .filter(
                            invoice =>
                              invoice.status === 'paid'
                          )
                          .reduce(
                            (
                              total,
                              invoice
                            ) =>
                              total +
                              invoice.amount,
                            0
                          ),
                        invoices[0]?.currency ||
                          'NPR'
                      )
                    }

                  </p>

                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#E9F5F4]">

                  <FileText
                    size={19}
                    className="text-[#0E9594]"
                  />

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ==================================================
            INVOICE HISTORY
        ================================================== */}

        <section>

          <div className="mb-5">

            <h2 className="font-display text-lg font-semibold text-[#14161F]">
              Invoice History
            </h2>

            <p className="mt-1 text-sm text-[#8B909C]">
              Your previous API purchases and billing records.
            </p>

          </div>


          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {invoices.length === 0 && (

            <div className="rounded-lg border border-[#E2E4E0] bg-white p-10 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[#F4F5F2]">

                <FileText
                  size={22}
                  className="text-[#8B909C]"
                />

              </div>


              <h3 className="mt-4 font-display text-base font-semibold text-[#14161F]">
                No invoices yet
              </h3>


              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8B909C]">

                Your invoices will appear here after
                you purchase or subscribe to an API package.

              </p>

            </div>

          )}


          {/* =================================================
              INVOICE TABLE
          ================================================= */}

          {invoices.length > 0 && (

            <div className="overflow-hidden rounded-lg border border-[#E2E4E0] bg-white">

              <div className="overflow-x-auto">

                <table className="min-w-full">

                  <thead>

                    <tr className="border-b border-[#E2E4E0] bg-[#F4F5F2]">

                      <th className="px-5 py-3 text-left text-xs font-mono uppercase tracking-wide text-[#8B909C]">
                        Invoice
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-mono uppercase tracking-wide text-[#8B909C]">
                        Package
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-mono uppercase tracking-wide text-[#8B909C]">
                        Date
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-mono uppercase tracking-wide text-[#8B909C]">
                        Amount
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-mono uppercase tracking-wide text-[#8B909C]">
                        Status
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-mono uppercase tracking-wide text-[#8B909C]">
                        Actions
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {invoices.map(
                      (
                        invoice,
                        index
                      ) => {

                        const statusStyle =
                          STATUS_STYLES[
                            invoice.status
                          ];

                        return (

                          <tr
                            key={invoice.id}
                            className={
                              index !==
                              invoices.length - 1
                                ? 'border-b border-[#E2E4E0]'
                                : ''
                            }
                          >

                            {/* Invoice */}

                            <td className="px-5 py-4">

                              <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#F4F5F2]">

                                  <FileText
                                    size={17}
                                    className="text-[#5B6270]"
                                  />

                                </div>

                                <span className="font-mono text-sm font-medium text-[#14161F]">
                                  {invoice.invoiceNumber}
                                </span>

                              </div>

                            </td>


                            {/* Package */}

                            <td className="px-5 py-4">

                              <span className="text-sm text-[#3A3F4B]">
                                {invoice.packageName}
                              </span>

                            </td>


                            {/* Date */}

                            <td className="px-5 py-4">

                              <div className="flex items-center gap-2">

                                <Calendar
                                  size={15}
                                  className="text-[#8B909C]"
                                />

                                <span className="text-sm text-[#5B6270]">
                                  {formatDate(
                                    invoice.createdAt
                                  )}
                                </span>

                              </div>

                            </td>


                            {/* Amount */}

                            <td className="px-5 py-4">

                              <span className="font-mono text-sm font-medium text-[#14161F]">
                                {
                                  formatCurrency(
                                    invoice.amount,
                                    invoice.currency
                                  )
                                }
                              </span>

                            </td>


                            {/* Status */}

                            <td className="px-5 py-4">

                              <span
                                className={`inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-xs font-mono ${statusStyle.badge}`}
                              >

                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                                />

                                {statusStyle.label}

                              </span>

                            </td>


                            {/* Actions */}

                            <td className="px-5 py-4">

                              <div className="flex items-center justify-end gap-2">

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleViewInvoice(
                                      invoice
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-md border border-[#D7D9D3] px-3 py-2 text-xs font-medium text-[#3A3F4B] transition-colors hover:border-[#14161F] hover:text-[#14161F]"
                                >

                                  <Eye
                                    size={14}
                                  />

                                  View

                                </button>


                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDownloadInvoice(
                                      invoice
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-md bg-[#14161F] px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-[#272A36]"
                                >

                                  <Download
                                    size={14}
                                  />

                                  Download

                                </button>

                              </div>

                            </td>

                          </tr>

                        );

                      }
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          )}

        </section>

      </div>

    </div>

  );

};


export default Invoice;
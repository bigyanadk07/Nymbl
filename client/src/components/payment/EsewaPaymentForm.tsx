import React, { useEffect, useRef } from 'react';

interface EsewaPaymentFormProps {
  payment: {
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
  };
}

const EsewaPaymentForm: React.FC<EsewaPaymentFormProps> = ({
  payment
}) => {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current?.submit();
  }, []);

  return (
    <form
      ref={formRef}
      action={payment.paymentUrl}
      method="POST"
    >
      <input
        type="hidden"
        name="amount"
        value={payment.amount}
      />

      <input
        type="hidden"
        name="tax_amount"
        value={payment.tax_amount}
      />

      <input
        type="hidden"
        name="total_amount"
        value={payment.total_amount}
      />

      <input
        type="hidden"
        name="transaction_uuid"
        value={payment.transaction_uuid}
      />

      <input
        type="hidden"
        name="product_code"
        value={payment.product_code}
      />

      <input
        type="hidden"
        name="product_service_charge"
        value={payment.product_service_charge}
      />

      <input
        type="hidden"
        name="product_delivery_charge"
        value={payment.product_delivery_charge}
      />

      <input
        type="hidden"
        name="success_url"
        value={payment.success_url}
      />

      <input
        type="hidden"
        name="failure_url"
        value={payment.failure_url}
      />

      <input
        type="hidden"
        name="signed_field_names"
        value={payment.signed_field_names}
      />

      <input
        type="hidden"
        name="signature"
        value={payment.signature}
      />

      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-600">
          Redirecting to eSewa...
        </p>
      </div>
    </form>
  );
};

export default EsewaPaymentForm;
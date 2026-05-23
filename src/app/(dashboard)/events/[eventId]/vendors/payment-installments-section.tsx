'use client';

import { useRouter } from 'next/navigation';
import { PaymentInstallments } from '@/components/features/payment-installments';
import { markInstallmentPaid } from '@/actions/payments';

interface VendorPayment {
  vendor_id: string;
  vendor_name: string;
  vendor_type: string;
  contract_value: number;
  installments: any[];
}

interface Props {
  eventId: string;
  vendorPayments: VendorPayment[];
}

export function PaymentInstallmentsSection({ eventId, vendorPayments }: Props) {
  const router = useRouter();

  const handleMarkPaid = async (
    installmentId: string,
    paymentDetails: { amount: number; method: string; reference?: string; date: string }
  ) => {
    const result = await markInstallmentPaid(installmentId, paymentDetails);
    if (result?.error) {
      console.error('Failed to mark installment paid:', result.error);
      return;
    }
    router.refresh();
  };

  return (
    <PaymentInstallments
      eventId={eventId}
      vendorPayments={vendorPayments}
      onMarkPaid={handleMarkPaid}
    />
  );
}

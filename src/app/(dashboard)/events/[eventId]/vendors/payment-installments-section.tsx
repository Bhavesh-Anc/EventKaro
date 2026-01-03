'use client';

import { useRouter } from 'next/navigation';
import { PaymentInstallments } from '@/components/features/payment-installments';

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

  const handleMarkPaid = async (installmentId: string, paymentDetails: any) => {
    // TODO: Implement mark as paid action
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

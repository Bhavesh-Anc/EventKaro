'use client';

import { useState } from 'react';
import { QuoteRequestModal } from './quote-request-modal';

interface QuoteRequestButtonProps {
  vendorId: string;
  vendorName: string;
}

export function QuoteRequestButton({ vendorId, vendorName }: QuoteRequestButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Request Quote
      </button>

      <QuoteRequestModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        vendorId={vendorId}
        vendorName={vendorName}
      />
    </>
  );
}

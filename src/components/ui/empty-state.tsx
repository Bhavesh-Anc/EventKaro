import Link from 'next/link';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12 px-4">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="inline-flex px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

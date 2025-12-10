import { createOrganization } from '@/actions/organizations';

export default function NewOrganizationPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Create Organization</h2>
        <p className="text-muted-foreground mt-2">
          Set up your organization to start managing events
        </p>
      </div>

      <form className="space-y-6">
        <div className="rounded-lg border p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Organization Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="My Event Company"
            />
            <p className="text-xs text-muted-foreground mt-1">
              This will be displayed on your events and tickets
            </p>
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium mb-2">
              URL Slug *
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">eventkaro.in/</span>
              <input
                id="slug"
                name="slug"
                type="text"
                required
                pattern="[a-z0-9-]+"
                className="flex-1 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="my-event-company"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Use lowercase letters, numbers, and hyphens only
            </p>
          </div>

          <div>
            <label htmlFor="gstin" className="block text-sm font-medium mb-2">
              GSTIN (Optional)
            </label>
            <input
              id="gstin"
              name="gstin"
              type="text"
              pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="22AAAAA0000A1Z5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Required for GST invoicing. Format: 15 characters
            </p>
          </div>

          <div>
            <label htmlFor="pan" className="block text-sm font-medium mb-2">
              PAN (Optional)
            </label>
            <input
              id="pan"
              name="pan"
              type="text"
              pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}"
              className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="ABCDE1234F"
            />
            <p className="text-xs text-muted-foreground mt-1">
              10 character PAN number
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              formAction={createOrganization}
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Create Organization
            </button>
            <a
              href="/dashboard"
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}

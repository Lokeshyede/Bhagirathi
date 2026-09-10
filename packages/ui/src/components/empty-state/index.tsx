import React from "react";
import { Database, Users, Home, CreditCard, MessageSquare, Bell, Search, Building2, Plus, LucideIcon } from "lucide-react";
import { cn } from "../../design-system/utils";
import { Button } from "../buttons";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  icon: LucideIcon;
  actionText?: string;
  onAction?: () => void;
}

// 1. BASE EMPTY STATE
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: IconComponent,
  actionText,
  onAction,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-14 px-6 border border-dashed border-border bg-white rounded-card select-none dark:bg-gray-900 dark:border-gray-800",
        className
      )}
      {...props}
    >
      <div className="p-4 bg-background dark:bg-gray-800 rounded-full text-text-muted mb-4 shrink-0">
        <IconComponent className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-base font-extrabold text-text-primary uppercase tracking-wider dark:text-white mb-1.5">
        {title}
      </h3>
      <p className="text-xs text-text-secondary max-w-sm leading-relaxed mb-6">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction} leftIcon={Plus}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

// 2. NO DATA STATE
export const NoData: React.FC<Omit<EmptyStateProps, "title" | "description" | "icon">> = (props) => (
  <EmptyState
    title="No Records Found"
    description="There is no data to show in this view. Try adjusting filters or add a new record."
    icon={Database}
    {...props}
  />
);

// 3. NO TENANT STATE
export const NoTenant: React.FC<Omit<EmptyStateProps, "title" | "description" | "icon">> = (props) => (
  <EmptyState
    title="No Tenants Found"
    description="Your tenant directory is empty. Add profiles to allocate rooms and beds."
    icon={Users}
    actionText="Register Tenant"
    {...props}
  />
);

// 4. NO ROOM STATE
export const NoRoom: React.FC<Omit<EmptyStateProps, "title" | "description" | "icon">> = (props) => (
  <EmptyState
    title="No Rooms Configured"
    description="No rooms or PG spaces are set up yet. Setup properties, rooms, and beds to start boarding."
    icon={Home}
    actionText="Add Room"
    {...props}
  />
);

// 5. NO PAYMENT STATE
export const NoPayment: React.FC<Omit<EmptyStateProps, "title" | "description" | "icon">> = (props) => (
  <EmptyState
    title="No Transaction Logs"
    description="No bills have been collected or recorded. Generate a new rent invoice to request payments."
    icon={CreditCard}
    actionText="Record Payment"
    {...props}
  />
);

// 6. NO COMPLAINT STATE
export const NoComplaint: React.FC<Omit<EmptyStateProps, "title" | "description" | "icon">> = (props) => (
  <EmptyState
    title="No Active Complaints"
    description="All clear! No maintenance request, bug report, or active tenant complaint exists in this workspace."
    icon={MessageSquare}
    actionText="Create Ticket"
    {...props}
  />
);

// 7. NO NOTICE STATE
export const NoNotice: React.FC<Omit<EmptyStateProps, "title" | "description" | "icon">> = (props) => (
  <EmptyState
    title="No Notice Announcements"
    description="Bulletin board is clear. Publish notices or regulations to broadcast info to all tenants."
    icon={Bell}
    actionText="Publish Notice"
    {...props}
  />
);

// 8. NO SEARCH RESULT STATE
export const NoSearchResult: React.FC<Omit<EmptyStateProps, "title" | "description" | "icon">> = (props) => (
  <EmptyState
    title="No Matching Search Results"
    description="We couldn't find anything matching your search keywords. Double check the spelling or filters."
    icon={Search}
    {...props}
  />
);

// 9. NO BUILDING STATE
export const NoBuilding: React.FC<Omit<EmptyStateProps, "title" | "description" | "icon">> = (props) => (
  <EmptyState
    title="No Buildings Registered"
    description="No hostel building structures have been added to your profile. Register a building block to get started."
    icon={Building2}
    actionText="Add Building"
    {...props}
  />
);

export default EmptyState;

import React from "react";
import { LucideIcon, Bed, User, Home, ArrowUpRight, ArrowDownRight, Phone, MessageSquare, CreditCard, Megaphone, Download, Clock, Wrench } from "lucide-react";
import { cn } from "../../design-system/utils";
import { Badge } from "../badges";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  isLoading?: boolean;
}

// 1. BASE CARD
export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  isLoading = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        "bg-white border border-border rounded-card shadow-sm transition-all duration-200 overflow-hidden relative dark:bg-gray-900 dark:border-gray-800",
        hoverable && "hover:shadow-hover hover:-translate-y-0.5 cursor-pointer",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <div className="p-6 space-y-4 animate-pulse select-none">
          <div className="h-4 bg-gray-250 dark:bg-gray-800 rounded w-1/3" />
          <div className="space-y-2">
            <div className="h-8 bg-gray-250 dark:bg-gray-800 rounded w-1/2" />
            <div className="h-3 bg-gray-250 dark:bg-gray-800 rounded w-3/4" />
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
};

// CARD PARTS
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={cn("p-5 border-b border-border flex items-center justify-between dark:border-gray-800", className)} {...props}>
    {children}
  </div>
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={cn("p-5 flex-1", className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => (
  <div className={cn("px-5 py-4 border-t border-border bg-sidebar flex items-center justify-between dark:border-gray-800 dark:bg-gray-900/50", className)} {...props}>
    {children}
  </div>
);

// 2. KPI CARD
export interface KPICardProps extends Omit<CardProps, "title"> {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: {
    value: string | number;
    isPositive: boolean;
  };
  progress?: number; // 0 to 100
  iconVariant?: "primary" | "success" | "warning" | "danger" | "info";
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon: IconComponent,
  subtitle,
  trend,
  progress,
  iconVariant = "primary",
  className,
  isLoading,
  ...props
}) => {
  const iconColors = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger",
    info: "bg-info/10 text-info",
  };

  return (
    <Card hoverable isLoading={isLoading} className={cn("p-6 flex flex-col justify-between", className)} {...props}>
      <div className="flex items-start justify-between gap-4 select-none">
        <div className="space-y-1.5 overflow-hidden">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary dark:text-gray-400">
            {title}
          </span>
          <h3 className="text-2xl font-extrabold text-text-primary tracking-tight dark:text-white truncate">
            {value}
          </h3>
        </div>
        <div className={cn("p-2.5 rounded-xl shrink-0", iconColors[iconVariant])}>
          <IconComponent className="h-5 w-5" />
        </div>
      </div>

      {(subtitle || trend || progress !== undefined) && (
        <div className="mt-4 pt-4 border-t border-divider flex flex-col gap-3 dark:border-gray-800 select-none">
          {progress !== undefined && (
            <div className="w-full">
              <div className="flex justify-between items-center text-[10px] font-bold text-text-secondary mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-background h-1.5 rounded-full overflow-hidden dark:bg-gray-850">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-xs gap-2">
            {subtitle && (
              <span className="text-text-secondary font-medium truncate dark:text-gray-400">{subtitle}</span>
            )}
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-bold shrink-0",
                  trend.isPositive ? "text-success" : "text-danger"
                )}
              >
                {trend.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {trend.isPositive ? "" : "-"}
                {trend.value}
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

// 3. STATISTICS CARD
export interface StatisticsCardProps extends CardProps {
  title: string;
  stats: { label: string; count: number; percent: number; colorClass?: string }[];
}

export const StatisticsCard: React.FC<StatisticsCardProps> = ({ title, stats, className, ...props }) => (
  <Card className={cn("p-5 flex flex-col gap-4", className)} {...props}>
    <h4 className="text-xs font-bold uppercase tracking-wider text-text-primary dark:text-white select-none">{title}</h4>
    <div className="flex flex-col gap-3.5 select-none">
      {stats.map((stat, idx) => (
        <div key={idx} className="w-full">
          <div className="flex justify-between text-xs font-semibold mb-1">
            <span className="text-text-secondary">{stat.label}</span>
            <span className="text-text-primary dark:text-gray-200">{stat.count} ({stat.percent}%)</span>
          </div>
          <div className="h-2 bg-background dark:bg-gray-850 rounded-full overflow-hidden w-full">
            <div
              className={cn("h-full rounded-full transition-all duration-300", stat.colorClass || "bg-primary")}
              style={{ width: `${stat.percent}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  </Card>
);

// 4. ANALYTICS CARD
export interface AnalyticsCardProps extends CardProps {
  title: string;
  metric: string | number;
  percentageChange?: string | number;
  isPositiveChange?: boolean;
  children?: React.ReactNode;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  metric,
  percentageChange,
  isPositiveChange = true,
  children,
  className,
  ...props
}) => (
  <Card className={cn("p-5 flex flex-col gap-4", className)} {...props}>
    <div className="flex justify-between items-start select-none">
      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">{title}</p>
        <h4 className="text-2xl font-extrabold text-text-primary dark:text-white">{metric}</h4>
      </div>
      {percentageChange !== undefined && (
        <Badge variant={isPositiveChange ? "success" : "danger"} icon={true}>
          {percentageChange}
        </Badge>
      )}
    </div>
    {children && <div className="flex-1 w-full mt-1">{children}</div>}
  </Card>
);

// 5. PROFILE CARD
export interface ProfileCardProps extends CardProps {
  name: string;
  role: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  badgeText?: string;
  badgeVariant?: "success" | "danger" | "warning" | "info" | "pending" | "paid" | "occupied" | "vacant" | "reserved" | "maintenance";
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  role,
  avatarUrl,
  email,
  phone,
  badgeText,
  badgeVariant = "success",
  className,
  ...props
}) => (
  <Card className={cn("p-5 text-center flex flex-col items-center", className)} {...props}>
    <div className="relative mb-4">
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="h-16 w-16 rounded-full object-cover border border-border" />
      ) : (
        <div className="h-16 w-16 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-lg select-none uppercase">
          {name.charAt(0)}
        </div>
      )}
      {badgeText && (
        <Badge variant={badgeVariant} className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 scale-90 border border-white dark:border-gray-900">
          {badgeText}
        </Badge>
      )}
    </div>
    <div className="space-y-1 select-none">
      <h4 className="text-base font-bold text-text-primary dark:text-white leading-tight">{name}</h4>
      <p className="text-xs font-semibold text-text-secondary">{role}</p>
    </div>
    {(email || phone) && (
      <div className="mt-4 pt-3 border-t border-divider w-full text-xs text-text-secondary space-y-1.5 select-none dark:border-gray-800">
        {email && <p className="truncate font-medium">{email}</p>}
        {phone && <p className="font-semibold text-text-primary dark:text-gray-300 flex items-center justify-center gap-1"><Phone className="h-3 w-3" /> {phone}</p>}
      </div>
    )}
  </Card>
);

// 6. ROOM CARD
export interface RoomCardProps extends CardProps {
  roomNumber: string;
  roomType: string;
  capacity: number;
  filledCount: number;
  rent: string | number;
  status: "available" | "full" | "maintenance";
  onAction?: () => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  roomNumber,
  roomType,
  capacity,
  filledCount,
  rent,
  status,
  onAction,
  className,
  ...props
}) => {
  const statusConfig = {
    available: { variant: "success" as const, label: "Available" },
    full: { variant: "reserved" as const, label: "Full" },
    maintenance: { variant: "maintenance" as const, label: "Maintenance" },
  };

  const progressPercent = Math.min(Math.round((filledCount / capacity) * 100), 100);

  return (
    <Card hoverable className={cn("flex flex-col justify-between", className)} {...props}>
      <CardHeader className="py-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary-light rounded-xl text-primary">
            <Home className="h-4.5 w-4.5" />
          </div>
          <div className="select-none">
            <h4 className="text-sm font-bold text-text-primary dark:text-white">Room {roomNumber}</h4>
            <p className="text-[10px] font-semibold text-text-secondary tracking-wide uppercase">{roomType}</p>
          </div>
        </div>
        <Badge variant={statusConfig[status].variant} icon={true}>
          {statusConfig[status].label}
        </Badge>
      </CardHeader>

      <CardBody className="py-4 flex flex-col gap-3.5 select-none">
        <div className="w-full">
          <div className="flex justify-between items-center text-[10px] font-bold text-text-secondary mb-1">
            <span>Occupancy ({filledCount}/{capacity})</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full bg-background h-1.5 rounded-full overflow-hidden dark:bg-gray-850">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                progressPercent >= 100 ? "bg-reserved" : "bg-primary"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center text-xs select-none">
          <span className="text-text-secondary font-medium">Rent Price</span>
          <span className="text-sm font-extrabold text-text-primary dark:text-white">₹{rent}/mo</span>
        </div>
      </CardBody>

      {onAction && (
        <CardFooter className="py-3 flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction();
            }}
            className="text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            Manage Room &rarr;
          </button>
        </CardFooter>
      )}
    </Card>
  );
};

// 7. BED CARD
export interface BedCardProps extends CardProps {
  bedNumber: string;
  tenantName?: string;
  status: "occupied" | "available" | "reserved" | "maintenance";
  onAction?: () => void;
}

export const BedCard: React.FC<BedCardProps> = ({
  bedNumber,
  tenantName,
  status,
  onAction,
  className,
  ...props
}) => {
  const statusConfig = {
    occupied: { variant: "danger" as const, label: "Occupied" },
    available: { variant: "success" as const, label: "Available" },
    reserved: { variant: "reserved" as const, label: "Reserved" },
    maintenance: { variant: "maintenance" as const, label: "Maintenance" },
  };

  return (
    <Card hoverable className={cn("p-4.5 border border-border flex items-center justify-between gap-4", className)} {...props}>
      <div className="flex items-center gap-3 select-none">
        <div className={cn(
          "p-2.5 rounded-xl shrink-0",
          status === "available" ? "bg-success-light text-success" :
          status === "occupied" ? "bg-danger-light text-danger" :
          status === "reserved" ? "bg-purple-100 text-reserved" : "bg-gray-150 text-maintenance"
        )}>
          <Bed className="h-5 w-5" />
        </div>
        <div className="overflow-hidden">
          <h4 className="text-sm font-bold text-text-primary dark:text-white leading-snug">Bed {bedNumber}</h4>
          <p className="text-xs text-text-secondary font-medium truncate">
            {status === "occupied" && tenantName ? tenantName : statusConfig[status].label}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end shrink-0 select-none">
        <Badge variant={statusConfig[status].variant} icon={true} className="scale-90" />
        {onAction && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction();
            }}
            className="text-[10px] font-bold text-primary hover:underline mt-2.5 cursor-pointer"
          >
            Assign
          </button>
        )}
      </div>
    </Card>
  );
};

// 8. TENANT CARD
export interface TenantCardProps extends CardProps {
  name: string;
  roomNumber: string;
  bedNumber: string;
  joinedDate: string;
  outstandingBalance: number;
  phone?: string;
  onAction?: () => void;
}

export const TenantCard: React.FC<TenantCardProps> = ({
  name,
  roomNumber,
  bedNumber,
  joinedDate,
  outstandingBalance,
  phone,
  onAction,
  className,
  ...props
}) => {
  return (
    <Card className={cn(className)} {...props}>
      <CardHeader className="py-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-full bg-primary-light flex items-center justify-center text-primary text-sm font-bold select-none uppercase">
            {name.charAt(0)}
          </div>
          <div className="select-none">
            <h4 className="text-sm font-bold text-text-primary dark:text-white">{name}</h4>
            <p className="text-[10px] text-text-secondary font-semibold">Room {roomNumber} &bull; Bed {bedNumber}</p>
          </div>
        </div>
        <Badge variant={outstandingBalance > 0 ? "danger" : "success"}>
          {outstandingBalance > 0 ? `₹${outstandingBalance} Due` : "Paid"}
        </Badge>
      </CardHeader>

      <CardBody className="py-4 select-none flex flex-col gap-1.5 text-xs text-text-secondary">
        <div className="flex justify-between items-center">
          <span>Joined Date</span>
          <span className="font-semibold text-text-primary dark:text-gray-300">{joinedDate}</span>
        </div>
        {phone && (
          <div className="flex justify-between items-center">
            <span>Contact</span>
            <span className="font-semibold text-text-primary dark:text-gray-300 flex items-center gap-1"><Phone className="h-3 w-3" /> {phone}</span>
          </div>
        )}
      </CardBody>

      {onAction && (
        <CardFooter className="py-3 flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction();
            }}
            className="text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            View Profile &rarr;
          </button>
        </CardFooter>
      )}
    </Card>
  );
};

// 9. ACTION CARD
export interface ActionCardProps extends CardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actionText: string;
  onAction: () => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon: IconComponent,
  actionText,
  onAction,
  className,
  ...props
}) => (
  <Card
    hoverable
    onClick={onAction}
    className={cn("p-5 flex items-start gap-4 hover:border-primary/50 group", className)}
    {...props}
  >
    <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
      <IconComponent className="h-5 w-5" />
    </div>
    <div className="space-y-1 overflow-hidden select-none flex-1">
      <h4 className="text-sm font-bold text-text-primary group-hover:text-primary dark:text-white transition duration-150">
        {title}
      </h4>
      <p className="text-xs text-text-secondary leading-relaxed pr-2">
        {description}
      </p>
      <p className="text-xs font-bold text-primary inline-flex items-center gap-1 pt-1.5">
        {actionText} &rarr;
      </p>
    </div>
  </Card>
);

// 10. COMPLAINT CARD
export interface ComplaintCardProps extends CardProps {
  title: string;
  description: string;
  reporterName: string;
  roomNumber: string;
  dateReported: string;
  status: "pending" | "maintenance" | "success" | "danger";
  onAction?: () => void;
  actionText?: string;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({
  title,
  description,
  reporterName,
  roomNumber,
  dateReported,
  status,
  onAction,
  actionText = "Assign Ticket",
  className,
  ...props
}) => {
  const statusColors = {
    pending: "pending" as const,
    maintenance: "maintenance" as const,
    success: "success" as const,
    danger: "danger" as const,
  };

  const statusLabels = {
    pending: "Pending Review",
    maintenance: "In Progress",
    success: "Resolved",
    danger: "Critical",
  };

  return (
    <Card className={cn(className)} {...props}>
      <CardHeader className="py-4">
        <div className="flex items-center gap-2 select-none">
          <div className="p-2 bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 rounded-xl">
            <MessageSquare className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-primary dark:text-white truncate max-w-[160px]">{title}</h4>
            <p className="text-[10px] text-text-secondary font-semibold">Room {roomNumber} &bull; {reporterName}</p>
          </div>
        </div>
        <Badge variant={statusColors[status]} icon={true}>
          {statusLabels[status]}
        </Badge>
      </CardHeader>
      
      <CardBody className="py-4 select-none">
        <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{description}</p>
        <div className="flex justify-between items-center text-[10px] text-text-muted mt-3 font-semibold">
          <span>Reported Date</span>
          <span>{dateReported}</span>
        </div>
      </CardBody>

      {onAction && (
        <CardFooter className="py-3 flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAction();
            }}
            className="text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            {actionText} &rarr;
          </button>
        </CardFooter>
      )}
    </Card>
  );
};

// 11. PAYMENT CARD
export interface PaymentCardProps extends CardProps {
  transactionId: string;
  tenantName: string;
  amount: number | string;
  date: string;
  status: "paid" | "pending" | "danger";
  onDownloadReceipt?: () => void;
}

export const PaymentCard: React.FC<PaymentCardProps> = ({
  transactionId,
  tenantName,
  amount,
  date,
  status,
  onDownloadReceipt,
  className,
  ...props
}) => {
  const statusLabels = {
    paid: "Paid",
    pending: "Pending Verify",
    danger: "Unpaid",
  };

  return (
    <Card className={cn(className)} {...props}>
      <CardHeader className="py-4">
        <div className="flex items-center gap-2 select-none">
          <div className="p-2 bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400 rounded-xl">
            <CreditCard className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-primary dark:text-white">{tenantName}</h4>
            <p className="text-[10px] text-text-secondary font-mono">TXN: {transactionId}</p>
          </div>
        </div>
        <Badge variant={status} icon={true}>
          {statusLabels[status]}
        </Badge>
      </CardHeader>
      
      <CardBody className="py-4 select-none flex flex-col gap-1.5 text-xs text-text-secondary">
        <div className="flex justify-between items-center">
          <span>Amount</span>
          <span className="font-extrabold text-sm text-text-primary dark:text-white">₹{amount}</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span>Transaction Date</span>
          <span className="font-semibold text-text-primary dark:text-gray-300">{date}</span>
        </div>
      </CardBody>

      {onDownloadReceipt && (
        <CardFooter className="py-3 flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownloadReceipt();
            }}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Receipt</span>
          </button>
        </CardFooter>
      )}
    </Card>
  );
};

// 12. NOTICE CARD
export interface NoticeCardProps extends CardProps {
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  date: string;
  onViewStats?: () => void;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({
  title,
  content,
  authorName,
  authorRole,
  date,
  onViewStats,
  className,
  ...props
}) => {
  return (
    <Card className={cn(className)} {...props}>
      <CardHeader className="py-4">
        <div className="flex items-center gap-2 select-none">
          <div className="p-2 bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 rounded-xl">
            <Megaphone className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-text-primary dark:text-white truncate max-w-[180px]">{title}</h4>
            <p className="text-[10px] text-text-secondary font-semibold">{authorName} ({authorRole})</p>
          </div>
        </div>
      </CardHeader>
      
      <CardBody className="py-4 select-none">
        <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">{content}</p>
        <div className="flex justify-between items-center text-[10px] text-text-muted mt-3 font-semibold">
          <span>Published Date</span>
          <span>{date}</span>
        </div>
      </CardBody>

      {onViewStats && (
        <CardFooter className="py-3 flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewStats();
            }}
            className="text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            Read Stats &rarr;
          </button>
        </CardFooter>
      )}
    </Card>
  );
};

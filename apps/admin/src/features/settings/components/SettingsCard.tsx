import React from "react";

interface SettingsCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  children
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl shadow-sm overflow-hidden p-6 space-y-6">
      <div className="border-b border-gray-100 dark:border-gray-850 pb-4">
        <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">
          {title}
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          {description}
        </p>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default SettingsCard;

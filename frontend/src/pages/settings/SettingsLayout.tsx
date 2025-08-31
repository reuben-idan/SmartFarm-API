import { Outlet } from 'react-router-dom';
import { SettingsSidebar } from '@/components/settings/SettingsSidebar';

export function SettingsLayout() {
  return (
    <div className="flex h-full">
      <div className="hidden w-64 border-r p-4 md:block">
        <SettingsSidebar />
      </div>
      <div className="flex-1 overflow-auto p-6">
        <Outlet />
      </div>
    </div>
  );
}

"use client";

import AppSubmenu from "./AppSubmenu";
import { MenuModel, MenuItem } from "@/types/menu";

interface AppMenuProps {
  model: MenuModel[];
  onMenuItemClick?: (event: { originalEvent: React.MouseEvent; item: MenuItem }) => void;
}

export default function AppMenu({ model, onMenuItemClick }: AppMenuProps) {
  return (
    <div className="layout-menu-container">
      <AppSubmenu
        items={model}
        root={true}
        onMenuItemClick={onMenuItemClick}
      />
    </div>
  );
}

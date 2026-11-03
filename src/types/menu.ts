export interface MenuItem {
  label?: string;
  icon?: string;
  to?: string;
  url?: string;
  items?: MenuItem[];
  badge?: string;
  target?: string;
  separator?: boolean;
  style?: React.CSSProperties;
  class?: string;
  disabled?: boolean;
  visible?: boolean | (() => boolean);
  /** Hidden unless the signed-in admin's role holds this permission */
  permission?: string;
  command?: (event: { originalEvent: React.MouseEvent; item: MenuItem }) => void;
  commandKey?: string;
}

export interface MenuModel {
  label: string;
  items: MenuItem[];
}

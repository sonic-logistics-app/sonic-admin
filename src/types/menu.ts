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
  command?: (event: { originalEvent: React.MouseEvent; item: MenuItem }) => void;
}

export interface MenuModel {
  label: string;
  items: MenuItem[];
}

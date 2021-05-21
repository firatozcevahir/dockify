export interface TableColumns {
  name: string;
  dataKey: string;
  position?: 'right' | 'left';
  isSortable?: boolean;
}

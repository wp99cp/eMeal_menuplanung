import { MatPaginatorIntl } from '@angular/material';
export function customPaginator() {
  const customPaginatorIntl = new MatPaginatorIntl();
  customPaginatorIntl.itemsPerPageLabel = 'Lager pro Seite';
  customPaginatorIntl.getRangeLabel = ((page: number, pageSize: number, length: number) => {
    length = Math.max(length, 0);
    const startIndex = (page * pageSize === 0 && length !== 0) ? 1 : (page * pageSize + 1);
    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = Math.min(startIndex - 1 + pageSize, length);
    return startIndex + ' bis ' + endIndex + ' von ' + length;
  });
  return customPaginatorIntl;
}

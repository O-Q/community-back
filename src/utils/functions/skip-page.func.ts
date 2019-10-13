export function calcSkippedPage(itemsPerPage: number, page: number) {
  return itemsPerPage * (page - 1);
}

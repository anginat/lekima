export const isLineEndColumn = (visit = 0, length = 0, col = 0) => {
  if (length < 1 || col < 1 || length === col) {
    return false;
  }
  const countRow = Math.ceil(length / col);
  const countVisit = Math.ceil((visit + 1) / col);
  return countRow === countVisit;
};

export const ProductStockStatus = {
  INSTOCK: 'instock',
  OUTOFSTOCK: 'outofstock',
};

export const checkProductStockStatus = status => {
  return status === ProductStockStatus.INSTOCK;
};

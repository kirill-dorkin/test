import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [itemsData, setItemsData] = useState({ items: [], total: 0, page: 1 });

  const fetchItems = useCallback(async ({ q, page, limit, signal }) => {
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    params.append('page', page);
    params.append('limit', limit);
    const res = await fetch(`http://localhost:3001/api/items?${params}`, { signal });
    const json = await res.json();
    setItemsData(json);
  }, []);

  return (
    <DataContext.Provider value={{ itemsData, fetchItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);

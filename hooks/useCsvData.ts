
import { useState, useEffect } from 'react';

// A simple CSV parser
const parseCsv = <T,>(csvText: string): T[] => {
  try {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    return lines.slice(1).map(line => {
      // This regex handles comma-separated values, including those enclosed in quotes.
      const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.trim().replace(/(^"|"$)/g, ''));
      
      const obj: Record<string, any> = {};
      headers.forEach((header, index) => {
        obj[header] = values[index];
      });
      return obj as T;
    });
  } catch (error) {
    console.error("Failed to parse CSV:", error);
    return [];
  }
};

export const useCsvData = <T,>(url: string) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        const parsedData = parseCsv<T>(text);
        setData(parsedData);
      } catch (e) {
        setError(e as Error);
        console.error("Error fetching or parsing CSV data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};

export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 1) {
    return [];
  }

  // Robust header parsing: remove quotes and trim whitespace
  const headers = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, '').trim());
  const dataRows = lines.slice(1);
  
  return dataRows.map(line => {
    // This regex handles commas inside quoted fields
    const values = [];
    let currentMatch = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(currentMatch.trim().replace(/^"|"$/g, '').trim());
            currentMatch = '';
        } else {
            currentMatch += char;
        }
    }
    values.push(currentMatch.trim().replace(/^"|"$/g, '').trim()); // Push the last value

    const rowObject: Record<string, string> = {};
    headers.forEach((header, index) => {
      rowObject[header] = values[index] || ''; // Ensure value exists
    });
    return rowObject;
  });
}

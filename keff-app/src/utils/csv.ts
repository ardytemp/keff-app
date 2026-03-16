import * as FileSystem from 'expo-file-system';

const FS = FileSystem as any;

export async function exportToCSV(data: any[], filename: string): Promise<string> {
  if (data.length === 0) throw new Error('No data to export');
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row => headers.map(fieldName => JSON.stringify(row[fieldName] ?? '')).join(','))
  ];
  const csvString = csvRows.join('\n');
  const fileUri = FS.documentDirectory + filename;
  await FS.writeAsStringAsync(fileUri, csvString);
  return fileUri;
}

export async function importFromCSV(fileUri: string): Promise<any[]> {
  const fileContent = await FS.readAsStringAsync(fileUri);
  const lines = fileContent.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
  const results: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row: any = {};
      headers.forEach((h, idx) => row[h] = values[idx]);
      results.push(row);
    }
  }
  return results;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

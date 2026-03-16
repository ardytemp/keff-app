import * as FileSystem from 'expo-file-system';
import Papa from 'papaparse';

export async function exportToCSV(data: any[], filename: string): Promise<string> {
  const csv = Papa.unparse(data);
  const fileUri = FileSystem.documentDirectory + filename;
  await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
  return fileUri;
}

export async function importFromCSV(fileUri: string): Promise<any[]> {
  const fileContent = await FileSystem.readAsStringAsync(fileUri);
  return new Promise((resolve, reject) => {
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data as any[]),
      error: (error) => reject(error),
    });
  });
}

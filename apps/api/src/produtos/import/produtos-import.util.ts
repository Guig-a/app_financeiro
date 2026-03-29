import * as fs from 'fs';
import * as csv from 'csv-parser';

export async function parseCsv(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv({ separator: ';' }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

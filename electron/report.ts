import { BrowserWindow } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import { app } from 'electron';

export async function buildClientReport(filters: any, win: BrowserWindow) {
  // Simple HTML template
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 40px; }
    h1 { font-size: 24px; margin-bottom: 8px; }
    h2 { font-size: 18px; border-bottom: 2px solid #333; padding-bottom: 4px; margin-top: 24px; }
    .meta { color: #666; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
    th { background-color: #f5f5f5; }
  </style>
</head>
<body>
  <h1>Client Compliance Pack</h1>
  <div class="meta">
    <strong>Client:</strong> ${filters.client || 'Client'} | 
    <strong>Period:</strong> ${filters.period || '2025-10'} | 
    <strong>RBCS:</strong> 87%
  </div>
  
  <h2>Executive Summary</h2>
  <p>Coverage: 94% | Quality: 91% | Effectiveness: 78% | Velocity: 85%</p>
  <p>Top gaps: Isolation CRV cadence, Confined Space training refresh</p>
  
  <h2>Control Coverage by Type</h2>
  <table>
    <thead>
      <tr>
        <th>Type</th>
        <th>Required</th>
        <th>Implemented</th>
        <th>Valid</th>
        <th>Overdue</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Training</td>
        <td>28</td>
        <td>26</td>
        <td>24</td>
        <td>2</td>
        <td>LV Rescue refresh due</td>
      </tr>
      <tr>
        <td>Documents</td>
        <td>12</td>
        <td>12</td>
        <td>11</td>
        <td>1</td>
        <td>SWMS annual review</td>
      </tr>
      <tr>
        <td>Verification</td>
        <td>15</td>
        <td>13</td>
        <td>12</td>
        <td>2</td>
        <td>Isolation checks ageing</td>
      </tr>
    </tbody>
  </table>
</body>
</html>
  `;

  // Create a hidden window to render PDF
  const reportWindow = new BrowserWindow({ show: false });
  await reportWindow.loadURL('data:text/html;charset=UTF-8,' + encodeURIComponent(html));

  const pdfData = await reportWindow.webContents.printToPDF({
    printBackground: true,
    pageSize: 'A4',
  });

  // Save to Reports folder
  const reportsDir = path.join(app.getPath('documents'), 'SafetyIntelligence', 'Reports');
  await fs.mkdir(reportsDir, { recursive: true });

  const filename = `${filters.client || 'Client'}_${filters.period || '2025-10'}_Compliance.pdf`;
  const pdfPath = path.join(reportsDir, filename);

  await fs.writeFile(pdfPath, pdfData);
  reportWindow.close();

  return { pdfPath };
}
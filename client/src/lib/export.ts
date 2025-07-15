export function downloadCSV(data: any[], filename: string, headers: string[]) {
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header.toLowerCase().replace(/\s+/g, '')] || '';
        return `"${value.toString().replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportGuests() {
  try {
    const response = await fetch('/api/export/guests');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guests.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export guests:', error);
  }
}

export async function exportTasks() {
  try {
    const response = await fetch('/api/export/tasks');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export tasks:', error);
  }
}

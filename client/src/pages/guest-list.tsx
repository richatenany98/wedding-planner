import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { GuestTable } from '@/components/guest-table';
import { exportGuests } from '@/lib/export';

export default function GuestList() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Guest List Management</h2>
            <p className="text-neutral-600">Manage guests across all events</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" onClick={exportGuests}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Guest List</CardTitle>
          </CardHeader>
          <CardContent>
            <GuestTable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

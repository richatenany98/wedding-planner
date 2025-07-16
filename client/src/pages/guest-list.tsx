import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GuestTable } from "@/components/guest-table";
import { GuestImport } from "@/components/guest-import";

export default function GuestList() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">
              Guest List Management
            </h2>
            <p className="text-neutral-600">Manage guests across all events</p>
          </div>
          <div className="flex items-center space-x-4">
            <GuestImport />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle> Our Favorite People</CardTitle>
          </CardHeader>
          <CardContent>
            <GuestTable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

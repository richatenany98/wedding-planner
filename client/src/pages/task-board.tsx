import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { KanbanBoard } from '@/components/kanban-board';
import { exportTasks } from '@/lib/export';

export default function TaskBoard() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Task Management</h2>
            <p className="text-neutral-600">Track wedding planning progress</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={exportTasks}>
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
            <CardTitle>Task Board</CardTitle>
          </CardHeader>
          <CardContent>
            <KanbanBoard />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

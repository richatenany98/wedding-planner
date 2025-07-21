import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GuestTable } from "@/components/guest-table";
import { GuestImport } from "@/components/guest-import";
import { Users, Heart, Sparkles } from "lucide-react";
import { WeddingProfile } from "@shared/schema";

interface GuestListProps {
  weddingProfile: WeddingProfile;
}

export default function GuestList({ weddingProfile }: GuestListProps) {
  return (
    <div className="min-h-screen p-6 lg:p-8">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="wedding-card p-8 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4 mb-6 lg:mb-0">
              <div className="relative">
                <div className="w-16 h-16 wedding-gradient-rose rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="text-white" size={28} />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 wedding-gradient-gold rounded-full flex items-center justify-center">
                  <Heart className="text-white" size={12} />
                </div>
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Guest List Management
                </h1>
                <p className="text-lg text-neutral-600">
                  Manage your favorite people across all events
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <GuestImport />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="wedding-card">
        <CardHeader className="border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 wedding-gradient-pink rounded-lg flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <CardTitle className="text-2xl font-bold text-neutral-800">
              Our Favorite People
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <GuestTable weddingProfile={weddingProfile} />
        </CardContent>
      </div>
    </div>
  );
}

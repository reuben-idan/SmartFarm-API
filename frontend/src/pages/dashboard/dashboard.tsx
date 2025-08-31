import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import TestFirebase from "@/components/TestFirebase";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            SmartFarm Dashboard
          </h1>
          <p className="text-muted-foreground">Firebase Authentication Test</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Firebase Status</CardTitle>
              <Activity className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <TestFirebase />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BarChart3, TrendingUp, FileText, Clock } from "lucide-react";

export function Reports() {
  const reports = [
    {
      title: "Claims Processing Time",
      value: "2.3 days",
      change: "-15%",
      icon: Clock,
      trend: "down",
    },
    {
      title: "Approval Rate",
      value: "87.5%",
      change: "+5%",
      icon: TrendingUp,
      trend: "up",
    },
    {
      title: "Total Claims This Month",
      value: "245",
      change: "+12%",
      icon: FileText,
      trend: "up",
    },
    {
      title: "AI Automation Rate",
      value: "65%",
      change: "+8%",
      icon: BarChart3,
      trend: "up",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1>Reports & Analytics</h1>
        <p className="text-gray-500">View detailed insights and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reports.map((report, index) => {
          const Icon = report.icon;
          return (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{report.title}</CardTitle>
                  <Icon className="h-4 w-4 text-gray-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{report.value}</div>
                <p
                  className={`text-sm mt-1 ${
                    report.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {report.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Reports Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Advanced reporting features including charts, graphs, and exportable data will be
            available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

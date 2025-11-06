import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface KPICardData {
  title: string;
  value: string;
}

interface KPICardsProps {
  data: KPICardData[];
}

export function KPICards({ data }: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4">
      {data.map((card, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">{card.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

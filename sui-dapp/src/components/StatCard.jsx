import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const StatCard = ({ label, value, icon: Icon }) => (
  <Card className="border-border bg-card/50 hover:bg-card transition-colors">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground font-mono">
        {label}
      </CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold font-sans">{value}</div>
    </CardContent>
  </Card>
);

export default StatCard;

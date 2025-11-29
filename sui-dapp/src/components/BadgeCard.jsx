import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Calendar } from "lucide-react";

const BadgeCard = ({ badge }) => {
  const content = badge.data?.content?.fields;
  const display = badge.data?.display?.data;

  if (!content) return null;

  const formatDate = (timestamp) => {
    // Sui uses epoch timestamp - convert to readable date
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
  };

  return (
    <Card className="border-border bg-card/50 hover:bg-card transition-all hover:scale-[1.02]">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <h3 className="font-sans font-bold text-lg line-clamp-1">
                {content.project_name || display?.project_name || "Badge"}
              </h3>
            </div>
            
            <Badge variant="secondary" className="font-mono text-xs">
              {content.contribution_type || display?.contribution_type || "Contribution"}
            </Badge>
          </div>
          
          {content.image_url && (
            <img 
              src={content.image_url} 
              alt={content.project_name}
              className="w-16 h-16 rounded-lg object-cover border border-border"
            />
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 font-sans">
          {content.description || display?.description}
        </p>

        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
          <Calendar className="h-3 w-3" />
          {content.timestamp && formatDate(content.timestamp)}
        </div>

        <div className="pt-2 border-t border-border">
          <p className="text-xs font-mono text-muted-foreground">
            🔒 Soulbound • Non-Transferable
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BadgeCard;

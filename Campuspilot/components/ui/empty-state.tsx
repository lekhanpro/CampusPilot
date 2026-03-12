import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Card className="border-dashed bg-muted/35">
      <CardContent className="flex flex-col items-start gap-3 p-6">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        {actionLabel && onAction ? <Button onClick={onAction}>{actionLabel}</Button> : null}
      </CardContent>
    </Card>
  );
}

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function UserAvatar({ user, className }: { user: { username: string; image?: string | null }; className?: string }) {
  return (
    <Avatar className={cn(className)}>
      <AvatarImage src={user.image || ""} />
      <AvatarFallback>{user.username?.substring(0, 1).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}

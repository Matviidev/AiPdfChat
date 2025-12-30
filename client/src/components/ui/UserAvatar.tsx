import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface UserAvatarProps {
  email: string;
}

export default function UserAvatar({ email }: UserAvatarProps) {
  return (
    <div className="flex items-center gap-2">
      <Avatar className="w-8 h-8">
        <AvatarFallback className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs">
          <User className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>
      <span className="text-sm text-gray-700 hidden sm:inline">{email}</span>
    </div>
  );
}

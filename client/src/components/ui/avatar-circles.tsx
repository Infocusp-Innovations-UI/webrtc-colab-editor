import { cn } from "../../lib/utils";
import { User } from "../../utils/user";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipPositioner } from "./tooltip";

interface AvatarCirclesProps {
  className?: string
  displayCount?: number
  users: User[]
}

const DEFAULT_DISPLAY_COUNT = 3;

export const AvatarCircles = ({
  className,
  displayCount = DEFAULT_DISPLAY_COUNT,
  users,
}: AvatarCirclesProps) => {
  return (
    <div className={cn("z-10 flex -space-x-4 rtl:space-x-reverse", className)}>
      {users.slice(0, displayCount).map(({ id, name, color }: User) => (
        <Tooltip key={id}>
          <TooltipTrigger delay={3000}>
            <img
              key={id}
              className="h-10 w-10 rounded-full border-2 border-white dark:border-gray-800"
              src={`https://api.dicebear.com/9.x/notionists/svg?seed=${name}`}
              width={60}
              height={60}
              style={{
                backgroundColor: color,
              }}
            />
          </TooltipTrigger>
          <TooltipPositioner side="bottom">
            <TooltipContent>
              <p>{name}</p>
            </TooltipContent>
          </TooltipPositioner>
        </Tooltip>
      ))}
      {users.length > displayCount && (
        <a
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-black text-center text-xs font-medium text-white hover:bg-gray-600 dark:border-gray-800 dark:bg-white dark:text-black"
          href=""
        >
          +{users.length - displayCount}
        </a>
      )}
    </div>
  )
}

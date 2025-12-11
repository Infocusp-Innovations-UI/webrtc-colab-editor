import { cn } from "../../lib/utils";
import { User } from "../../utils/user";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipPositioner } from "./tooltip";

interface AvatarCirclesProps {
  className?: string
  displayCount?: number
  users: User[]
}

const DEFAULT_DISPLAY_COUNT = 3;
const AVATAR_SIZE = 60;

export const AvatarCircles = ({
  className,
  displayCount = DEFAULT_DISPLAY_COUNT,
  users,
}: AvatarCirclesProps) => {
  return (
    <div className={cn("z-10 flex -space-x-4 rtl:space-x-reverse", className)}>
      {users.slice(0, displayCount).map(({ id, name, color }: User) => (
        <Tooltip key={id}>
          <TooltipTrigger>
            <img
              className="rounded-full border-4"
              src={`https://api.dicebear.com/9.x/notionists/svg?seed=${name}`}              
              style={{
                backgroundColor: 'white',
                borderColor: color,
                height: AVATAR_SIZE,
                width: AVATAR_SIZE,
              }}
              alt={name}
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
        <Popover>
          <PopoverTrigger asChild>
            <span
              className="cursor-pointer flex items-center justify-center rounded-full bg-black text-center text-base font-medium text-white hover:bg-gray-600"
              style={{               
                height: AVATAR_SIZE,
                width: AVATAR_SIZE,
              }}          
            >
              +{users.length - displayCount}
            </span>
          </PopoverTrigger>
          <PopoverContent side="bottom" className="w-auto p-4">
            <div className="flex flex-col space-y-2">
              {users.slice(displayCount).map(({ id, name, color }: User) => (
                <div key={id} className="flex items-center space-x-2 rtl:space-x-reverse">
                  <img
                    className="rounded-full border-2"
                    src={`https://api.dicebear.com/9.x/notionists/svg?seed=${name}`}                    
                    style={{             
                      borderColor: color,         
                      height: AVATAR_SIZE / 2,
                      width: AVATAR_SIZE / 2,
                    }}
                    alt={name}
                  />
                  <span className="text-sm font-medium">{name}</span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}

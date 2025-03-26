import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";

interface NavButtonProps {
  path: string;
  label: string;
}

export const NavButton: React.FC<NavButtonProps> = ({ path, label }) => {
  const { theme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const isDarkMode = theme === "dark";
  const isActive = pathname === path;

  return (
    <Button
      variant="ghost"
      onClick={() => router.push(path)}
      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ease-in-out transform ${
        isActive
          ? isDarkMode
            ? `bg-primary text-black`
            : `bg-primary text-white`
          : isDarkMode
            ? "text-gray-400 hover:text-white hover:scale-105"
            : "text-gray-600 hover:text-black hover:scale-105"
      }`}
    >
      {label.toUpperCase()}
    </Button>
  );
};

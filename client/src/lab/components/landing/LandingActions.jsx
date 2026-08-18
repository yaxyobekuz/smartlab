// Landing sahifasidagi asosiy tugmalar. "3D" uslub: pastda qattiq soya, hover'da
// ko'tariladi, bosilganda botadi.
import { Link } from "react-router-dom";
import { cn } from "@/shared/utils/cn";

const baseLift =
  "group inline-block rounded-2xl pb-1.5 transition-all duration-150 hover:pb-2 active:translate-y-1.5 active:pb-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none";

const primaryShadow =
  "bg-purple-800 shadow-[0_6px_0_0_theme(colors.purple.900)] hover:shadow-[0_8px_0_0_theme(colors.purple.900)] active:shadow-[0_1px_0_0_theme(colors.purple.900)]";

const secondaryShadow =
  "bg-primary/20 shadow-[0_6px_0_0_theme(colors.violet.300)] hover:shadow-[0_8px_0_0_theme(colors.violet.300)] active:shadow-[0_1px_0_0_theme(colors.violet.300)] dark:shadow-[0_6px_0_0_theme(colors.violet.800)] dark:hover:shadow-[0_8px_0_0_theme(colors.violet.800)] dark:active:shadow-[0_1px_0_0_theme(colors.violet.800)]";

const faceBase =
  "flex items-center justify-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-bold";

export const PrimaryAction = ({ to, icon: Icon, children, className }) => (
  <Link to={to} className={cn(baseLift, primaryShadow, className)}>
    <span
      className={cn(
        faceBase,
        "bg-gradient-to-br from-violet-500 to-purple-600 text-white",
      )}
    >
      {children}
      {Icon && (
        <Icon
          size={16}
          className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
        />
      )}
    </span>
  </Link>
);

export const SecondaryAction = ({ onClick, icon: Icon, children, className }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(baseLift, secondaryShadow, className)}
  >
    <span
      className={cn(
        faceBase,
        "border border-primary/30 bg-background/90 text-primary backdrop-blur",
      )}
    >
      {Icon && <Icon size={16} />}
      {children}
    </span>
  </button>
);

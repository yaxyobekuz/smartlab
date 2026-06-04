// Utils
import { cn } from "@/shared/utils/cn";

// Router
import { Link } from "react-router-dom";

// Icons
import { ArrowLeft } from "lucide-react";

// Components
import { Button } from "@/shared/components/shadcn/button";

const BackLink = ({ to = "", label = "", className = "" }) => (
  <Button
    asChild
    variant="outline"
    className={cn(label ? "" : "size-10", className)}
  >
    <Link to={to}>
      <ArrowLeft className="size-4" />
      {label}
    </Link>
  </Button>
);

export default BackLink;

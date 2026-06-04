import { cn } from "@/shared/utils/cn.js";
import { inputBaseClasses } from "./Input";

const formatGroups = (digits) => digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

const InputPrice = ({ className, value = "", onChange, ...props }) => {
  const raw = String(value ?? "").replace(/\D/g, "");
  const display = formatGroups(raw);

  const handleChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "");
    if (!onChange) return;
    onChange({ ...e, target: { ...e.target, value: digits } });
  };

  return (
    <input
      {...props}
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
      className={cn(inputBaseClasses, "tabular-nums", className)}
    />
  );
};

export default InputPrice;

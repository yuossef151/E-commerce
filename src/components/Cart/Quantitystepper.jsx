import { Minus, Plus, Trash2, Loader2 } from "lucide-react";

// [ - ] 2 [ + ]
// tone="brand" : filled maroon (product cards)
// tone="light" : white with a border (cart table)
// allowRemove  : when true, the "-" button becomes a trash icon at quantity 1
//                and onChange(0) is called (removes the product)
export default function QuantityStepper({
  value,
  max = 99,
  busy = false,
  onChange,
  tone = "brand",
  allowRemove = true,
}) {
  const isBrand = tone === "brand";

  const wrapClass = isBrand
    ? "bg-[#8A1C38] text-white"
    : "bg-white text-gray-900 border border-gray-200";
  const btnClass = isBrand ? "hover:bg-[#621428]" : "text-[#8A1C38] hover:bg-gray-100";

  const atOne = value <= 1;
  const showTrash = allowRemove && atOne;

  return (
    <div
      className={`inline-flex h-9 min-w-[104px] items-center justify-between overflow-hidden rounded-xl ${wrapClass}`}
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={busy || (!allowRemove && atOne)}
        aria-label={showTrash ? "Remove from cart" : "Decrease quantity"}
        className={`flex h-full w-9 cursor-pointer items-center justify-center transition disabled:cursor-not-allowed disabled:opacity-40 ${btnClass}`}
      >
        {showTrash ? <Trash2 size={15} /> : <Minus size={16} />}
      </button>

      <span
        aria-live="polite"
        className="flex w-8 items-center justify-center text-sm font-bold tabular-nums"
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : value}
      </span>

      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={busy || value >= max}
        aria-label="Increase quantity"
        className={`flex h-full w-9 cursor-pointer items-center justify-center transition disabled:cursor-not-allowed disabled:opacity-40 ${btnClass}`}
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
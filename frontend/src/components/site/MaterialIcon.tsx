type Props = { name: string; filled?: boolean; size?: number; className?: string };

/** Google Material Symbols (rounded). Filled when the item is active. */
export default function MaterialIcon({ name, filled = false, size, className }: Props) {
  return (
    <span
      className={`ms${filled ? " fill" : ""}${className ? ` ${className}` : ""}`}
      style={size ? { fontSize: size } : undefined}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

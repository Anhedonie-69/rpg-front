export default function Button({
  children,
  onClick,
  variant = 'primary',
  type = 'button'
}) {
  const base = "px-4 py-2 rounded transition font-medium"

  const styles = {
    primary: "bg-green-600 hover:bg-green-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    ghost: "bg-transparent hover:bg-gray-700 text-white border border-gray-500"
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${styles[variant]}`}
    >
      {children}
    </button>
  )
}
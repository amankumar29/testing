import "./RadioButtons.style.scss";

export default function RadioButtons({
  onClick = () => {},
  id,
  value,
  checked,
  className,
}) {
  return (
    <div className="flex items-center justify-center gap-2 cursor-pointer">
      <input
        type="radio"
        id={id}
        name={id}
        value={value}
        className="custom-radio"
        onChange={() => onClick(value)}
        checked={checked}
      />
      <label htmlFor={id} className={className}>
        {value}
      </label>
    </div>
  );
}

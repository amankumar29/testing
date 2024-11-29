import PropTypes from "prop-types";

const ChipTitle = ({ label, onClick }) => {
  return (
    <div
      className="rounded-[10px] text-ibl1 text-xl font-bold w-fit"
      onClick={onClick}
    >
      {label}
    </div>
  );
};

export default ChipTitle;

ChipTitle.propTypes = {
  onClick: PropTypes.func,
  label: PropTypes.string,
};

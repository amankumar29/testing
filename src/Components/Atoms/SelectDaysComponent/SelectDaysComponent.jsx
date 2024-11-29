import SelectDaysCheckbox from "../SelectDaysCheckbox/SelectDaysCheckbox";

function SelectDaysComponent({ option, selectedDays, onClick = () => {} }) {
  return (
    <>
      {option?.map((item, index) => {
        const isChecked = selectedDays.includes(item?.type);
        return (
          <div key={index} className="flex">
            <SelectDaysCheckbox
              id={`checkbox-${item.type}`}
              label={item.name}
              isHeaderCheck={true}
              onClick={() => onClick(item?.type)}
              index={index}
              classNameLabel="text-[10px]"
              checked={isChecked}
              className="cursor-pointer"
            />
          </div>
        );
      })}
    </>
  );
}

export default SelectDaysComponent;

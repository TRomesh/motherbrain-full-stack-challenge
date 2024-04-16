import { ChangeEvent, SyntheticEvent, useCallback, useState } from "react";
import { Button, Dropdown, Input, Menu } from "semantic-ui-react";
import debounce from "lodash.debounce";

function FilterBar({
  options,
  selectLabel,
  searchLabel,
  onSelect,
  onFilterchange,
}: {
  options?: DropDownType[] | null;
  onSelect?: (value: string) => void;
  selectLabel?: string;
  searchLabel?: string;
  onFilterchange?: (filters: object) => void;
}) {
  const [searchValue, setSearchValue] = useState("");
  const [selectValue, setSelectValue] = useState("");

  const handleDropdownChange = (
    e: SyntheticEvent<HTMLElement, Event>,
    data?: any
  ) => {
    if (onSelect) onSelect(data.value);
    setSelectValue(data.value);
  };

  const onChangeHandler = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setSearchValue(value);
      debounce(() => {
        if (onFilterchange) onFilterchange({ company_name: value });
      }, 300)();
    },
    [onFilterchange]
  );

  const handleClearFilters = () => {
    // Reset both the search input and the dropdown
    setSelectValue("");
    setSearchValue("");
    if (onFilterchange) onFilterchange({ company_name: "__" });
    if (onSelect) onSelect("");
  };

  return (
    <Menu>
      {options?.length ? (
        <Menu.Item>
          <Dropdown
            placeholder={`Select an ${selectLabel}`}
            fluid
            search
            selection
            value={selectValue}
            options={options}
            style={{ width: "350px" }}
            onChange={handleDropdownChange}
          />
        </Menu.Item>
      ) : null}

      {onFilterchange ? (
        <Menu.Item>
          <Input
            value={searchValue}
            onChange={onChangeHandler}
            style={{ width: "350px" }}
            placeholder={`Search for ${searchLabel}`}
          />
        </Menu.Item>
      ) : null}

      <Menu.Item position="right">
        <Button
          onClick={handleClearFilters}
          color="red">
          Clear
        </Button>
      </Menu.Item>
    </Menu>
  );
}

export default FilterBar;

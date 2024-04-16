import { ChangeEvent, SyntheticEvent, useCallback, useState } from "react";
import { Button, Dropdown, Input, Menu } from "semantic-ui-react";
import debounce from "lodash.debounce";

function FilterBar({
  options,
  selectLabel,
  searchLabel,
  onSelect,
  onSearch,
  onFilterchange,
}: {
  options?: DropDownType[] | null;
  onSelect?: (value: string) => void;
  selectLabel?: string;
  searchLabel?: string;
  onFilterchange?: (filters: object) => void;
  onSearch?: (value: string) => void;
}) {
  const [searchValue, setSearchValue] = useState("");
  const [selectValue, setSelectValue] = useState("");

  const handleSearchChange = (
    e: SyntheticEvent<HTMLElement, Event>,
    value?: any
  ) => {
    setSearchValue(value);
  };

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
    if (onFilterchange) onFilterchange({});
    if (onSelect) onSelect("");
  };

  return (
    <Menu>
      {onSearch?.length ? (
        <Menu.Item>
          <Input
            value={searchValue}
            onChange={handleSearchChange}
            placeholder={`Search for ${searchLabel}`}
          />
        </Menu.Item>
      ) : null}

      {options?.length ? (
        <Menu.Item>
          <Dropdown
            placeholder={`Select an ${selectLabel}`}
            fluid
            search
            selection
            value={selectValue}
            options={options}
            style={{ width: 200 }}
            onChange={handleDropdownChange}
          />
        </Menu.Item>
      ) : null}

      {onFilterchange ? (
        <Menu.Item>
          <Input
            placeholder="Company Name"
            onChange={onChangeHandler}
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

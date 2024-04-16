import { Header } from "semantic-ui-react";
import FilterBar from "../components/FilterBar";
import VixMap from "../components/VixMap";
import useFetch from "../hooks/useFetch";
import useLazyFetch from "../hooks/useLazyFetch";
import { convertToDropDown } from "../util/common";

function World() {
  const { data: investors } = useFetch<InvestorResponse>("investors");
  const { data: organization, fetchData } =
    useLazyFetch<Organization>("investorcomp");

  const options = convertToDropDown(investors);

  const onSelect = (value: string) => {
    fetchData({ investor_name: value });
  };

  return (
    <div>
      <Header>Global Investment Landscape</Header>
      <FilterBar
        selectLabel="Investor"
        options={options}
        onSelect={onSelect}
      />

      <VixMap
        options={organization}
        height={500}
        width={1125}
      />
    </div>
  );
}

export default World;

import { Header } from "semantic-ui-react";
import FilterBar from "../components/FilterBar";
import VixBar from "../components/VixBar";
import useLazyFetch from "../hooks/useLazyFetch";

function Organization() {
  const { data: organization, fetchData } =
    useLazyFetch<Organization>("organizations");

  const onFilterchange = (filters: object) => {
    fetchData({ ...filters, limit: 10 });
  };

  return (
    <div>
      <Header>Leading Investors</Header>
      <FilterBar
        selectLabel="Organization"
        onFilterchange={onFilterchange}
      />
      {organization?.length ? (
        <VixBar
          data={organization}
          height={500}
          width={1125}
        />
      ) : null}
    </div>
  );
}

export default Organization;

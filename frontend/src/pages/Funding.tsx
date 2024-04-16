import { useState } from "react";
import useFetch from "../hooks/useFetch";
import useLazyFetch from "../hooks/useLazyFetch";
import { convertToDropDown } from "../util/common";
import FilterBar from "../components/FilterBar";
import VixPie from "../components/VixPie";
import { Grid, GridColumn, GridRow, Header } from "semantic-ui-react";

function Funding() {
  const [investor, setInvestor] = useState("");
  const { data: investors } = useFetch<InvestorResponse>("investors");
  const { data: funding, fetchData } = useLazyFetch<Funding>("investorfunds");
  const options = convertToDropDown(investors);
  const onSelect = (value: string) => {
    setInvestor(value);
    fetchData({ investor_name: value });
  };

  return (
    <div>
      <Header>Premier Organizations Funded by Investors</Header>
      <FilterBar
        selectLabel="Investor"
        options={options}
        onSelect={onSelect}
      />
      <Grid padded>
        <GridRow>
          <GridColumn />
          <GridColumn />
          <GridColumn />
          <GridColumn />
          <GridColumn />
          <GridColumn floated="left">
            <VixPie
              data={funding}
              label="Investments"
              entity={investor}
            />
          </GridColumn>
        </GridRow>
      </Grid>
    </div>
  );
}

export default Funding;

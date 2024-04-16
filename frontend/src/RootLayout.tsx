import { Container, Grid, GridColumn } from "semantic-ui-react";
import NavBar from "./components/NavBar";
import { Outlet } from "react-router-dom";

function RootLayout() {
  return (
    <Grid>
      <GridColumn>
        <NavBar />
        <Container>
          <Outlet />
        </Container>
      </GridColumn>
    </Grid>
  );
}

export default RootLayout;

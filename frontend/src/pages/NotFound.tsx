import { useNavigate } from "react-router-dom";
import { Button, Container, Header, Icon, Segment } from "semantic-ui-react";

function NotFound() {
  const navigate = useNavigate();
  return (
    <Container
      text
      textAlign="center"
      style={{ marginTop: "50px" }}>
      <Header
        as="h2"
        icon>
        <Icon name="search" />
        404 - Page Not Found
        <Header.Subheader>
          Sorry, the page you are looking for does not exist.
        </Header.Subheader>
        <Header.Content>
          <Segment
            basic
            textAlign="center">
            <Button
              primary
              onClick={() => navigate("/")}>
              Go Back
            </Button>
          </Segment>
        </Header.Content>
      </Header>
    </Container>
  );
}

export default NotFound;

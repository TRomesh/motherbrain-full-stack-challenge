import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, MenuItem, Segment } from "semantic-ui-react";

function NavBar() {
  const [activeItem, setActiveItem] = useState<string>("home");
  const navigate = useNavigate();
  const handleItemClick = (name: string) => {
    setActiveItem(name);
    navigate(name === "home" ? "/" : `/${name}`);
  };
  return (
    <Segment inverted>
      <Menu
        inverted
        secondary>
        <MenuItem
          name="home"
          active={activeItem === "home"}
          onClick={() => handleItemClick("home")}
        />
        <MenuItem
          name="world"
          active={activeItem === "world"}
          onClick={() => handleItemClick("world")}
        />
        <MenuItem
          name="funding"
          active={activeItem === "funding"}
          onClick={() => handleItemClick("funding")}
        />
        <MenuItem
          name="organization"
          active={activeItem === "organization"}
          onClick={() => handleItemClick("organization")}
        />
      </Menu>
    </Segment>
  );
}

export default NavBar;

# Motherbrain Full Stack Challenge

1. Fork this repo.
2. Ensure [docker](https://www.docker.com/) is installed.
3. Add a `.env` file at the root of the repo with the content `ES_URL=placeholder`. Replace "placeholder" with the url you've received from your contact at EQT.
4. Start the project by running `docker compose up` in the root folder and open http://localhost:3000 in your browser for _further instructions_.

**Alternatively:** Install node locally and run `yarn dev` in the `backend` and `frontend` folders respectively.

## Testing

Unit test are availaable in the backend to run them just run the command `yarn test` inside the backend directory.

## Decision

1. By observing the mappings of each indexes, I found out that `company_uuid` in
   **funding** and `uuid` in **org** can not be used to create an aggregation. So the next option was to use the `company_name` to build the relationship between the two entities.

2. Searching with `investor_name` was a bit difficult as some `investor_name`
   has tailing and ending strings or brackets. Had to write a function `clearData` to clean up the `investor_name`.

3. The **org** index consist `country_code` property which can be used to display
   country details. I used `@visx/geo` with their topology data to map the country data with the **org** data.

4. Use `node-cache` to cache some requests for better performance.

## Libraries

### Backend

1. "node-cache" : To cache request data comming from elasticsearch
2. "jest" : For unit testing

### Frontend

1. "semantic-ui-react" : For building the UI
2. "topojson-client" : For reading JSON files in the frontend
3. "@visx/visx" : For visualization (charts,maps etc.)
4. "lodash.debounce" : For debouncing the onChange event in search fields
5. "axios" : For data fetching

## Screens

### Global Investment Landscape

![screencapture-localhost-3000-world-2024-04-16-21_56_38](https://github.com/99x/serverless-react-boilerplate/assets/9572090/c4f0947e-7287-4da1-bea0-319fbdc728c7)

### Premier Organizations Funded by Investors

![screencapture-localhost-3000-funding-2024-04-16-21_57_13](https://github.com/99x/serverless-react-boilerplate/assets/9572090/03e830ef-0d57-4b50-92b3-215d4f29ed29)

### Leading Investors

![screencapture-localhost-3000-organization-2024-04-16-21_57_27](https://github.com/99x/serverless-react-boilerplate/assets/9572090/077ed1bd-ddf3-460b-9596-7a43f9081dd6)

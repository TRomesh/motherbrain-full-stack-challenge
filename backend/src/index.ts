import { resolve } from "path";
import dotenv from "dotenv";
import http from "http";
import { URL } from "url";
import NodeCache from "node-cache";
import { Client } from "@elastic/elasticsearch";
import { InvestmentService } from "./service/InvestmentService";

dotenv.config({
  path: resolve(__dirname, "../..", ".env"),
});

if (!process.env.ES_URL) {
  console.error(
    "Make sure to update the .env file at the root of the repo with the correct ES_URL before starting the server."
  );
  process.exit(1);
}

const esClient = new Client({
  node: process.env.ES_URL as string,
});

const cache = new NodeCache({ stdTTL: 3600 });

const investmentService = new InvestmentService(cache, esClient);

http
  .createServer(handle)
  .listen(8080, () => console.log("Server started at http://localhost:8080"));

async function handle(
  req: http.IncomingMessage,
  res: http.ServerResponse
): Promise<void> {
  try {
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (!req.url) throw new Error("Request URL is undefined");

    const url = new URL(`http://incoming${req.url}`);
    let results;

    switch (`${req.method} ${url.pathname}`) {
      case "GET /orgs":
        results = await investmentService.searchOrgs(url.searchParams);
        break;

      case "GET /fundings":
        results = await investmentService.searchFundings(url.searchParams);
        break;

      case "GET /investors":
        results = await investmentService.getInvestorsWithMultipleEntries();
        break;

      case "GET /organizations":
        results = await investmentService.searchOrganizations(url.searchParams);
        break;

      case "GET /investorfunds":
        results = await investmentService.getFundingsByInvestor(
          url.searchParams
        );
        break;

      case "GET /investorcomp":
        results = await investmentService.getCompaniesByInvestor(
          url.searchParams
        );
        break;

      default:
        res.writeHead(404).end(JSON.stringify({ message: "Not Found" }));
        return;
    }

    res.writeHead(200).end(JSON.stringify({ message: "OK", results }));
  } catch (e) {
    res.writeHead(500).end(JSON.stringify({ message: "Something went wrong" }));
  }
}

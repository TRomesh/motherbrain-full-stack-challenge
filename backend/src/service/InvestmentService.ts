import NodeCache from "node-cache";
import { Client } from "@elastic/elasticsearch";

export class InvestmentService {
  private cache: NodeCache;
  private esClient: Client;

  constructor(cache: NodeCache, esClient: Client) {
    this.cache = cache;
    this.esClient = esClient;
  }

  async executeQuery(index: string, body: object) {
    try {
      const { body: response } = await this.esClient.search({
        index,
        body,
      });
      return response;
    } catch (error) {
      return null;
    }
  }

  async searchOrgs(queryParams: URLSearchParams) {
    const limit = queryParams.get("limit");
    const offset = queryParams.get("offset");

    // Construct the body for the Elasticsearch query
    const body = {
      size: limit != null ? parseInt(limit) : 10,
      from: offset != null ? parseInt(offset) : 0,
    };

    // Execute the query using the centralized executeQuery method
    const response = await this.executeQuery("org", body);

    // Check if response is null (indicating an error occurred) and handle accordingly
    if (response === null) {
      console.error("Failed to execute search for orgs");
      return { hits: [], total: 0 }; // Return an empty result set on error
    }

    // Format and return the results
    return {
      hits: response.hits.hits.map((h: any) => h._source),
      total: response.hits.total.value,
    };
  }

  async searchFundings(queryParams: URLSearchParams) {
    const limit = queryParams.get("limit");
    const offset = queryParams.get("offset");

    // Construct the body for the Elasticsearch query
    const query = {
      size: limit != null ? parseInt(limit) : 10,
      from: offset != null ? parseInt(offset) : 0,
    };

    // Execute the query using the centralized executeQuery method
    const response = await this.executeQuery("funding", query);

    // Check if response is null (indicating an error occurred) and handle accordingly
    if (response === null) {
      console.error("Failed to execute search for orgs");
      return { hits: [], total: 0 }; // Return an empty result set on error
    }

    // Format and return the results
    return {
      hits: response.hits.hits.map((h: any) => h._source),
      total: response.hits.total.value,
    };
  }

  async getInvestorsWithMultipleEntries() {
    const query = {
      size: 0,
      aggs: {
        investors: {
          terms: {
            field: "investor_names",
            min_doc_count: 2, // Only include terms that appear at least twice
            size: 100, // Adjust the size to fit your needs
          },
        },
      },
    };

    const cachedInvestors = this.cache.get("investor_names");

    if (cachedInvestors) {
      return cachedInvestors;
    }

    const result = await this.executeQuery("funding", query);
    if (result && result.aggregations) {
      const cleanedInvestors = result.aggregations.investors.buckets
        .map((bucket: any) => {
          let name = bucket.key;
          // Remove leading and trailing special characters and JSON artifacts
          name = name.replace(/^\{["']?|["']?\}$/g, ""); // Remove curly braces and optional quotes at the start/end
          return {
            name: name,
            count: bucket.doc_count,
          };
        })
        .filter((investor: any) => {
          return investor.name.length !== 0;
        });

      this.cache.set("investor_names", cleanedInvestors);

      return {
        investors: cleanedInvestors,
      };
    }
  }

  async searchOrganizations(queryParams: URLSearchParams) {
    const company_name = queryParams.get("company_name");
    const country_code = queryParams.get("country_code");
    const limit = queryParams.get("limit");
    const total = queryParams.get("total");
    const offset = queryParams.get("offset");
    const city = queryParams.get("city");

    const filters: Record<string, object>[] = [
      { range: { funding_rounds: { gte: 1 } } }, // At least 1 funding rounds
      {
        range: {
          funding_total_usd: {
            gte: total && parseInt(total) ? parseInt(total) : 1000000,
          },
        },
      },
    ];

    if (company_name) {
      filters.push({ match: { company_name } });
    }

    if (country_code) {
      filters.push({ match: { country_code } });
    }

    if (city) {
      filters.push({ match: { city } });
    }

    const query = {
      query: {
        bool: {
          must: filters,
        },
      },
      size: limit != null ? parseInt(limit) : 100,
      from: offset != null ? parseInt(offset) : 0,
    };

    const result = await this.executeQuery("org", query);
    if (result && result.hits) {
      return result.hits.hits.map((hit: any) => hit._source);
    } else {
      console.log("No results found");
      return [];
    }
  }

  async getFundingsByInvestor(queryParams: URLSearchParams) {
    const investorName = queryParams.get("investor_name");
    const limit = queryParams.get("limit");
    const offset = queryParams.get("offset");

    if (!investorName) {
      console.error("Investor name not available");
      return [];
    }

    const query = {
      query: {
        bool: {
          must: [
            {
              bool: {
                should: [
                  {
                    query_string: {
                      default_field: "investor_names",
                      query: `*${investorName}*`, // Searches for occurrences that include the investor's name in any form
                    },
                  },
                  {
                    query_string: {
                      default_field: "investor_names",
                      query: `"\\{\\"${investorName}\\"\\}"`, // Searches for the JSON-like encapsulated version
                    },
                  },
                ],
                minimum_should_match: 1, // At least one of the conditions in the 'should' array must be true
              },
            },
            {
              range: {
                raised_amount_usd: {
                  gt: 1000000, // Only include results where 'raised_amount_usd' is greater than 1,000,000
                },
              },
            },
          ],
          must_not: [
            {
              terms: {
                investment_type: ["seed", "pre_seed"], // Exclude these investment types
              },
            },
          ],
        },
      },
      size: limit !== null ? limit : 100,
      from: offset !== null ? offset : 0,
      _source: [
        "company_uuid",
        "company_name",
        "investment_type",
        "announced_on",
        "raised_amount_usd",
      ], // Array of fields to include in the returned documents.
    };

    const cachedFundings = this.cache.get(
      `IF-${investorName}-${limit}-${offset}`
    );

    if (cachedFundings) {
      return cachedFundings;
    }

    const result = await this.executeQuery("funding", query); // Assuming 'funding' is your index name
    if (result && result.hits && result.hits.hits.length > 0) {
      const fundings = result.hits.hits.map((hit: any) => hit._source);

      const total = fundings.reduce((sum: number, funding: any) => {
        const amount = Number(funding.raised_amount_usd);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

      const refinedFunding = fundings.map((funding: any) => ({
        ...funding,
        ratio: (funding.raised_amount_usd / total) * 100,
      }));

      this.cache.set(`IF-${investorName}-${limit}-${offset}`, refinedFunding);
      return refinedFunding;
    } else {
      console.log("No results found");
      return [];
    }
  }

  async getCompaniesByInvestor(queryParams: URLSearchParams) {
    const investorName = queryParams.get("investor_name");

    if (!investorName) {
      console.error("Investor name not available");
      return [];
    }

    // Fetch companies from the 'funding' index
    const companyNames = await this.fetchCompanyNamesByInvestor(investorName);
    if (companyNames.length === 0) {
      console.error("funding No results found");
      return [];
    }

    // Fetch organizations from the 'org' index
    return await this.fetchOrganizationsByCompanyNames(companyNames);
  }

  private async fetchCompanyNamesByInvestor(
    investorName: string
  ): Promise<string[]> {
    const query = {
      query: {
        bool: {
          must: [
            {
              bool: {
                should: [
                  {
                    query_string: {
                      default_field: "investor_names",
                      query: `*${investorName}*`, // Searches for occurrences that include the investor's name in any form
                    },
                  },
                  {
                    query_string: {
                      default_field: "investor_names",
                      query: `"\\{\\"${investorName}\\"\\}"`, // Searches for the JSON-like encapsulated version
                    },
                  },
                ],
                minimum_should_match: 1, // At least one of the conditions in the 'should' array must be true
              },
            },
          ],
        },
      },
      _source: ["company_name"],
    };

    const result = await this.executeQuery("funding", query);
    console.log("result", result);

    if (result && result.hits && result.hits.hits.length > 0) {
      return result.hits.hits.map((hit: any) => hit._source.company_name);
    }
    return [];
  }

  private async fetchOrganizationsByCompanyNames(
    companyNames: string[]
  ): Promise<any> {
    const query = {
      query: {
        bool: {
          should: companyNames.map((name: string) => ({
            match: { company_name: name },
          })),
          minimum_should_match: 1,
        },
      },
    };

    const result = await this.executeQuery("org", query);
    if (result && result.hits && result.hits.hits.length > 0) {
      const orgs = result.hits.hits.map((hit: any) => hit._source);
      return orgs;
    } else {
      console.error("Organization No results found");
      return [];
    }
  }
}

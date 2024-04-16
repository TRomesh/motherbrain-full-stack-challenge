import NodeCache from "node-cache";
import { InvestmentService } from "../service/InvestmentService";
import { Client } from "@elastic/elasticsearch";

// Mock the entire NodeCache module
jest.mock("node-cache", () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    flushAll: jest.fn(),
  }));
});

// Mock the entire elasticSearch module
jest.mock("@elastic/elasticsearch", () => ({
  Client: jest.fn().mockImplementation(() => ({
    search: jest.fn(),
  })),
}));

describe("InvestmentService", () => {
  let service: InvestmentService;
  let mockCache: NodeCache;
  let mockEsClient: Client;

  beforeEach(() => {
    // Reset all mocks
    jest.resetAllMocks();
    mockCache = new (NodeCache as any)();
    mockEsClient = new (Client as any)();
    service = new InvestmentService(mockCache, mockEsClient);
  });

  describe("executeQuery", () => {
    it("should handle successful Elasticsearch queries", async () => {
      const mockResponse = {
        hits: {
          hits: [{ _source: { id: 1, name: "Test" } }],
          total: { value: 1 },
        },
      };
      mockEsClient.search = jest.fn().mockResolvedValue({
        body: mockResponse,
      });

      const result = await service.executeQuery("test-index", {
        test: "query",
      });

      expect(result).toEqual(mockResponse);
      expect(mockEsClient.search).toHaveBeenCalledWith({
        index: "test-index",
        body: { test: "query" },
      });
    });

    it("should handle Elasticsearch query errors", async () => {
      mockEsClient.search = jest
        .fn()
        .mockRejectedValue(new Error("Elasticsearch error"));
      const result = await service.executeQuery("test-index", {
        test: "query",
      });
      expect(result).toBeNull();
    });
  });

  describe("searchOrgs", () => {
    it("should return formatted search results", async () => {
      const queryParams = new URLSearchParams();
      queryParams.set("limit", "5");
      queryParams.set("offset", "0");
      const mockResponse = {
        hits: {
          hits: [{ _source: { id: 1, name: "Org1" } }],
          total: { value: 1 },
        },
      };
      service.executeQuery = jest.fn().mockResolvedValue(mockResponse);

      const result = await service.searchOrgs(queryParams);

      expect(service.executeQuery).toHaveBeenCalledWith("org", {
        size: 5,
        from: 0,
      });
      expect(result).toEqual({
        hits: [{ id: 1, name: "Org1" }],
        total: 1,
      });
    });
  });

  describe("searchFundings", () => {
    it("should return formatted search results for fundings", async () => {
      const queryParams = new URLSearchParams();
      queryParams.set("limit", "10");
      queryParams.set("offset", "2");
      const mockResponse = {
        hits: {
          hits: [{ _source: { id: 2, name: "Fund1" } }],
          total: { value: 1 },
        },
      };
      service.executeQuery = jest.fn().mockResolvedValue(mockResponse);

      const result = await service.searchFundings(queryParams);

      expect(service.executeQuery).toHaveBeenCalledWith("funding", {
        size: 10,
        from: 2,
      });
      expect(result).toEqual({
        hits: [{ id: 2, name: "Fund1" }],
        total: 1,
      });
    });
  });

  describe("getInvestorsWithMultipleEntries", () => {
    it("should return cached data if available", async () => {
      mockCache.get = jest
        .fn()
        .mockReturnValue([{ name: "InvestorX", count: 3 }]);
      const result = await service.getInvestorsWithMultipleEntries();
      expect(mockCache.get).toHaveBeenCalledWith("investor_names");
      expect(result).toEqual([{ name: "InvestorX", count: 3 }]);
    });

    it("should query and cache new data if not available in cache", async () => {
      mockCache.get = jest.fn().mockReturnValue(null);
      mockCache.set = jest
        .fn()
        .mockImplementation((key: string, value: any) => {});
      const mockResponse = {
        aggregations: {
          investors: {
            buckets: [{ key: "InvestorY", doc_count: 2 }],
          },
        },
      };
      service.executeQuery = jest.fn().mockResolvedValue(mockResponse);

      const result = await service.getInvestorsWithMultipleEntries();

      expect(service.executeQuery).toHaveBeenCalledWith("funding", {
        size: 0,
        aggs: {
          investors: {
            terms: {
              field: "investor_names",
              min_doc_count: 2,
              size: 100,
            },
          },
        },
      });
      expect(mockCache.set).toHaveBeenCalledWith("investor_names", [
        { name: "InvestorY", count: 2 },
      ]);
      expect(result).toEqual({ investors: [{ name: "InvestorY", count: 2 }] });
    });
  });

  describe("searchOrganizations", () => {
    it("should filter and return organizations based on query parameters", async () => {
      const queryParams = new URLSearchParams();
      queryParams.set("company_name", "TechCorp");
      queryParams.set("country_code", "US");
      queryParams.set("city", "San Francisco");
      queryParams.set("total", "5000000");
      queryParams.set("limit", "10");
      queryParams.set("offset", "0");

      const mockResponse = {
        hits: {
          hits: [
            {
              _source: {
                company_name: "TechCorp",
                country_code: "US",
                city: "San Francisco",
              },
            },
          ],
        },
      };
      service.executeQuery = jest.fn().mockResolvedValue(mockResponse);

      const result = await service.searchOrganizations(queryParams);

      expect(service.executeQuery).toHaveBeenCalledWith("org", {
        query: {
          bool: {
            must: [
              { range: { funding_rounds: { gte: 1 } } },
              { range: { funding_total_usd: { gte: 5000000 } } },
              { match: { company_name: "TechCorp" } },
              { match: { country_code: "US" } },
              { match: { city: "San Francisco" } },
            ],
          },
        },
        size: 10,
        from: 0,
      });
      expect(result).toEqual([
        {
          company_name: "TechCorp",
          country_code: "US",
          city: "San Francisco",
        },
      ]);
    });

    it("should use default values for missing total, limit, and offset", async () => {
      const queryParams = new URLSearchParams(); // Empty parameters to test defaults
      const mockResponse = {
        hits: {
          hits: [],
        },
      };
      service.executeQuery = jest.fn().mockResolvedValue(mockResponse);

      const result = await service.searchOrganizations(queryParams);

      expect(service.executeQuery).toHaveBeenCalledWith("org", {
        query: {
          bool: {
            must: [
              { range: { funding_rounds: { gte: 1 } } },
              { range: { funding_total_usd: { gte: 1000000 } } }, // Default value
            ],
          },
        },
        size: 100, // Default size
        from: 0, // Default offset
      });
      expect(result).toEqual([]);
    });
  });

  describe("getCompaniesByInvestor", () => {
    it("should return organization details based on investor name", async () => {
      const queryParams = new URLSearchParams();
      queryParams.set("investor_name", "InvestorX");

      const mockFundingResponse = {
        hits: {
          hits: [{ _source: { company_name: "StartupY" } }],
        },
      };
      const mockOrgResponse = {
        hits: {
          hits: [
            {
              _source: {
                company_name: "StartupY",
                industry: "Technology",
                headquarters: "New York",
              },
            },
          ],
        },
      };

      service.executeQuery = jest
        .fn()
        .mockResolvedValueOnce(mockFundingResponse) // First call returns funding info
        .mockResolvedValueOnce(mockOrgResponse); // Second call returns org details

      const result = await service.getCompaniesByInvestor(queryParams);

      // First query checks for funding based on investor name
      expect(service.executeQuery).toHaveBeenNthCalledWith(1, "funding", {
        query: {
          bool: {
            must: [
              {
                bool: {
                  should: [
                    {
                      query_string: {
                        default_field: "investor_names",
                        query: "*InvestorX*",
                      },
                    },
                    {
                      query_string: {
                        default_field: "investor_names",
                        query: '"\\{\\"InvestorX\\"\\}"',
                      },
                    },
                  ],
                  minimum_should_match: 1,
                },
              },
            ],
          },
        },
        _source: ["company_name"], // Ensure `_source` is correctly placed outside the `query` object.
      });

      // Second query retrieves organizations by company name
      expect(service.executeQuery).toHaveBeenNthCalledWith(2, "org", {
        query: {
          bool: {
            should: [{ match: { company_name: "StartupY" } }],
            minimum_should_match: 1,
          },
        },
      });

      expect(result).toEqual([
        {
          company_name: "StartupY",
          industry: "Technology",
          headquarters: "New York",
        },
      ]);
    });
  });
});

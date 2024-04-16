import { useState, useCallback } from "react";
import axios, { AxiosError } from "axios";

const BASE_URL = "http://localhost:8080";

/**
 * useFetch hook for fetching data with Axios. It supports lazy fetching.
 * @param url The URL to fetch data from.
 * @param options Optional Axios request configuration.
 * @returns The state and a function to manually fetch data.
 */
function useLazyFetch<T = unknown>(
  url: string
): {
  data: T[] | null;
  error: AxiosError | null;
  loading: boolean;
  fetchData: (params: object) => Promise<void>;
} {
  const [data, setData] = useState<T[] | null>(null);
  const [error, setError] = useState<AxiosError | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(
    async (params: object) => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get<{ results: T[]; message: string }>(
          `${BASE_URL}/${url}`,
          { params }
        );

        setData(data.results);
      } catch (err) {
        setError(err as AxiosError);
      } finally {
        setLoading(false);
      }
    },
    [url]
  );

  return { data, error, loading, fetchData };
}

export default useLazyFetch;

import { useState, useCallback, useEffect } from "react";
import axios, { AxiosRequestConfig, AxiosError } from "axios";

const BASE_URL = "http://localhost:8080";

/**
 * useFetch hook for fetching data with Axios. It supports lazy fetching.
 * @param url The URL to fetch data from.
 * @param options Optional Axios request configuration.
 * @returns The state and a function to manually fetch data.
 */
function useFetch<T = unknown>(
  url: string,
  options?: AxiosRequestConfig
): {
  data: T[] | null;
  error: AxiosError | null;
  loading: boolean;
  fetchData: (name: string) => Promise<void>;
} {
  const [data, setData] = useState<T[] | null>(null);
  const [error, setError] = useState<AxiosError | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData(); // Fetch data on component mount
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get<{ results: T[]; message: string }>(
        `${BASE_URL}/${url}`,
        options
      );
      setData(data.results);
    } catch (err) {
      setError(err as AxiosError);
    } finally {
      setLoading(false);
    }
  }, [options]); // Only recreate fetchData if url or options change

  return { data, error, loading, fetchData };
}

export default useFetch;

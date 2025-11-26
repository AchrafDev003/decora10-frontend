// src/hooks/useDirectus.js
import { useState, useEffect } from "react";

export function useDirectus(endpoint, options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const API_TOKEN = import.meta.env.VITE_API_TOKEN;

  useEffect(() => {
    if (!endpoint) return;

    setLoading(true);
    fetch(`${API_URL}/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
      ...options,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setData(json.data || []);
        setError(null);
      })
      .catch((err) => {
        console.error("Error Directus:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [endpoint]);

  return { data, loading, error };
}

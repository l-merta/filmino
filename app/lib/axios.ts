import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    Authorization: `Bearer ${process.env.TMDB_API_READ_KEY}`,
  },
  params: {
    language: "cs-CZ",
  },
});

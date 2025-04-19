import axios from 'axios';

type ApiError = {
  message: string;
};

const isApiError = (data?: unknown): data is ApiError => {
  return data !== null && typeof data === 'object' && 'message' in data;
};

const handleError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    if (error.response && isApiError(error.response.data)) {
      return error.response.data.message;
    }

    return error.message;
  }

  return 'An unknown error occurred';
};

// export const useQuery = (): URLSearchParams => {
//   return new URLSearchParams(useLocation().search);
// };

export default handleError;

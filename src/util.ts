import {useLocation} from "react-router-dom";

const handleError = (err: { response: { status: number; data: { message: any; }; }; message: string | string[]; }) => {
    if (err.response.status === 401) {
        return "Invalid authorization token passed."
    } else if (err.response.status === 500) {
        if (err.response?.data && err.response?.data?.message) {
            return err.response.data.message;
        } else {
            return "An internal error occurred."
        }
    } else if (err.message === "Network Error") {
        return "Server appears to be offline. Please refresh in a few minutes.";
    } else if (err.response?.data?.message) {
        return err.response.data.message;
    } else {
        return err.message;
    }
}

export const useQuery = () => {
    return new URLSearchParams(useLocation().search);
}

export default handleError;

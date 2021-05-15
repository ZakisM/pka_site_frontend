import { CircularProgress } from "@material-ui/core";
import React, { ReactElement } from "react";

const LoadingSpinner = (): ReactElement => {
    return <CircularProgress style={{ color: "#a3252e" }} size={23} thickness={5} />;
};

export default LoadingSpinner;

import {CircularProgress} from "@material-ui/core";
import React from "react";

const LoadingSpinner: React.FC = () => {
    return (
        <CircularProgress style={{color: '#a3252e'}}
                          size={23}
                          thickness={5}/>
    )
}

export default LoadingSpinner;
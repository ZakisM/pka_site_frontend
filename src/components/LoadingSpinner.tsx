import {CircularProgress} from '@material-ui/core';
import React, {type ReactElement} from 'react';
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles(() => ({
    progress: {
        color: '#a3252e',
    },
}));

const LoadingSpinner = (): ReactElement => {
    const classes = useStyles();

    return (
        <CircularProgress
            className={classes.progress}
            size={23}
            thickness={5}
        />
    );
};

export default LoadingSpinner;

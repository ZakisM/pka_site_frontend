import React from "react";
import {fade, makeStyles} from '@material-ui/core/styles';
import {Avatar, Card, Typography} from "@material-ui/core";

interface Props {
    episodeNumber: number,
    title: string,
    subtitle: string,
}

const useStyles = makeStyles((theme) => ({
    avatar: {
        backgroundColor: '#a3252e',
        color: 'white',
        width: '5ch',
        marginRight: '2ch',
    },
    resultCard: {
        backgroundColor: '#151515',
        color: theme.palette.common.white,
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.05),
            cursor: 'pointer',
        },
        '&:active': {
            backgroundColor: fade(theme.palette.common.white, 0.075),
            cursor: 'pointer',
        },
        boxShadow: 'none',
    },
    cardHeader: {
        padding: '2ch',
        display: 'flex',
        alignItems: 'center',
    },
    cardDetails: {
        display: 'flex',
        flexFlow: 'column'
    },
    episodeNumber: {
        fontSize: '17px'
    },
    title: {
        fontSize: '15px',
        color: fade(theme.palette.common.white, 0.9),
    },
    subtitle: {
        fontSize: '12px',
        color: fade(theme.palette.common.white, 0.5),
    },
}));

const SearchResultCard: React.FC<Props> = (props) => {
    const classes = useStyles();
    const {episodeNumber, title, subtitle} = props;

    return (
        <Card className={classes.resultCard}
              square
        >
            <div className={classes.cardHeader}>
                <Avatar variant="rounded"
                        className={classes.avatar}
                >
                    <Typography className={classes.episodeNumber}
                                variant="button">{episodeNumber}</Typography>
                </Avatar>
                <div className={classes.cardDetails}>
                    <Typography className={classes.title}
                                variant="button">{title}</Typography>
                    <Typography className={classes.subtitle}
                                variant="button">{subtitle}</Typography>
                </div>
            </div>
        </Card>
    )
};

export default SearchResultCard;

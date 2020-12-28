import React from "react";
import {fade, makeStyles} from '@material-ui/core/styles';
import {Card} from "@material-ui/core";

interface Props {
    customClassName?: string,
    episodeNumber: number,
    title: string,
    subtitle: string,
    duration: string,
    extraInfo?: string,
}

const useStyles = makeStyles((theme) => ({
    resultCard: {
        display: 'flex',
        padding: theme.spacing(2),
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
    avatar: {
        backgroundColor: '#a3252e',
        color: 'white',
        width: '5ch',
        marginRight: theme.spacing(2),
    },
    cardDetails: {
        display: 'flex',
        flexFlow: 'column',
        alignItems: 'flex-start',
    },
    episodeNumber: {
        fontSize: '17px'
    },
    title: {
        fontSize: '15px',
        fontWeight: 500,
        color: fade(theme.palette.common.white, 0.9),
        marginBottom: theme.spacing(0.5)
    },
    subtitle: {
        fontSize: '13px',
        color: fade(theme.palette.common.white, 0.5),
    },
    infoCard: {
        fontWeight: 600,
        fontSize: '14px',
        paddingTop: theme.spacing(0.5),
        paddingBottom: theme.spacing(0.5),
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        borderRadius: '3px',
        color: theme.palette.common.white,
        backgroundColor: '#ab1029',
        marginRight: theme.spacing(1),
    },
    cardInfo: {
        flex: 1,
        marginBottom: theme.spacing(1.25)
    },
    metaData: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }
}));

const SearchResultCard: React.FC<Props> = (props) => {
    const classes = useStyles();
    const {customClassName, episodeNumber, title, subtitle, duration, extraInfo} = props;

    return (
        <Card className={`${classes.resultCard} ${customClassName}`}
        >
            <div className={classes.cardDetails}>
                <div className={classes.cardInfo}>
                    <div className={classes.title}>{title}</div>
                    <div className={classes.subtitle}>{subtitle}</div>
                </div>
                <div className={classes.metaData}>
                    <div className={classes.infoCard}>PKA {episodeNumber}</div>
                    <div className={classes.infoCard}>{duration}</div>
                    {extraInfo &&
                    <div className={classes.infoCard}>{extraInfo}</div>
                    }
                </div>
            </div>
        </Card>
    )
};

export default SearchResultCard;

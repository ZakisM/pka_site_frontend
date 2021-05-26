import React, { ReactElement } from "react";
import { fade, makeStyles } from "@material-ui/core/styles";
import { Card } from "@material-ui/core";
import { PlayCircleOutlineRounded, YouTube } from "@material-ui/icons";

interface SearchResultCardProps {
    customClassName?: string;
    episodeNumber: number;
    title: string;
    subtitle: string;
    duration: string;
    onWatchClick: () => void;
    onYoutubeClick: () => Promise<void>;
    extraInfo?: string;
}

const useStyles = makeStyles((theme) => ({
    resultCard: {
        display: "flex",
        padding: theme.spacing(2),
        backgroundColor: "#151515",
        color: theme.palette.common.white,
        boxShadow: "none",
    },
    avatar: {
        backgroundColor: "#a3252e",
        color: "white",
        width: "5ch",
        marginRight: theme.spacing(2),
    },
    cardDetails: {
        display: "flex",
        flexFlow: "column",
        alignItems: "flex-start",
    },
    episodeNumber: {
        fontSize: "17px",
    },
    title: {
        fontSize: "15px",
        fontWeight: 500,
        color: fade(theme.palette.common.white, 0.9),
        marginBottom: theme.spacing(0.5),
    },
    subtitle: {
        fontSize: "13px",
        color: fade(theme.palette.common.white, 0.5),
    },
    infoCard: {
        fontWeight: 600,
        fontSize: "14px",
        paddingTop: theme.spacing(0.5),
        paddingBottom: theme.spacing(0.5),
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        borderRadius: "3px",
        color: "#787878",
        backgroundColor: "inherit",
        marginRight: theme.spacing(1),
    },
    actionCard: {
        display: "flex",
        alignItems: "center",
        fontWeight: 600,
        fontSize: "14px",
        paddingTop: theme.spacing(0.75),
        paddingBottom: theme.spacing(0.75),
        paddingLeft: theme.spacing(1.25),
        paddingRight: theme.spacing(1.25),
        borderRadius: "3px",
        color: theme.palette.common.white,
        backgroundColor: "#ab1029",
        marginRight: theme.spacing(1),
        "&:hover": {
            backgroundColor: fade("#ab1029", 0.75),
            color: fade(theme.palette.common.white, 0.75),
            cursor: "pointer",
        },
        "&:active": {
            backgroundColor: fade("#ab1029", 0.5),
            color: fade(theme.palette.common.white, 0.5),
            cursor: "pointer",
        },
    },
    actionCardIcon: {
        display: "flex",
        marginRight: theme.spacing(0.5),
    },
    cardInfo: {
        flex: 1,
    },
    metaData: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginTop: theme.spacing(1.25),
    },
}));

const SearchResultCard = (props: SearchResultCardProps): ReactElement => {
    const classes = useStyles();
    const { customClassName, episodeNumber, title, subtitle, duration, onWatchClick, onYoutubeClick, extraInfo } =
        props;

    return (
        <Card variant="outlined" className={`${classes.resultCard} ${customClassName}`}>
            <div className={classes.cardDetails}>
                <div className={classes.cardInfo}>
                    <div className={classes.title}>{title}</div>
                    <div className={classes.subtitle}>{subtitle}</div>
                </div>
                <div className={classes.metaData}>
                    <Card variant="outlined" className={classes.infoCard}>
                        PKA {+episodeNumber.toFixed(1)}
                    </Card>
                    {extraInfo && (
                        <Card variant="outlined" className={classes.infoCard}>
                            {extraInfo}
                        </Card>
                    )}
                    <Card variant="outlined" className={classes.infoCard}>
                        {duration}
                    </Card>
                </div>
                <div className={classes.metaData}>
                    <div className={classes.actionCard} onClick={onWatchClick}>
                        <span className={classes.actionCardIcon}>
                            <PlayCircleOutlineRounded fontSize="small" />
                        </span>
                        Watch
                    </div>
                    <Card className={classes.actionCard} onClick={onYoutubeClick}>
                        <span className={classes.actionCardIcon}>
                            <YouTube fontSize="small" />
                        </span>
                        YouTube
                    </Card>
                </div>
            </div>
        </Card>
    );
};

export default SearchResultCard;

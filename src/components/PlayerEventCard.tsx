import React, {useEffect, useRef, useState} from "react";
import {fade, makeStyles} from '@material-ui/core/styles';
import {Card, Typography} from "@material-ui/core";
import {RootState} from "../redux";
import {connect} from "react-redux";
import moment from "moment";

interface Props {
    id: number,
    title: string,
    timestamp: number,
}

const mapStateToProps = (state: RootState) => ({
    watchEpisodeState: state.watchEpisode,
});

type PlayerEventCardProps = ReturnType<typeof mapStateToProps> & Props;

const useStyles = makeStyles(theme => ({
    resultCard: {
        padding: '2ch',
        backgroundColor: fade('#7a1d23', 0.15),
        color: fade(theme.palette.common.white, 0.6),
        '&:hover': {
            backgroundColor: fade('#7a1d23', 0.5),
            color: theme.palette.common.white,
            cursor: 'pointer',
        },
        '&:active': {
            backgroundColor: fade('#7a1d23', 0.2),
            color: fade(theme.palette.common.white, 0.6),
            cursor: 'pointer',
        },
    },
    active: {
        backgroundColor: fade('#7a1d23', 0.5),
        color: theme.palette.common.white,
    },
    title: {
        fontSize: '0.9rem',
        marginBottom: '0.75ch',
    },
    subtitle: {
        fontSize: '0.875rem',
        color: fade(theme.palette.common.white, 0.6),
    },
}));

const PlayerEventCard: React.FC<PlayerEventCardProps> = (props) => {
    const classes = useStyles();
    const {id, title, timestamp, watchEpisodeState} = props;

    const cardRef = useRef<any>(null);

    const [isActive, setActive] = useState(false);

    useEffect(() => {
        const cRef = cardRef.current;

        if (watchEpisodeState.events !== undefined) {
            if (watchEpisodeState.currentEventCard === id) {
                setActive(true);
            } else {
                setActive(false);
            }
        } else {
            setActive(false);
        }

        if (cRef && isActive) {
            cRef.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }
    }, [watchEpisodeState.events, watchEpisodeState.currentEventCard, id, isActive]);

    return (
        <Card ref={cardRef}
              className={`${classes.resultCard} ${isActive ? classes.active : null}`}
        >
            <Typography className={classes.title}>{title}</Typography>
            <Typography className={classes.subtitle}>{moment.utc(Number(timestamp) * 1000).format("HH:mm:ss")}</Typography>
        </Card>
    )
};

export default connect(
    mapStateToProps,
)(PlayerEventCard)

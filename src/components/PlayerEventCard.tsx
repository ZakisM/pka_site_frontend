import React, {RefObject, useEffect, useRef, useState} from "react";
import {createStyles, fade, makeStyles, Theme, withStyles} from '@material-ui/core/styles';
import {Card, LinearProgress, Typography} from "@material-ui/core";
import {RootState} from "../redux";
import {connect} from "react-redux";
import moment from "moment";
import {scrollIntoView} from "scroll-js";
import {useAsync} from "react-async-hook";

interface Props {
    parentRef: RefObject<any>,
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
        backgroundColor: '#151515',
        color: fade(theme.palette.common.white, 0.3),
        '&:hover': {
            backgroundColor: '#6c181e',
            color: theme.palette.common.white,
            cursor: 'pointer',
        },
        '&:active': {
            backgroundColor: fade('#cd2d37', 0.4),
            cursor: 'pointer',
        },
        boxShadow: 'none',
    },
    active: {
        backgroundColor: '#6c181e',
        color: theme.palette.common.white,
    },
    title: {
        fontSize: '14.5px',
        marginBottom: '0.75ch',
    },
    subtitle: {
        fontSize: '13px',
    },
}));

const CurrentEventProgressBar = withStyles((theme: Theme) =>
    createStyles({
        root: {
            marginTop: theme.spacing(1.75),
            height: 5,
        },
        colorPrimary: {
            backgroundColor: '#111010',
        },
        bar: {
            backgroundColor: '#c7c7c7',
        },
    }),
)(LinearProgress);


const PlayerEventCard: React.FC<PlayerEventCardProps> = (props) => {
    const classes = useStyles();
    const {parentRef, id, title, timestamp, watchEpisodeState} = props;

    const cardRef = useRef<HTMLUListElement>(null);

    const [isActive, setActive] = useState(false);

    const [progress, setProgress] = useState(25);

    useAsync(async () => {
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
            await scrollIntoView(cRef, parentRef.current!, {behavior: 'smooth', block: 'center'});
        }
    }, [watchEpisodeState.events, watchEpisodeState.currentEventCard, id, isActive]);

    useEffect(() => {
        if (isActive && watchEpisodeState.events && watchEpisodeState.episode) {
            const currentEvent = watchEpisodeState.events[id];

            if (currentEvent) {
                setProgress(((watchEpisodeState.timestamp - currentEvent.timestamp) / currentEvent.lengthSeconds) * 100);
            }
        }
    }, [id, isActive, watchEpisodeState.episode, watchEpisodeState.events, watchEpisodeState.timestamp])

    return (
        <Card ref={cardRef}
              className={`${classes.resultCard} ${isActive ? classes.active : null}`}
        >
            <Typography className={classes.title}>{title}</Typography>
            <Typography className={classes.subtitle}>{moment.utc(Number(timestamp) * 1000).format("HH:mm:ss")}</Typography>

            {isActive ?
                <CurrentEventProgressBar variant="determinate"
                                         value={progress}/> : null
            }
        </Card>
    )
};

export default connect(
    mapStateToProps,
)(PlayerEventCard)

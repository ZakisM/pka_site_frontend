import React, {useEffect, useRef, useState} from "react";
import {connect} from "react-redux";
import {RootState} from "../redux";
import ReactPlayer from "react-player";
import {CircularProgress, List, Typography} from "@material-ui/core";
import {ThunkDispatch} from "redux-thunk";
import {saveTimestamp, setCurrentEventCard, watchPKAEpisode} from "../redux/watch-episode/actions";
import {WatchEpisodeRootActionTypes} from "../redux/watch-episode/types";
import {makeStyles} from "@material-ui/core/styles";
import PlayerEventCard from "./PlayerEventCard";

const YOUTUBE_BASE_URL = 'https://www.youtube.com/watch?v=';

const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, WatchEpisodeRootActionTypes>) => {
    return {
        watchPKAEpisode: (number: number | "latest", timestamp: number) => dispatch(watchPKAEpisode(number, timestamp)),
        saveTimestamp: (timestamp: number) => dispatch(saveTimestamp(timestamp)),
        setCurrentEventCard: (id: number) => dispatch(setCurrentEventCard(id)),
    }
};

const mapStateToProps = (state: RootState) => ({
    watchEpisodeState: state.watchEpisode,
});

type PlayerComponentProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const useStyles = makeStyles(() => ({
    root: {
        height: '80vh'
    },
    content: {
        display: 'flex'
    },
    list: {
        marginLeft: '2ch',
        width: '25%',
        maxHeight: '80vh',
        overflow: 'auto',
    },
    listItem: {
        marginBottom: '1ch',
    }
}));

const PlayerComponent: React.FC<PlayerComponentProps> = (props) => {
    const classes = useStyles();

    const {setCurrentEventCard, saveTimestamp, watchPKAEpisode, watchEpisodeState} = props;

    const playerRef = useRef<ReactPlayer>(null);

    const [isInitial, setInitial] = useState(false);

    useEffect(() => {
        if (!watchEpisodeState.isLoading) {
            if (watchEpisodeState.episode === undefined) {
                watchPKAEpisode("latest", 0);
                setInitial(true);
            } else {
                watchEpisodeState.events!.forEach((event, index) => {
                    if (watchEpisodeState.timestamp >= event.timestamp) {
                        setCurrentEventCard(index);
                        return;
                    }
                });
            }
        }
    }, [setCurrentEventCard, watchEpisodeState.episode, watchEpisodeState.events, watchEpisodeState.isLoading, watchEpisodeState.timestamp, watchPKAEpisode]);

    const loadTimestamp = (timestamp?: number) => {
        if (timestamp === 0) {
            timestamp = 1
        }

        const pRef = playerRef.current;

        if (pRef && !isInitial) {
            pRef.seekTo(timestamp ? timestamp : watchEpisodeState.timestamp, "seconds");
        }
    };

    const synchronizeTimestamp = () => {
        const pRef = playerRef.current;

        if (pRef) {
            saveTimestamp(pRef.getCurrentTime());
        }
    };

    const getUrl = (): string => {
        const videoId = watchEpisodeState.youtubeDetails?.videoId;
        return `${YOUTUBE_BASE_URL}${videoId}&origin=${window.location.origin}&enablejsapi=1`;
    };

    const handleInitial = () => {
        if (isInitial) {
            setInitial(false);
        }
    };

    if (watchEpisodeState.episode !== undefined && !watchEpisodeState.isLoading) {
        return (
            <div className={classes.root}>
                <Typography variant="h5"
                            style={{"marginBottom": '10px'}}>{watchEpisodeState.youtubeDetails?.title}</Typography>
                <div className={classes.content}>
                    <ReactPlayer ref={playerRef}
                                 config={{
                                     youtube: {
                                         preload: true,
                                     }
                                 }}
                                 url={getUrl()}
                                 width={'75%'}
                                 height={'80vh'}
                                 controls={true}
                                 playing={true}
                                 onError={(e) => console.log(e)}
                                 onProgress={() => synchronizeTimestamp()}
                                 onPlay={() => handleInitial()}
                                 onReady={() => loadTimestamp()}/>

                    <List className={classes.list}>
                        {(watchEpisodeState.events!).map((event, i) => (
                            <div className={classes.listItem}
                                 key={i}
                                 onClick={() => loadTimestamp(event.timestamp)}
                            >
                                <PlayerEventCard
                                    id={i}
                                    title={event.description}
                                    timestamp={event.timestamp}
                                />
                            </div>
                        ))}
                    </List>
                </div>
            </div>
        )
    } else {
        return (
            <div>
                <CircularProgress color="primary"
                                  size={50}
                                  thickness={5}/>
            </div>
        )
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(PlayerComponent)
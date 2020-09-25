import React, {useEffect, useRef, useState} from "react";
import {connect} from "react-redux";
import {RootState} from "../redux";
import ReactPlayer from "react-player";
import {Box, Card, CardContent, CardHeader, fade, List, Typography} from "@material-ui/core";
import {ThunkDispatch} from "redux-thunk";
import {saveTimestamp, setCurrentEventCard, watchPKAEpisode} from "../redux/watch-episode/actions";
import {WatchEpisodeRootActionTypes} from "../redux/watch-episode/types";
import {makeStyles} from "@material-ui/core/styles";
import moment from "moment";
import PlayerEventCard from "./PlayerEventCard";
import Skeleton from '@material-ui/lab/Skeleton';
import {Alert} from "@material-ui/lab";
import {useHistory, useParams} from "react-router-dom";
import {useQuery} from "../util";

export const YOUTUBE_BASE_URL = 'https://www.youtube.com/watch?v=';

const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, WatchEpisodeRootActionTypes>) => {
    return {
        watchPKAEpisode: (number: number | "latest" | "random", timestamp: number) => dispatch(watchPKAEpisode(number, timestamp)),
        saveTimestamp: (timestamp: number) => dispatch(saveTimestamp(timestamp)),
        setCurrentEventCard: (id: number) => dispatch(setCurrentEventCard(id)),
    }
};

const mapStateToProps = (state: RootState) => ({
    watchEpisodeState: state.watchEpisode,
});

type PlayerComponentProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const useStyles = makeStyles((theme) => ({
    videoCard: {
        height: '100%',
        backgroundColor: '#151515',
        marginRight: '2ch',
        display: 'flex',
        flexFlow: 'column',
        width: '75%',
        boxShadow: 'none'
    },
    videoHeader: {
        padding: '2ch',
        display: 'flex',
        flexFlow: 'column'
    },
    videoTitle: {
        fontSize: '20px',
        fontWeight: 500,
        color: fade(theme.palette.common.white, 0.9),
    },
    videoSubtitle: {
        fontSize: '15px',
        color: fade(theme.palette.common.white, 0.5),
    },
    fullHeight: {
        height: '100%',
    },
    fullWidth: {
        width: '100%',
    },
    halfHeight: {
        marginTop: '2ch',
        height: '80%',
        width: '100%',
    },
    flexColumn: {
        flexFlow: 'column'
    },
    eventsCard: {
        backgroundColor: '#151515',
        display: 'flex',
        flexFlow: 'column',
        boxShadow: 'none'
    },
    eventsHeader: {
        textAlign: 'center',
        padding: '2ch',
        backgroundColor: '#151515',
    },
    eventsHeaderText: {
        fontSize: '15px',
        color: fade(theme.palette.common.white, 0.8),
    },
    eventsWidth: {
        width: '25%',
    },
    listItem: {
        marginBottom: '1ch',
    },
    rootLoading: {
        height: '100%',
    },
    errorMessage: {
        height: '10%',
    },
    errorBodyHeight: {
        height: '90%',
    }
}));

const PlayerComponent: React.FC<PlayerComponentProps> = (props) => {
    const history = useHistory();
    const classes = useStyles();

    const {setCurrentEventCard, saveTimestamp, watchPKAEpisode, watchEpisodeState} = props;

    const playerRef = useRef<ReactPlayer>(null);
    const eventsCardRef = useRef<any>(null);

    const [isBuffering, setIsBuffering] = useState(false);
    const [isPortrait, setIsPortrait] = useState(false);

    let {episodeNumber} = useParams<any>();

    let query = useQuery();
    let timestampQuery = query.get("timestamp");

    useEffect(() => {
        if (watchEpisodeState.episode === undefined) {
            if (episodeNumber) {
                if (episodeNumber !== 'random') {
                    watchPKAEpisode(episodeNumber, timestampQuery ? parseInt(timestampQuery) : 0);
                } else {
                    watchPKAEpisode("random", 0);
                }
            } else {
                watchPKAEpisode("latest", 0);
            }
        } else {
            if (episodeNumber && episodeNumber !== 'random' && episodeNumber !== 'latest' && watchEpisodeState.episode?.number.toString() !== episodeNumber) {
                watchPKAEpisode(episodeNumber, timestampQuery ? parseInt(timestampQuery) : 0);
            } else {
                history.replace(`/watch/${watchEpisodeState.episode.number}`);
            }
        }
    }, [episodeNumber, history, timestampQuery, watchEpisodeState.episode, watchPKAEpisode])

    useEffect(() => {
        if (!watchEpisodeState.isLoading) {
            if (watchEpisodeState.events) {
                if (watchEpisodeState.timestamp !== 0) {
                    watchEpisodeState.events.forEach((event, index) => {
                        if (watchEpisodeState.timestamp >= event.timestamp) {
                            setCurrentEventCard(index);
                            return;
                        }
                    });
                } else {
                    setCurrentEventCard(0);
                }
            }
        }
    }, [setCurrentEventCard, watchEpisodeState.episode, watchEpisodeState.events, watchEpisodeState.isLoading, watchEpisodeState.timestamp, watchPKAEpisode]);

    useEffect(() => {
        const checkIfPortrait = () => {
            setIsPortrait(window.outerHeight >= window.outerWidth);
        };

        checkIfPortrait();
        window.addEventListener('resize', checkIfPortrait);

        return function cleanup() {
            window.removeEventListener('resize', checkIfPortrait);
        }
    }, []);

    const loadTimestamp = (timestamp?: number) => {
        // For some reason if timestamp is 0, watching the timestamp doesn't seem to work.
        if (timestamp === 0) {
            timestamp = 1
        }

        const pRef = playerRef.current;

        if (pRef) {
            pRef.seekTo(timestamp ? timestamp : watchEpisodeState.timestamp, "seconds");
        }
    };

    const synchronizeTimestamp = () => {
        const pRef = playerRef.current;

        if (pRef && !isBuffering) {
            setTimeout(() => {
                let currentTimeStamp = pRef.getCurrentTime();
                if (currentTimeStamp != null) {
                    saveTimestamp(currentTimeStamp);
                }
            }, 1000);
        }
    };

    const getUrl = (): string => {
        const videoId = watchEpisodeState.youtubeDetails?.videoId;
        return `${YOUTUBE_BASE_URL}${videoId}&origin=${window.location.origin}&enablejsapi=1`;
    };

    const hasEvents = () => {
        return watchEpisodeState.events && watchEpisodeState.events.length > 0;
    };

    const videoIsFullWidth = () => {
        if (isPortrait) {
            return true;
        } else if (watchEpisodeState.events === undefined) {
            return false;
        } else {
            return !hasEvents();
        }
    };

    const hasFailedToLoad = (): boolean => {
        if (watchEpisodeState.errors) {
            return watchEpisodeState.errors && watchEpisodeState.errors![watchEpisodeState.errors!.length - 1] !== undefined;
        } else {
            return false;
        }
    };

    if (watchEpisodeState.episode !== undefined && !watchEpisodeState.isLoading) {
        return (
            <Box display='flex'
                 height='95%'
                 className={isPortrait ? classes.flexColumn : ''}
            >

                <Card className={`${classes.videoCard} ${videoIsFullWidth() ? classes.fullWidth : null}`}>
                    <div style={{flex: '1'}}>
                        <ReactPlayer ref={playerRef}
                                     url={getUrl()}
                                     width={'100%'}
                                     height={'100%'}
                                     controls={true}
                                     playing={true}
                                     onError={(e) => console.log(e)}
                                     onProgress={() => synchronizeTimestamp()}
                                     onReady={() => loadTimestamp()}
                                     onBuffer={() => setIsBuffering(true)}
                                     onBufferEnd={() => setIsBuffering(false)}/>
                    </div>
                    <div className={classes.videoHeader}>
                        <Typography className={classes.videoTitle}>{watchEpisodeState.youtubeDetails?.title}</Typography>
                        <Typography className={classes.videoSubtitle}>{moment.utc(Number(watchEpisodeState.episode?.uploadDate) * 1000).format("dddd Do MMMM YYYY")}</Typography>
                    </div>
                </Card>

                {hasEvents() &&
                <Card className={`${classes.eventsCard} ${isPortrait ? classes.halfHeight : classes.eventsWidth}`}>
                    <div className={classes.eventsHeader}>
                        <Typography className={classes.eventsHeaderText}
                                    variant="button">Timeline</Typography>
                    </div>
                    <div
                        style={{overflow: "auto", maxHeight: '92.5%'}}
                        ref={eventsCardRef}
                    >
                        <CardContent>
                            <List>
                                {(watchEpisodeState.events!).map((event, i) => (
                                    <div className={classes.listItem}
                                         key={i}
                                         onClick={() => loadTimestamp(event.timestamp)}
                                    >
                                        <PlayerEventCard
                                            parentRef={eventsCardRef}
                                            id={i}
                                            title={event.description}
                                            timestamp={event.timestamp}
                                        />
                                    </div>
                                ))}
                            </List>
                        </CardContent>
                    </div>
                </Card>
                }
            </Box>
        )
    } else {
        return (
            <div className={`${classes.rootLoading} ${hasFailedToLoad() ? classes.errorBodyHeight : classes.fullHeight}`}>
                {hasFailedToLoad() && <Box className={classes.errorMessage}>
                    <Alert variant={"filled"}
                           severity="error">{watchEpisodeState.errors![watchEpisodeState.errors!.length - 1]}</Alert>
                </Box>}

                <Box display='flex'
                     height='95%'
                     className={isPortrait ? classes.flexColumn : ''}
                >
                    <Card className={`${classes.videoCard} ${videoIsFullWidth() ? classes.fullWidth : null}`}>
                        <div style={{height: '100%'}}>
                            <Skeleton variant="rect"
                                      width={"100%"}
                                      height={"100%"}/>
                        </div>
                        <CardHeader
                            title={<Skeleton/>}
                            subheader={<Skeleton width="40%"/>}
                        />
                    </Card>

                    <Card className={`${classes.eventsCard} ${isPortrait ? classes.halfHeight : classes.eventsWidth}`}>
                        <div className={classes.eventsHeader}>
                            <Typography className={classes.eventsHeaderText}
                                        variant="button">Timeline</Typography>
                        </div>
                        <Box maxHeight='92.5%'
                             style={{overflow: "hidden"}}>
                            <CardContent>
                                <List>
                                    {Array(10).fill(0).map((event, i) => (
                                        <div className={classes.listItem}
                                             key={i}
                                        >
                                            <Skeleton variant="rect"
                                                      width={"100%"}
                                                      height={"10vh"}/>
                                        </div>
                                    ))}
                                </List>
                            </CardContent>
                        </Box>
                    </Card>
                </Box>
            </div>
        )
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(PlayerComponent)
import React, {useEffect, useRef, useState} from "react";
import {connect} from "react-redux";
import {RootState} from "../redux";
import ReactPlayer from "react-player";
import {Box, Card, CardContent, CardHeader, List} from "@material-ui/core";
import {ThunkDispatch} from "redux-thunk";
import {saveTimestamp, setCurrentEventCard, watchPKAEpisode} from "../redux/watch-episode/actions";
import {WatchEpisodeRootActionTypes} from "../redux/watch-episode/types";
import {makeStyles} from "@material-ui/core/styles";
import moment from "moment";
import PlayerEventCard from "./PlayerEventCard";
import Skeleton from '@material-ui/lab/Skeleton';
import {isMobile} from "react-device-detect";
import {Alert} from "@material-ui/lab";

export const YOUTUBE_BASE_URL = 'https://www.youtube.com/watch?v=';

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
    videoCard: {
        height: '100%',
        backgroundColor: '#151515',
        marginRight: '2ch',
        display: 'flex',
        flexFlow: 'column',
        width: '75%',
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
    },
    eventsHeader: {
        textAlign: 'center',
        backgroundColor: '#111111',
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

const RETRY_AMOUNT = 5;

const PlayerComponent: React.FC<PlayerComponentProps> = (props) => {
    const classes = useStyles();

    const {setCurrentEventCard, saveTimestamp, watchPKAEpisode, watchEpisodeState} = props;

    const playerRef = useRef<ReactPlayer>(null);

    const [isInitial, setInitial] = useState(false);

    useEffect(() => {
        if (!watchEpisodeState.isLoading) {
            if (watchEpisodeState.episode === undefined) {
                setInitial(true);

                setTimeout(() => {
                    if (watchEpisodeState.numberOfRetries < RETRY_AMOUNT) {
                        watchPKAEpisode("latest", 0);
                    }
                }, 250)

            } else {
                watchEpisodeState.events!.forEach((event, index) => {
                    if (watchEpisodeState.timestamp >= event.timestamp) {
                        setCurrentEventCard(index);
                        return;
                    }
                });
            }
        }
    }, [setCurrentEventCard, watchEpisodeState.episode, watchEpisodeState.events, watchEpisodeState.isLoading, watchEpisodeState.numberOfRetries, watchEpisodeState.timestamp, watchPKAEpisode]);

    const loadTimestamp = (timestamp?: number) => {
        // For some reason if timestamp is 0, watching the timestamp doesn't seem to work.
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

    const isPortrait = () => {
        return window.outerHeight >= window.outerWidth;
    };

    const hasEvents = () => {
        return watchEpisodeState.events && watchEpisodeState.events.length > 0;
    };

    const isMobilePortrait = () => {
        return isMobile && isPortrait();
    };

    const videoIsFullWidth = () => {
        if (isMobilePortrait()) {
            return true;
        } else if (watchEpisodeState.events === undefined) {
            return false;
        } else {
            return !hasEvents();
        }
    };

    const hasFailedToLoad = (): boolean => {
        return watchEpisodeState.numberOfRetries >= RETRY_AMOUNT;
    };

    if (watchEpisodeState.episode !== undefined && !watchEpisodeState.isLoading) {
        return (
            <Box display='flex'
                 height='95%'
                 className={isMobilePortrait() ? classes.flexColumn : ''}
            >

                <Card className={`${classes.videoCard} ${videoIsFullWidth() ? classes.fullWidth : null}`}>
                    <div style={{height: '100%'}}>
                        <ReactPlayer ref={playerRef}
                                     config={{
                                         youtube: {
                                             preload: true,
                                         }
                                     }}
                                     url={getUrl()}
                                     width={'100%'}
                                     height={'100%'}
                                     controls={true}
                                     playing={true}
                                     onError={(e) => console.log(e)}
                                     onProgress={() => synchronizeTimestamp()}
                                     onPlay={() => handleInitial()}
                                     onReady={() => loadTimestamp()}/>
                    </div>
                    <CardHeader title={watchEpisodeState.youtubeDetails?.title}
                                subheader={moment.utc(Number(watchEpisodeState.episode?.uploadDate) * 1000).format("dddd Do MMMM YYYY")}/>
                </Card>

                {hasEvents() &&
                <Card className={`${classes.eventsCard} ${isMobilePortrait() ? classes.halfHeight : classes.eventsWidth}`}>
                    <CardHeader
                        className={classes.eventsHeader}
                        subheader="Events"
                    />
                    <Box maxHeight='92.5%'
                         style={{overflow: "auto"}}>
                        <CardContent>
                            <List>
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
                        </CardContent>
                    </Box>
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
                     className={isMobilePortrait() ? classes.flexColumn : ''}
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

                    <Card className={`${classes.eventsCard} ${isMobilePortrait() ? classes.halfHeight : classes.eventsWidth}`}>
                        <CardHeader
                            className={classes.eventsHeader}
                            subheader="Events"
                        />
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
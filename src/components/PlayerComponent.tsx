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
    videoCard: {
        width: '75%',
        backgroundColor: '#1f1f1f',
        marginRight: '2ch',
        height: '100%',
        display: 'flex',
        flexFlow: 'column'
    },
    eventsCard: {
        width: '25%',
        backgroundColor: '#191919',
    },
    eventsHeader: {
        textAlign: 'center',
        backgroundColor: '#1b1b1b',
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
            <Box display='flex'
                 flex='1'
                 height='95%'>

                <Card className={classes.videoCard}>
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

                <Card className={classes.eventsCard}>
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
            </Box>
        )
    } else {
        return (
            <Box display='flex'
                 flex='1'
                 height='95%'>
                <Card className={classes.videoCard}>
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
                <Card className={classes.eventsCard}>
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
        )
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(PlayerComponent)
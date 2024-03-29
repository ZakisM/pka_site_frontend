import React, {type ReactElement, useEffect, useRef, useState} from 'react';
import {connect} from 'react-redux';
import type {RootState, ThunkDispatchType} from '../redux';
import ReactPlayer from 'react-player/lazy';
import {
    Box,
    Card,
    CardContent,
    CardHeader,
    alpha,
    List,
    Typography,
} from '@material-ui/core';
import {
    saveTimestamp,
    setCurrentEventCard,
    watchPKAEpisode,
} from '../redux/watch-episode/actions';
import type {
    WatchEpisodeEvent,
    WatchEpisodeRootActionTypes,
} from '../redux/watch-episode/types';
import {makeStyles} from '@material-ui/core/styles';
import moment from 'moment';
import PlayerEventCard from './PlayerEventCard';
import Skeleton from '@material-ui/lab/Skeleton';
import {Alert} from '@material-ui/lab';
import {useHistory, useParams} from 'react-router-dom';
import {useQuery} from '../util';

export const YOUTUBE_BASE_URL = 'https://www.youtube.com';

const mapDispatchToProps = (
    dispatch: ThunkDispatchType<WatchEpisodeRootActionTypes>,
): any => {
    return {
        watchPKAEpisode: (
            number: number | 'latest' | 'random',
            timestamp: number,
        ): void => dispatch(watchPKAEpisode(number, timestamp)),
        saveTimestamp: (timestamp: number): WatchEpisodeRootActionTypes =>
            dispatch(saveTimestamp(timestamp)),
        setCurrentEventCard: (id: number): WatchEpisodeRootActionTypes =>
            dispatch(setCurrentEventCard(id)),
    };
};

const mapStateToProps = (state: RootState): any => ({
    watchEpisodeState: state.watchEpisode,
});

type PlayerComponentProps = ReturnType<typeof mapStateToProps> &
    ReturnType<typeof mapDispatchToProps>;

const useStyles = makeStyles((theme) => ({
    videoCard: {
        height: '100%',
        backgroundColor: '#151515',
        marginRight: '2ch',
        display: 'flex',
        flexFlow: 'column',
        width: '75%',
        boxShadow: 'none',
    },
    videoHeader: {
        padding: '2ch',
        display: 'flex',
        flexFlow: 'column',
    },
    videoTitle: {
        fontSize: '20px',
        fontWeight: 500,
        color: alpha(theme.palette.common.white, 0.9),
    },
    videoSubtitle: {
        fontSize: '15px',
        color: alpha(theme.palette.common.white, 0.5),
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
        flexFlow: 'column',
    },
    eventsCard: {
        backgroundColor: '#151515',
        display: 'flex',
        flexFlow: 'column',
        boxShadow: 'none',
    },
    eventsHeader: {
        textAlign: 'center',
        padding: '2ch',
        backgroundColor: '#151515',
    },
    eventsHeaderText: {
        fontSize: '16px',
        fontWeight: 500,
        color: alpha(theme.palette.common.white, 0.9),
    },
    eventsWidth: {
        width: '25%',
    },
    listItem: {
        marginBottom: '1ch',
    },
    maxHeight: {
        height: '100%',
    },
    errorMessage: {
        height: '10%',
    },
    errorBodyHeight: {
        height: '90%',
    },
    hiddenOverflow: {
        overflow: 'hidden',
    },
    reactPlayer: {
        flex: '1',
    },
    timelineCards: {
        overflow: 'auto',
        maxHeight: '92.5%',
    },
}));

const PlayerComponent = (props: PlayerComponentProps): ReactElement => {
    const history = useHistory();
    const classes = useStyles();

    const {
        setCurrentEventCard,
        saveTimestamp,
        watchPKAEpisode,
        watchEpisodeState,
    } = props;

    const playerRef = useRef<ReactPlayer>(null);
    const eventsCardRef = useRef<any>(null);

    const [isBuffering, setIsBuffering] = useState(false);
    const [isPortrait, setIsPortrait] = useState(false);

    const {episodeNumber} = useParams<any>();

    const query = useQuery();
    const timestampQuery = query.get('timestamp');

    useEffect(() => {
        if (watchEpisodeState.episode === undefined) {
            if (episodeNumber) {
                if (episodeNumber === 'random') {
                    watchPKAEpisode('random', 0);
                } else {
                    watchPKAEpisode(
                        episodeNumber,
                        timestampQuery ? Number.parseInt(timestampQuery) : 0,
                    );
                }
            } else {
                watchPKAEpisode('latest', 0);
            }
        } else {
            if (episodeNumber) {
                if (timestampQuery) {
                    watchPKAEpisode(
                        episodeNumber,
                        Number.parseInt(timestampQuery),
                    );
                }
            }

            history.replace(`/watch/${watchEpisodeState.episode.number}`);
        }
    }, [
        episodeNumber,
        history,
        timestampQuery,
        watchEpisodeState.episode,
        watchPKAEpisode,
    ]);

    useEffect(() => {
        if (!watchEpisodeState.isLoading) {
            if (watchEpisodeState.events) {
                if (watchEpisodeState.timestamp !== 0) {
                    watchEpisodeState.events.forEach(
                        (event: WatchEpisodeEvent, index: number) => {
                            if (
                                watchEpisodeState.timestamp >= event.timestamp
                            ) {
                                setCurrentEventCard(index);
                                return;
                            }
                        },
                    );
                } else {
                    setCurrentEventCard(0);
                }
            }
        }
    }, [
        setCurrentEventCard,
        watchEpisodeState.episode,
        watchEpisodeState.events,
        watchEpisodeState.isLoading,
        watchEpisodeState.timestamp,
        watchPKAEpisode,
    ]);

    useEffect(() => {
        const checkIfPortrait = (): void => {
            setIsPortrait(window.outerHeight >= window.outerWidth);
        };

        checkIfPortrait();
        window.addEventListener('resize', checkIfPortrait);

        return (): void => {
            window.removeEventListener('resize', checkIfPortrait);
        };
    }, []);

    const loadTimestamp = (timestamp?: number): void => {
        // For some reason if timestamp is 0, watching the timestamp doesn't seem to work.
        if (timestamp === 0) {
            timestamp = 1;
        }

        const pRef = playerRef.current;

        if (pRef) {
            pRef.seekTo(
                timestamp ? timestamp : watchEpisodeState.timestamp,
                'seconds',
            );
        }
    };

    const synchronizeTimestamp = (): void => {
        const pRef = playerRef.current;

        if (pRef && !isBuffering) {
            setTimeout(() => {
                const currentTimeStamp = pRef.getCurrentTime();
                if (currentTimeStamp != null) {
                    saveTimestamp(currentTimeStamp);
                }
            }, 1000);
        }
    };

    const getUrl = (): string => {
        const videoId = watchEpisodeState.youtubeDetails?.videoId;

        const url = new URL(YOUTUBE_BASE_URL);
        url.pathname = 'watch';
        url.searchParams.append('v', videoId);
        url.searchParams.append('origin', window.location.origin);
        url.searchParams.append('enablejsapi', '1');

        return url.toString();
    };

    const hasEvents = (): boolean => {
        return watchEpisodeState.events && watchEpisodeState.events.length > 0;
    };

    const videoIsFullWidth = (): boolean => {
        if (isPortrait) {
            return true;
        }

        if (watchEpisodeState.events === undefined) {
            return false;
        }

        return !hasEvents();
    };

    const hasFailedToLoad = (): boolean => {
        if (watchEpisodeState.errors) {
            return (
                watchEpisodeState.errors &&
                watchEpisodeState.errors[
                    watchEpisodeState.errors.length - 1
                ] !== undefined
            );
        }

        return false;
    };

    if (
        watchEpisodeState.episode !== undefined &&
        !watchEpisodeState.isLoading
    ) {
        return (
            <Box
                display="flex"
                height="100%"
                className={isPortrait ? classes.flexColumn : ''}>
                <Card
                    variant="outlined"
                    className={`${classes.videoCard} ${
                        videoIsFullWidth() ? classes.fullWidth : null
                    }`}>
                    <div className={classes.reactPlayer}>
                        <ReactPlayer
                            ref={playerRef}
                            // light={true}
                            url={getUrl()}
                            width={'100%'}
                            height={'100%'}
                            controls={true}
                            playing={true}
                            onError={(e): void => console.log(e)}
                            onProgress={(): void => synchronizeTimestamp()}
                            onReady={(): void => loadTimestamp()}
                            onBuffer={(): void => setIsBuffering(true)}
                            onBufferEnd={(): void => setIsBuffering(false)}
                        />
                    </div>
                    <div className={classes.videoHeader}>
                        <Typography variant="h1" className={classes.videoTitle}>
                            {watchEpisodeState.youtubeDetails?.title}
                        </Typography>
                        <Typography className={classes.videoSubtitle}>
                            {moment
                                .utc(
                                    Number(
                                        watchEpisodeState.episode?.uploadDate,
                                    ) * 1000,
                                )
                                .format('dddd Do MMMM YYYY')}
                        </Typography>
                    </div>
                </Card>

                {hasEvents() && (
                    <Card
                        variant="outlined"
                        className={`${classes.eventsCard} ${
                            isPortrait
                                ? classes.halfHeight
                                : classes.eventsWidth
                        }`}>
                        <div className={classes.eventsHeader}>
                            <Typography
                                className={classes.eventsHeaderText}
                                variant="button">
                                Timeline
                            </Typography>
                        </div>
                        <div
                            className={classes.timelineCards}
                            ref={eventsCardRef}>
                            <CardContent>
                                <List>
                                    {watchEpisodeState.events.map(
                                        (
                                            event: WatchEpisodeEvent,
                                            i: number,
                                        ) => {
                                            const eventCardProps = {
                                                parentRef: eventsCardRef,
                                                id: i,
                                                title: event.description,
                                                timestamp: event.timestamp,
                                            };

                                            return (
                                                <div
                                                    className={classes.listItem}
                                                    key={i}
                                                    onClick={(): void =>
                                                        loadTimestamp(
                                                            event.timestamp,
                                                        )
                                                    }>
                                                    <PlayerEventCard
                                                        {...eventCardProps}
                                                    />
                                                </div>
                                            );
                                        },
                                    )}
                                </List>
                            </CardContent>
                        </div>
                    </Card>
                )}
            </Box>
        );
    }

    return (
        <div
            className={`${classes.maxHeight} ${
                hasFailedToLoad() ? classes.errorBodyHeight : classes.fullHeight
            }`}>
            {hasFailedToLoad() && (
                <Box className={classes.errorMessage}>
                    <Alert variant={'filled'} severity="error">
                        {
                            watchEpisodeState.errors[
                                watchEpisodeState.errors.length - 1
                            ]
                        }
                    </Alert>
                </Box>
            )}

            <Box
                display="flex"
                height="95%"
                className={isPortrait ? classes.flexColumn : ''}>
                <Card
                    variant="outlined"
                    className={`${classes.videoCard} ${
                        videoIsFullWidth() ? classes.fullWidth : null
                    }`}>
                    <div className={classes.maxHeight}>
                        <Skeleton
                            variant="rect"
                            width={'100%'}
                            height={'100%'}
                        />
                    </div>
                    <CardHeader
                        title={<Skeleton />}
                        subheader={<Skeleton width="40%" />}
                    />
                </Card>

                <Card
                    variant="outlined"
                    className={`${classes.eventsCard} ${
                        isPortrait ? classes.halfHeight : classes.eventsWidth
                    }`}>
                    <div className={classes.eventsHeader}>
                        <Typography className={classes.eventsHeaderText}>
                            Events
                        </Typography>
                    </div>
                    <Box maxHeight="92.5%" className={classes.hiddenOverflow}>
                        <CardContent>
                            <List>
                                {Array(10)
                                    .fill(0)
                                    .map((event, i) => (
                                        <div
                                            className={classes.listItem}
                                            key={i}>
                                            <Skeleton
                                                variant="rect"
                                                width={'100%'}
                                                height={'10vh'}
                                            />
                                        </div>
                                    ))}
                            </List>
                        </CardContent>
                    </Box>
                </Card>
            </Box>
        </div>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(PlayerComponent);

import React, {type ReactElement, useEffect, useState} from 'react';
import {alpha, makeStyles} from '@material-ui/core/styles';
import SearchResultCard from './SearchResultCard';
import {connect} from 'react-redux';
import type {RootState, ThunkDispatchType} from '../redux';
import type {EventResult, SearchRootActionTypes} from '../redux/search/types';
import {loadRandomEvents} from '../redux/events/actions';
import LoadingSpinner from './LoadingSpinner';
import {useHistory} from 'react-router-dom';
import {Card, Typography} from '@material-ui/core';
import {RefreshRounded, TimelineRounded} from '@material-ui/icons';
import {getPKAEpisodeYoutubeLink} from '../redux/watch-episode/actions';
import {YOUTUBE_BASE_URL} from './PlayerComponent';
import CustomTooltip from './Tooltip';

const mapDispatchToProps = (
    dispatch: ThunkDispatchType<SearchRootActionTypes>,
): any => {
    return {
        loadRandomEvents: (): void => dispatch(loadRandomEvents()),
    };
};

const mapStateToProps = (state: RootState): any => ({
    pkaEventsState: state.pkaEvents,
});

type RandomEventsListComponentProps = ReturnType<typeof mapStateToProps> &
    ReturnType<typeof mapDispatchToProps>;

const useStyles = makeStyles((theme) => ({
    root: {
        marginBottom: theme.spacing(3),
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleContainer: {
        display: 'flex',
        alignItems: 'center',
        color: alpha(theme.palette.common.white, 0.8),
        flexGrow: 1,
        marginLeft: theme.spacing(2),
    },
    titleContainerIcon: {
        display: 'flex',
        marginRight: theme.spacing(1.25),
    },
    title: {
        fontSize: '18px',
        fontWeight: 500,
        color: alpha(theme.palette.common.white, 0.9),
    },
    list: {
        display: 'flex',
        flex: 1,
        overflowX: 'auto',
    },
    listMaxWidthWithDrawer: {
        maxWidth: 'calc(100vw - 284px)',
    },
    listMaxWidthWithoutDrawer: {
        maxWidth: 'calc(100vw - 64px)',
    },
    listItem: {
        flex: 1,
        minWidth: '280px',
        marginRight: theme.spacing(1),
        '&:last-child': {
            marginRight: 0,
        },
    },
    loadingSpinner: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '140px',
    },
    eventCard: {
        height: '100%',
        backgroundColor: '#1A1A1A',
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        borderRadius: '5px',
        marginBottom: theme.spacing(2),
    },
    refreshButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1A1A1A',
        padding: theme.spacing(1.5),
        borderRadius: '5px',
        boxShadow: 'none',
        '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.1),
            cursor: 'pointer',
        },
        '&:active': {
            boxShadow: 'none',
            backgroundColor: alpha(theme.palette.common.white, 0.025),
        },
    },
}));

const RandomEventsListComponent = (
    props: RandomEventsListComponentProps,
): ReactElement => {
    const classes = useStyles();

    const history = useHistory();

    const {pkaEventsState, loadRandomEvents} = props;

    const [drawerIsVisible, setDrawerIsVisible] = useState(true);

    useEffect(() => {
        if (pkaEventsState.randomEvents.length === 0) {
            loadRandomEvents();
        }
    }, [loadRandomEvents, pkaEventsState.randomEvents.length]);

    useEffect(() => {
        const checkIfDrawerVisible = (): void => {
            setDrawerIsVisible(window.outerWidth >= 600);
        };

        checkIfDrawerVisible();
        window.addEventListener('resize', checkIfDrawerVisible);

        return (): void => {
            window.removeEventListener('resize', checkIfDrawerVisible);
        };
    }, []);

    const handleWatchClick = (
        number: number,
        timestamp: number | null,
    ): void => {
        let url = `/watch/${number}`;

        if (timestamp !== null) {
            url += `?timestamp=${timestamp}`;
        }

        history.push(url);
    };

    const handleYoutubeClick = async (
        number: number,
        timestamp: number | null,
    ): Promise<void> => {
        const youtube_link = await getPKAEpisodeYoutubeLink(number);

        if (youtube_link !== null) {
            const url = new URL(YOUTUBE_BASE_URL);
            url.pathname = 'watch';
            url.searchParams.append('v', youtube_link);
            timestamp && url.searchParams.append('t', `${timestamp}s`);

            window.open(url.toString());
        }
    };

    return (
        <div className={classes.root}>
            <Card variant="outlined" className={classes.toolbar}>
                <div className={classes.titleContainer}>
                    <span className={classes.titleContainerIcon}>
                        <TimelineRounded />
                    </span>
                    <Typography className={classes.title}>
                        Random Events
                    </Typography>
                </div>
                <div
                    className={classes.refreshButton}
                    onClick={(): void => loadRandomEvents()}
                    aria-label="Refresh">
                    <CustomTooltip title="Refresh" arrow>
                        <RefreshRounded />
                    </CustomTooltip>
                </div>
            </Card>
            {pkaEventsState.isLoading ? (
                <div className={classes.loadingSpinner}>
                    <LoadingSpinner />
                </div>
            ) : (
                <div
                    className={`${classes.list} ${
                        drawerIsVisible
                            ? classes.listMaxWidthWithDrawer
                            : classes.listMaxWidthWithoutDrawer
                    }`}>
                    {pkaEventsState.randomEvents.map(
                        (event: EventResult, i: number) => (
                            <div className={classes.listItem} key={i}>
                                <SearchResultCard
                                    customClassName={classes.eventCard}
                                    episodeNumber={event.cardEpisodeNumber()}
                                    title={event.cardTitle()}
                                    subtitle={event.cardSubtitle()}
                                    duration={event.cardDuration()}
                                    timestamp={event.cardTimestamp()}
                                    onWatchClick={(): void =>
                                        handleWatchClick(
                                            event.cardEpisodeNumber(),
                                            event.timestamp,
                                        )
                                    }
                                    onYoutubeClick={(): Promise<void> =>
                                        handleYoutubeClick(
                                            event.cardEpisodeNumber(),
                                            event.timestamp,
                                        )
                                    }
                                />
                            </div>
                        ),
                    )}
                </div>
            )}
        </div>
    );
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(RandomEventsListComponent);

import React, { ReactElement, useEffect, useState } from "react";
import { fade, makeStyles } from "@material-ui/core/styles";
import SearchResultCard from "./SearchResultCard";
import { connect } from "react-redux";
import { RootState, ThunkDispatchType } from "../redux";
import { EventWithAllFieldsClass, SearchRootActionTypes } from "../redux/search/types";
import { loadRandomEvents } from "../redux/events/actions";
import LoadingSpinner from "./LoadingSpinner";
import { useHistory } from "react-router-dom";
import { Tooltip, Typography } from "@material-ui/core";
import RefreshIcon from "@material-ui/icons/Refresh";

const mapDispatchToProps = (dispatch: ThunkDispatchType<SearchRootActionTypes>): any => {
    return {
        loadRandomEvents: (): void => dispatch(loadRandomEvents()),
    };
};

const mapStateToProps = (state: RootState): any => ({
    pkaEventsState: state.pkaEvents,
});

type RandomEventsListComponentProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>;

const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
        marginBottom: theme.spacing(3),
        backgroundColor: "#151515",
        borderRadius: "5px",
        alignItems: "center",
        justifyContent: "center",
    },
    titleContainer: {
        color: fade(theme.palette.common.white, 0.8),
        flexGrow: 1,
        marginLeft: theme.spacing(2),
    },
    title: {
        fontSize: "16px",
    },
    list: {
        display: "flex",
        flex: 1,
        overflowX: "auto",
        marginLeft: theme.spacing(1),
    },
    listMaxWidthWithDrawer: {
        maxWidth: "calc(100vw - 320px)",
    },
    listMaxWidthWithoutDrawer: {
        maxWidth: "calc(100vw - 100px)",
    },
    listItem: {
        flex: 1,
        minWidth: "280px",
        marginRight: theme.spacing(1),
    },
    loadingSpinner: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "140px",
    },
    eventCard: {
        height: "100%",
        backgroundColor: "#1A1A1A",
    },
    toolbar: {
        display: "flex",
        alignItems: "center",
        backgroundColor: "#1a1a1a",
        borderRadius: "5px",
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        marginBottom: theme.spacing(2),
    },
    refreshButton: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#1A1A1A",
        padding: theme.spacing(1.5),
        borderRadius: "5px",
        boxShadow: "none",
        "&:hover": {
            backgroundColor: fade(theme.palette.common.white, 0.1),
        },
        "&:active": {
            boxShadow: "none",
            backgroundColor: fade(theme.palette.common.white, 0.025),
        },
    },
}));

const RandomEventsListComponent = (props: RandomEventsListComponentProps): ReactElement => {
    const classes = useStyles();

    const history = useHistory();

    const { pkaEventsState, loadRandomEvents } = props;

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
        window.addEventListener("resize", checkIfDrawerVisible);

        return (): void => {
            window.removeEventListener("resize", checkIfDrawerVisible);
        };
    }, []);

    const handleClickEventCard = (number: number, timestamp: number): void => {
        history.push(`/watch/${number}?timestamp=${timestamp}`);
    };

    return (
        <div className={classes.root}>
            <div className={classes.toolbar}>
                <div className={classes.titleContainer}>
                    <Typography className={classes.title} variant={"button"}>
                        Random Events
                    </Typography>
                </div>
                <div className={classes.refreshButton} onClick={(): void => loadRandomEvents()} aria-label="Refresh">
                    <Tooltip title="Refresh">
                        <RefreshIcon />
                    </Tooltip>
                </div>
            </div>
            {pkaEventsState.isLoading ? (
                <div className={classes.loadingSpinner}>
                    <LoadingSpinner />
                </div>
            ) : (
                <div
                    className={`${classes.list} ${
                        drawerIsVisible ? classes.listMaxWidthWithDrawer : classes.listMaxWidthWithoutDrawer
                    }`}>
                    {pkaEventsState.randomEvents.map((event: EventWithAllFieldsClass, i: number) => (
                        <div
                            className={classes.listItem}
                            key={i}
                            onClick={(): void => handleClickEventCard(event.episodeNumber, event.timestamp)}>
                            <SearchResultCard
                                customClassName={classes.eventCard}
                                episodeNumber={event.episodeNumber}
                                title={event.cardTitle()}
                                subtitle={event.cardSubtitle()}
                                duration={event.duration()}
                                extraInfo={event.extraInfo()}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(RandomEventsListComponent);

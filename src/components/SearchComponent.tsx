import React, {useEffect, useRef, useState} from "react";
import {fade, makeStyles} from '@material-ui/core/styles';
import SearchIcon from "@material-ui/icons/Search";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import InputBase from "@material-ui/core/InputBase";
import SearchResultCard from "./SearchResultCard";
import useConstant from "use-constant";
import AwesomeDebouncePromise from "awesome-debounce-promise";
import {useAsync} from "react-async-hook";
import {ThunkDispatch} from "redux-thunk";
import {SearchEventActionTypes, SearchItemType} from "../redux/search/types";
import {reverseResultsToggle, searchEventClearResults, searchPKAItem} from "../redux/search/actions";
import {connect} from "react-redux";
import {RootState} from "../redux";
import {Box, CircularProgress, Fab, Tooltip, Typography} from "@material-ui/core";
import AutoSizer from "react-virtualized-auto-sizer";
import {CellMeasurer, CellMeasurerCache, List} from "react-virtualized";
import {isMobile} from "react-device-detect";
import {getPKAEpisodeYoutubeLink, watchPKAEpisode} from "../redux/watch-episode/actions";
import {useHistory} from "react-router-dom";
import {YOUTUBE_BASE_URL} from "./PlayerComponent";

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, {}, SearchEventActionTypes>) => {
    return {
        searchPKAItem: (searchQuery: string, searchItemType: SearchItemType) => dispatch(searchPKAItem(searchQuery, searchItemType)),
        watchPKAEpisode: (number: number, timestamp: number) => dispatch(watchPKAEpisode(number, timestamp)),
        searchEventClearResults: () => dispatch(searchEventClearResults()),
        reverseResultsToggle: () => dispatch(reverseResultsToggle()),
    }
};

const mapStateToProps = (state: RootState) => ({
    searchState: state.search,
});

interface InputProps {
    searchItemType: SearchItemType,
}

type SearchComponentProps =
    ReturnType<typeof mapStateToProps>
    & ReturnType<typeof mapDispatchToProps>
    & InputProps;

const useStyles = makeStyles(theme => ({
    root: {
        height: '95%',
        width: '100%',
        display: 'flex',
        flexFlow: 'column'
    },
    search: {
        backgroundColor: '#151515',
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.05),
        },
        display: 'flex',
        padding: theme.spacing(1),
        flexGrow: 1,
    },
    iconButton: {
        color: fade(theme.palette.common.white, 0.9),
        padding: 10,
        pointerEvents: 'none',
        display: 'flex',
    },
    inputInput: {
        color: 'inherit',
        marginLeft: theme.spacing(0.5),
        flex: 1,
    },
    subTitle: {
        display: 'flex',
        fontSize: '14.5px',
        color: fade(theme.palette.common.white, 0.45),
        marginBottom: '1.5ch',
    },
    searchRow: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '1.5ch',
    },
    reverseButton: {
        flexShrink: 0,
        marginLeft: '2ch',
        borderRadius: '0',
        boxShadow: "none",
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.1),
        },
        '&:active': {
            boxShadow: "none",
            backgroundColor: fade(theme.palette.common.white, 0.025),
        },
    }
}));

const SearchComponent: React.FC<SearchComponentProps> = (props) => {
    const classes = useStyles();

    const {reverseResultsToggle, watchPKAEpisode, searchPKAItem, searchEventClearResults, searchState, searchItemType} = props;

    const searchPKAItemDebounced = useConstant(() =>
        AwesomeDebouncePromise(searchPKAItem, 250)
    );

    const [input, setInput] = useState("");

    const inputRef = useRef<HTMLInputElement>(null);

    const history = useHistory();

    useEffect(() => {
        const iRef = inputRef.current;

        if (iRef) {
            iRef.focus();
        }

        const resetInput = () => {
            if (iRef) {
                if (input === '') {
                    setInput(' ');
                } else {
                    setInput('')
                }
                setInput(iRef.value);
            }
        };

        if (isMobile) {
            window.addEventListener('orientationchange', resetInput);
        } else {
            window.addEventListener('resize', resetInput);
        }

        return function cleanup() {
            if (isMobile) {
                window.removeEventListener('orientationchange', resetInput);
            } else {
                window.removeEventListener('resize', resetInput);
            }
        }
    }, [input]);

    useAsync(async () => {
        const iRef = inputRef.current;

        if (iRef) {
            iRef.focus();
        }

        if (searchItemType === SearchItemType.EPISODE) {
            setInput('');
            await searchPKAItemDebounced(input, searchItemType);
        }
    }, [searchItemType]);

    useAsync(async () => {
        const iRef = inputRef.current;

        if (iRef) {
            iRef.focus();
        }

        if (searchItemType === SearchItemType.EPISODE) {
            await searchEventClearResults();
            await searchPKAItemDebounced(input, searchItemType);
        } else if (input.trim().length <= 2) {
            await searchEventClearResults();
        } else {
            await searchEventClearResults();
            await searchPKAItemDebounced(input, searchItemType);
        }
    }, [input, searchState.reverseResults]);

    const cellMeasurerCache = new CellMeasurerCache({
        fixedWidth: true,
        defaultHeight: 80,
    });

    const paddedRowHeight = ({index}: any): number => {
        let height = cellMeasurerCache.rowHeight({index});
        return height + 5
    };

    const handleClickEventCard = (number: number, timestamp: number) => {
        watchPKAEpisode(number, timestamp);
        history.push("/watch");
    };

    const handleRightClickEventCard = async (e: React.MouseEvent<HTMLDivElement>, number: number, timestamp: number) => {
        e.preventDefault();
        let youtube_link = await getPKAEpisodeYoutubeLink(number);
        if (youtube_link !== "") {
            window.open(`${YOUTUBE_BASE_URL}${youtube_link}&t=${timestamp}`);
        }
    };

    const renderRow = (props: any) => {
        const {index, key, style, parent} = props;
        const searchResult = searchState.searchResults[index];

        return (
            <CellMeasurer key={key}
                          cache={cellMeasurerCache}
                          parent={parent}
                          rowIndex={index}>
                <div style={style}
                     onClick={() => handleClickEventCard(searchResult.episodeNumber, searchResult.timestamp)}
                     onContextMenu={(e) => handleRightClickEventCard(e, searchResult.episodeNumber, searchResult.timestamp)}
                >
                    <SearchResultCard
                        episodeNumber={searchResult.episodeNumber}
                        title={searchResult.cardTitle()}
                        subtitle={searchResult.cardSubtitle()}
                    />
                </div>
            </CellMeasurer>
        );
    };

    const handleReverseOrder = () => {
        reverseResultsToggle();
    };

    return (
        <Box height='97.5%'
             key={searchItemType}>
            <Box className={classes.root}>
                <Box className={classes.searchRow}>
                    <div className={classes.search}>
                        <div className={classes.iconButton}>
                            <SearchIcon/>
                        </div>
                        <InputBase
                            error
                            inputRef={inputRef}
                            placeholder={`Search ${searchItemType}s`}
                            classes={{
                                input: classes.inputInput,
                            }}
                            inputProps={{'aria-label': 'search'}}
                            fullWidth={true}
                            onChange={e => setInput(e.target.value)}
                        />
                        {searchState.isLoading && <div className={classes.iconButton}>
                            <CircularProgress style={{color: '#a3252e'}}
                                              size={23}
                                              thickness={5}/>
                        </div>}
                    </div>
                    {searchItemType === SearchItemType.EVENT && <Tooltip title="Reverse Order">
                        <Fab className={classes.reverseButton}
                             disableRipple={true}
                             disableTouchRipple={true}
                             disableFocusRipple={true}
                             onClick={() => handleReverseOrder()}
                             size="large"
                             color="secondary"
                             aria-label="Reverse Order">
                            {searchState.reverseResults === true ? <ArrowUpwardIcon fontSize="default"/> :
                                <ArrowDownwardIcon fontSize="default"/>}
                        </Fab>
                    </Tooltip>}
                </Box>


                {searchState.searchType === searchItemType &&
                <div style={{height: '100%'}}>
                    {!searchState.isLoading && <Typography variant="button"
                                                           className={classes.subTitle}>
                        {`${searchState.searchResults.length} Results`}
                    </Typography>}
                    <AutoSizer>
                        {({height, width}) => (
                            <List height={height}
                                  width={width}
                                  deferredMeasureMentCache={cellMeasurerCache}
                                  rowCount={searchState.searchResults.length}
                                  rowRenderer={renderRow}
                                  rowHeight={paddedRowHeight}
                                  overscanRowCount={10}
                            >
                            </List>
                        )}
                    </AutoSizer>
                </div>
                }
            </Box>
        </Box>
    )
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SearchComponent)

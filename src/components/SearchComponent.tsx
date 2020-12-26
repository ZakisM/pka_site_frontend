import React, {useEffect, useState} from "react";
import SearchIcon from "@material-ui/icons/Search";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import InputBase from "@material-ui/core/InputBase";
import SearchResultCard from "./SearchResultCard";
import useConstant from "use-constant";
import AwesomeDebouncePromise from "awesome-debounce-promise";
import {useAsync} from "react-async-hook";
import {ThunkDispatch} from "redux-thunk";
import {SearchItemType, SearchRootActionTypes} from "../redux/search/types";
import {connect} from "react-redux";
import {RootState} from "../redux";
import {Tooltip} from "@material-ui/core";
import {AutoSizer, CellMeasurer, CellMeasurerCache, List} from "react-virtualized";
import {isMobile} from "react-device-detect";
import {getPKAEpisodeYoutubeLink} from "../redux/watch-episode/actions";
import {useHistory} from "react-router-dom";
import {YOUTUBE_BASE_URL} from "./PlayerComponent";
import LoadingSpinner from "./LoadingSpinner";
import {reverseResultsToggle, searchPKAItem} from "../redux/search/actions";
import RandomEventsListComponent from "./RandomEventsListComponent";
import {fade, makeStyles} from "@material-ui/core/styles";

const mapDispatchToProps = (dispatch: ThunkDispatch<RootState, {}, SearchRootActionTypes>) => {
    return {
        searchPKAItem: (searchQuery: string, searchItemType: SearchItemType) => dispatch(searchPKAItem(searchQuery, searchItemType)),
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
        display: 'flex',
        flexFlow: 'column',
        height: '100%',
        maxHeight: 'calc(100vh - 100px)',
    },
    search: {
        display: 'flex',
        height: '100%',
        flex: 1,
        backgroundColor: '#151515',
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.05),
        },
        padding: theme.spacing(1),
        borderRadius: '5px'
    },
    iconButton: {
        display: 'flex',
        color: fade(theme.palette.common.white, 0.9),
        padding: '10px',
        pointerEvents: 'none',
    },
    inputInput: {
        color: 'inherit',
        marginLeft: theme.spacing(0.5),
    },
    subTitle: {
        fontSize: '14.5px',
        color: fade(theme.palette.common.white, 0.45),
        marginBottom: theme.spacing(1.5),
    },
    searchRow: {
        display: 'flex',
        height: '100%',
        maxHeight: '60px',
        marginBottom: theme.spacing(1.5),
    },
    reverseButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#151515',
        padding: theme.spacing(2.25),
        marginLeft: theme.spacing(2),
        borderRadius: '5px',
        boxShadow: "none",
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.1),
        },
        '&:active': {
            boxShadow: "none",
            backgroundColor: fade(theme.palette.common.white, 0.025),
        },
    },
    resultListParent: {
        height: '100%'
    }
}));

const SearchComponent: React.FC<SearchComponentProps> = (props) => {
    const classes = useStyles();

    const {reverseResultsToggle, searchPKAItem, searchState, searchItemType} = props;

    const searchPKAItemDebounced = useConstant(() =>
        AwesomeDebouncePromise(searchPKAItem, 250)
    );

    const [initial, setInitial] = useState(true);

    const [input, setInput] = useState("");

    const history = useHistory();

    useEffect(() => {
        if (initial) {
            setInput(searchState.searchQuery);
            setInitial(false);
        }
    }, [initial, searchState.searchQuery]);

    useEffect(() => {
        const resetInput = () => {
            let previousInput = input;

            if (input === '') {
                setInput(' ');
            } else {
                setInput('');
            }

            setInput(previousInput);
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
        //handle initial loading of episodes
        if (searchItemType === SearchItemType.EPISODE) {
            setInput('');
            await searchPKAItemDebounced(input, searchItemType);
        }
    }, [searchItemType]);

    useAsync(async () => {
        await searchPKAItemDebounced(input, searchItemType);
    }, [input]);

    const cellMeasurerCache = new CellMeasurerCache({
        fixedWidth: true,
        defaultHeight: 85,
    });

    const paddedRowHeight = ({index}: any): number => {
        let height = cellMeasurerCache.rowHeight({index});
        return height + 7
    };

    const handleClickEventCard = (number: number, timestamp: number) => {
        history.push(`/watch/${number}?timestamp=${timestamp}`);
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
        const searchResult = searchState.searchResults![index];

        return (
            <CellMeasurer key={key}
                          cache={cellMeasurerCache}
                          parent={parent}
                          rowIndex={index}>
                <div style={style}
                     key={key}
                     onClick={() => handleClickEventCard(searchResult.episodeNumber, searchResult.timestamp)}
                     onContextMenu={(e) => handleRightClickEventCard(e, searchResult.episodeNumber, searchResult.timestamp)}
                >
                    <SearchResultCard
                        episodeNumber={searchResult.episodeNumber}
                        title={searchResult.cardTitle()}
                        subtitle={searchResult.cardSubtitle()}
                        duration={searchResult.duration()}
                    />
                </div>
            </CellMeasurer>
        );
    };

    return (
        <div className={classes.root}
             key={searchItemType}>
            {searchItemType === SearchItemType.EVENT ? <RandomEventsListComponent/> : null}
            <div className={classes.searchRow}>
                <div className={classes.search}>
                    <div className={classes.iconButton}>
                        <SearchIcon/>
                    </div>
                    <InputBase
                        autoFocus={true}
                        value={input}
                        placeholder={`Search ${searchItemType}s`}
                        classes={{
                            input: classes.inputInput,
                        }}
                        inputProps={{'aria-label': 'search'}}
                        fullWidth={true}
                        onChange={e => setInput(e.target.value)}
                    />
                    {searchState.isLoading && <div className={classes.iconButton}>
                        <LoadingSpinner/>
                    </div>}
                </div>
                {searchItemType === SearchItemType.EVENT &&
                <div className={classes.reverseButton}
                     onClick={() => reverseResultsToggle()}
                     aria-label="Reverse Order">
                    <Tooltip title="Reverse Order">
                        {searchState.reverseResults === true ? <ArrowUpwardIcon/> :
                            <ArrowDownwardIcon/>}
                    </Tooltip>
                </div>
                }
            </div>

            <div className={classes.subTitle}>
                {`${searchState.searchResults!.length} Results`}
            </div>

            {searchState.searchType === searchItemType &&
            <div className={classes.resultListParent}>
                <AutoSizer>
                    {({height, width}) => (
                        <List height={height}
                              width={width}
                              deferredMeasureMentCache={cellMeasurerCache}
                              rowCount={searchState.searchResults!.length}
                              rowRenderer={renderRow}
                              rowHeight={paddedRowHeight}
                              overscanRowCount={10}
                        >
                        </List>
                    )}
                </AutoSizer>
            </div>
            }
        </div>
    )
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SearchComponent)

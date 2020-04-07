import React, {useEffect, useRef, useState} from "react";
import {fade, makeStyles} from '@material-ui/core/styles';
import SearchIcon from "@material-ui/icons/Search";
import InputBase from "@material-ui/core/InputBase";
import SearchResultCard from "./SearchResultCard";
import useConstant from "use-constant";
import AwesomeDebouncePromise from "awesome-debounce-promise";
import {useAsync} from "react-async-hook";
import {ThunkDispatch} from "redux-thunk";
import {SearchEventActionTypes, SearchItemType} from "../redux/search/types";
import {searchEventClearResults, searchPKAItem} from "../redux/search/actions";
import {connect} from "react-redux";
import {RootState} from "../redux";
import {Box, CircularProgress, Typography} from "@material-ui/core";
import AutoSizer from "react-virtualized-auto-sizer";
import {CellMeasurer, CellMeasurerCache, List} from "react-virtualized";
import {isMobile} from "react-device-detect";
import {watchPKAEpisode} from "../redux/watch-episode/actions";
import {useHistory} from "react-router-dom";

const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, SearchEventActionTypes>) => {
    return {
        searchPKAItem: (searchQuery: string, searchItemType: SearchItemType) => dispatch(searchPKAItem(searchQuery, searchItemType)),
        watchPKAEpisode: (number: number, timestamp: number) => dispatch(watchPKAEpisode(number, timestamp)),
        searchEventClearResults: () => dispatch(searchEventClearResults()),
    }
};

const mapStateToProps = (state: RootState) => ({
    searchState: state.search,
    pathname: state.router.location.pathname,
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
        borderRadius: theme.spacing(1),
        backgroundColor: fade(theme.palette.common.black, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.black, 0.25),
        },
        marginBottom: '2ch',
        alignItems: 'center',
        display: 'flex',
        padding: theme.spacing(1),
    },
    iconButton: {
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
        fontSize: '1.75ch',
        color: fade(theme.palette.common.white, 0.45),
        marginBottom: '1ch',
    },
}));

const SearchComponent: React.FC<SearchComponentProps> = (props) => {
    const classes = useStyles();

    const {watchPKAEpisode, searchPKAItem, searchEventClearResults, searchState, pathname, searchItemType} = props;

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

        if (pathname === "/episodes") {
            setInput('');
            await searchPKAItemDebounced(input, searchItemType);
        }
    }, [pathname]);

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
    }, [input]);

    const cellMeasurerCache = new CellMeasurerCache({
        fixedWidth: true,
        defaultHeight: 80,
    });

    const paddedRowHeight = ({index}: any): number => {
        let height = cellMeasurerCache.rowHeight({index});
        return height + 5
    };

    const watch = (number: number, timestamp: number) => {
        watchPKAEpisode(number, timestamp);
        history.push("/watch");
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
                     onClick={() => watch(searchResult.episodeNumber, searchResult.timestamp)}>
                    <SearchResultCard
                        episodeNumber={searchResult.episodeNumber}
                        title={searchResult.cardTitle()}
                        subtitle={searchResult.cardSubtitle()}
                    />
                </div>
            </CellMeasurer>
        );
    };

    return (
        <Box height='97.5%'
             key={searchItemType}>
            <Box className={classes.root}>
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
                        <CircularProgress color="primary"
                                          size={23}
                                          thickness={5}/>
                    </div>}
                </div>

                {searchState.searchType === searchItemType &&
                <div style={{height: '100%'}}>
                    {!searchState.isLoading && <Typography variant="caption"
                                                           className={classes.subTitle}>
                        {`${searchState.searchResults.length} RESULTS`}
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
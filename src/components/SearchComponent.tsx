import React, {type ReactElement, useEffect, useState} from 'react';
import {
    ArrowDownwardRounded,
    ArrowUpwardRounded,
    SearchRounded,
} from '@material-ui/icons';
import InputBase from '@material-ui/core/InputBase';
import SearchResultCard from './SearchResultCard';
import useConstant from 'use-constant';
import AwesomeDebouncePromise from 'awesome-debounce-promise';
import {useAsync} from 'react-async-hook';
import {
    SearchItemType,
    type SearchResult,
    type SearchRootActionTypes,
} from '../redux/search/types';
import type {RootState, ThunkDispatchType} from '../redux';
import {Card} from '@material-ui/core';
import {
    AutoSizer,
    CellMeasurer,
    CellMeasurerCache,
    List,
    WindowScroller,
} from 'react-virtualized';
import {isMobile} from 'react-device-detect';
import {getPKAEpisodeYoutubeLink} from '../redux/watch-episode/actions';
import {useHistory} from 'react-router-dom';
import {YOUTUBE_BASE_URL} from './PlayerComponent';
import LoadingSpinner from './LoadingSpinner';
import {reverseResultsToggle, searchPKAItem} from '../redux/search/actions';
import RandomEventsListComponent from './RandomEventsListComponent';
import {alpha, makeStyles} from '@material-ui/core/styles';
import {connect} from 'react-redux';
import CustomTooltip from './Tooltip';

const mapDispatchToProps = (
    dispatch: ThunkDispatchType<SearchRootActionTypes>,
): any => {
    return {
        searchPKAItem: (
            searchQuery: string,
            searchItemType: SearchItemType,
        ): void => dispatch(searchPKAItem(searchQuery, searchItemType)),
        reverseResultsToggle: (): SearchRootActionTypes =>
            dispatch(reverseResultsToggle()),
    };
};

const mapStateToProps = (state: RootState): any => ({
    searchState: state.search,
});

interface InputProps {
    searchItemType: SearchItemType;
}

type SearchComponentProps = InputProps &
    ReturnType<typeof mapStateToProps> &
    ReturnType<typeof mapDispatchToProps>;

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexFlow: 'column',
        height: 'calc(100vh - 100px)',
        maxHeight: 'calc(100vh - 100px)',
    },
    search: {
        display: 'flex',
        height: '100%',
        flex: 1,
        backgroundColor: '#151515',
        '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.05),
        },
        padding: theme.spacing(1),
        borderRadius: '5px',
    },
    iconButton: {
        display: 'flex',
        color: alpha(theme.palette.common.white, 0.9),
        padding: '10px',
        pointerEvents: 'none',
    },
    inputInput: {
        color: 'inherit',
        marginLeft: theme.spacing(0.5),
    },
    subTitle: {
        fontSize: '14.5px',
        color: alpha(theme.palette.common.white, 0.45),
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
    resultListParent: {
        height: '100%',
    },
}));

const SearchComponent = (props: SearchComponentProps): ReactElement => {
    const classes = useStyles();

    const {reverseResultsToggle, searchPKAItem, searchState, searchItemType} =
        props;

    const searchPKAItemDebounced = useConstant(() =>
        AwesomeDebouncePromise(searchPKAItem, 250),
    );

    const [initial, setInitial] = useState(true);

    const [input, setInput] = useState('');

    const history = useHistory();

    useEffect(() => {
        // If initial load and search type == Event then load the previously used query
        if (initial && searchItemType === SearchItemType.EVENT) {
            setInput(searchState.searchQuery);
            setInitial(false);
        }
    }, [initial, searchItemType, searchState.searchQuery]);

    useEffect(() => {
        const resetInput = (): void => {
            const previousInput = input;

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

        return (): void => {
            if (isMobile) {
                window.removeEventListener('orientationchange', resetInput);
            } else {
                window.removeEventListener('resize', resetInput);
            }
        };
    }, [input]);

    useAsync(async () => {
        //handle initial loading of episodes
        if (searchItemType === SearchItemType.EPISODE) {
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
        const height = cellMeasurerCache.rowHeight({index});
        return height + 7;
    };

    const handleWatchClick = (
        number: number,
        timestamp: number | null,
    ): void => {
        let url = `/watch/${number}`;

        if (timestamp !== null) {
            url += `?timestamp=${timestamp}s`;
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

    const renderRow = (props: any): ReactElement => {
        const {index, key, style, parent} = props;
        const searchResult: SearchResult = searchState.searchResults[index];

        return (
            <CellMeasurer
                key={key}
                cache={cellMeasurerCache}
                parent={parent}
                rowIndex={index}>
                <div style={style} key={key}>
                    <SearchResultCard
                        episodeNumber={searchResult.cardEpisodeNumber()}
                        title={searchResult.cardTitle()}
                        subtitle={searchResult.cardSubtitle()}
                        duration={searchResult.cardDuration()}
                        timestamp={searchResult.cardTimestamp()}
                        onWatchClick={(): void =>
                            handleWatchClick(
                                searchResult.cardEpisodeNumber(),
                                searchResult.timestamp,
                            )
                        }
                        onYoutubeClick={(): Promise<void> =>
                            handleYoutubeClick(
                                searchResult.cardEpisodeNumber(),
                                searchResult.timestamp,
                            )
                        }
                    />
                </div>
            </CellMeasurer>
        );
    };

    return (
        <div className={classes.root} key={searchItemType}>
            {searchItemType === SearchItemType.EVENT ? (
                <RandomEventsListComponent />
            ) : null}
            <div className={classes.searchRow}>
                <Card variant="outlined" className={classes.search}>
                    <div className={classes.iconButton}>
                        <SearchRounded />
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
                        onChange={(e): void => setInput(e.target.value)}
                    />
                    {searchState.isLoading && (
                        <div className={classes.iconButton}>
                            <LoadingSpinner />
                        </div>
                    )}
                </Card>
                {searchItemType === SearchItemType.EVENT && (
                    <Card
                        variant="outlined"
                        className={classes.reverseButton}
                        onClick={(): void => reverseResultsToggle()}
                        aria-label="Reverse Order">
                        <CustomTooltip title="Reverse Order" arrow>
                            {searchState.reverseResults === true ? (
                                <ArrowUpwardRounded />
                            ) : (
                                <ArrowDownwardRounded />
                            )}
                        </CustomTooltip>
                    </Card>
                )}
            </div>

            <div
                className={
                    classes.subTitle
                }>{`${searchState.searchResults.length} Results`}</div>

            <div className={classes.resultListParent}>
                {searchState.searchType === searchItemType && (
                    <AutoSizer>
                        {({height, width}): ReactElement => (
                            <WindowScroller>
                                {({
                                    isScrolling,
                                    onChildScroll,
                                }): ReactElement => (
                                    <List
                                        height={height}
                                        width={width}
                                        isScrolling={isScrolling}
                                        onScroll={onChildScroll}
                                        scrollToIndex={0}
                                        deferredMeasureMentCache={
                                            cellMeasurerCache
                                        }
                                        rowCount={
                                            searchState.searchResults.length
                                        }
                                        rowRenderer={renderRow}
                                        rowHeight={paddedRowHeight}
                                        overscanRowCount={10}
                                    />
                                )}
                            </WindowScroller>
                        )}
                    </AutoSizer>
                )}
            </div>
        </div>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchComponent);

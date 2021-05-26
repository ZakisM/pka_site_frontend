import React, { ReactElement } from "react";
import { makeStyles } from "@material-ui/core/styles";
import DrawerComponent from "./DrawerComponent";
import { Redirect, Route, Switch } from "react-router-dom";
import SearchComponent from "./SearchComponent";
import PlayerComponent from "./PlayerComponent";
import { SearchItemType } from "../redux/search/types";
import { ConnectedRouter } from "connected-react-router";
import { history } from "../redux/store";

const useStyles = makeStyles((theme) => ({
    root: {
        display: "flex",
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(4),
        paddingBottom: theme.spacing(6),
        height: "calc(100vh - 40px)",
        maxHeight: "calc(100vh - 40px)",
    },
    toolbar: theme.mixins.toolbar,
}));

const RootComponent = (): ReactElement => {
    const classes = useStyles();

    const searchEpisodeProps = {
        key: SearchItemType.EPISODE,
        searchItemType: SearchItemType.EPISODE,
    };

    const searchEventProps = {
        key: SearchItemType.EVENT,
        searchItemType: SearchItemType.EVENT,
    };

    return (
        <ConnectedRouter history={history}>
            <div className={classes.root}>
                <DrawerComponent />
                <main className={classes.content}>
                    <div className={classes.toolbar} />
                    <Switch>
                        <Route exact path="/">
                            <Redirect to={"/watch"} />
                        </Route>
                        <Route path={["/watch/:episodeNumber", "/watch"]}>
                            <PlayerComponent />
                        </Route>
                        <Route path="/episodes">
                            <SearchComponent {...searchEpisodeProps} />
                        </Route>
                        <Route path="/events">
                            <SearchComponent {...searchEventProps} />
                        </Route>
                        <Redirect from="*" to="/" />
                    </Switch>
                </main>
            </div>
        </ConnectedRouter>
    );
};

export default RootComponent;

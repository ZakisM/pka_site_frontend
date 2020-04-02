import React from "react";
import {makeStyles} from '@material-ui/core/styles';
import DrawerComponent from './DrawerComponent';
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";
import SearchComponent from "./EventSearchComponent";
import PlayerComponent from "./PlayerComponent";

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(4),
        height: '100vh',
    },
    toolbar: theme.mixins.toolbar,
}));

const RootComponent: React.FC = () => {
    const classes = useStyles();

    return (
        <Router>
            <div className={classes.root}>
                <DrawerComponent/>
                <main className={classes.content}>
                    <div className={classes.toolbar}/>
                    <Switch>
                        <Redirect exact
                                  from="/"
                                  to="watch"/>
                        <Route exact
                               path="/watch">
                            <PlayerComponent/>
                        </Route>
                        <Route exact
                               path="/episodes">
                            {/*<SearchComponent searchType={SearchTypes.EPISODES}/>*/}
                        </Route>
                        <Route exact
                               path="/events">
                            <SearchComponent/>
                        </Route>
                        <Route exact
                               path="/guests">
                            {/*<SearchComponent searchType={SearchTypes.GUESTS}/>*/}
                        </Route>
                    </Switch>
                </main>
            </div>
        </Router>
    )
};

export default RootComponent;

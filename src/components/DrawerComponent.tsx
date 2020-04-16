import React from "react";
import {AppBar, Divider, Hidden, IconButton, List, Tooltip, Typography} from "@material-ui/core";
import Toolbar from "@material-ui/core/Toolbar";
import MenuIcon from "@material-ui/icons/Menu";
import Drawer from "@material-ui/core/Drawer";
import DrawerListItem from "./DrawerListItem";
import TheatersIcon from "@material-ui/icons/Theaters";
import LiveTvIcon from "@material-ui/icons/LiveTv";
import EventIcon from "@material-ui/icons/Event";
import {makeStyles, useTheme} from "@material-ui/core/styles";
import ShuffleIcon from '@material-ui/icons/Shuffle';
import {ThunkDispatch} from "redux-thunk";
import {WatchEpisodeRootActionTypes} from "../redux/watch-episode/types";
import {watchPKAEpisode} from "../redux/watch-episode/actions";
import {connect} from "react-redux";
import {useHistory} from "react-router-dom";

export const drawerWidth = 220;

const mapDispatchToProps = (dispatch: ThunkDispatch<{}, {}, WatchEpisodeRootActionTypes>) => {
    return {
        watchRandomPKAEpisode: () => dispatch(watchPKAEpisode("random", 0)),
    }
};

type DrawerComponentProps = ReturnType<typeof mapDispatchToProps>;

const useStyles = makeStyles(theme => ({
    drawer: {
        [theme.breakpoints.up('sm')]: {
            width: drawerWidth,
            flexShrink: 0,
        },
    },
    appBar: {
        [theme.breakpoints.up('sm')]: {
            marginLeft: drawerWidth,
        },
        zIndex: theme.zIndex.drawer + 1,
    },
    appBarTitle: {
        fontFamily: 'Raleway',
        fontSize: '1.5rem',
        fontWeight: 800,
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
        [theme.breakpoints.up('sm')]: {
            display: 'none',
        },
    },
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
        width: drawerWidth,
        backgroundColor: '#0b0b0b',
    },
}));

const DrawerComponent: React.FC<DrawerComponentProps> = (props) => {
    const theme = useTheme();
    const classes = useStyles();

    const {watchRandomPKAEpisode} = props;

    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const history = useHistory();

    const watchRandomEpisode = () => {
        watchRandomPKAEpisode();
        history.push("/watch");
    };

    const drawer = (
        <div>
            <div className={classes.toolbar}/>
            <Divider/>
            <List>
                <DrawerListItem text={"Watch"}
                                Icon={LiveTvIcon}/>
                <DrawerListItem text={"Episodes"}
                                Icon={TheatersIcon}/>
                <DrawerListItem text={"Events"}
                                Icon={EventIcon}/>
            </List>
            <Divider/>
        </div>
    );

    return (
        <div>
            <AppBar position="fixed"
                    className={classes.appBar}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        className={classes.menuButton}
                    >
                        <MenuIcon/>
                    </IconButton>
                    <Typography
                        noWrap
                        className={classes.appBarTitle}
                    >
                        PKA INDEX
                    </Typography>
                    <Tooltip title="Watch Random Episode">
                        <IconButton
                            color="inherit"
                            onClick={watchRandomEpisode}
                            aria-label="Watch Random Episode"
                        >
                            <ShuffleIcon/>
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>
            <nav className={classes.drawer}
                 aria-label="All links">
                <Hidden smUp
                        implementation="js">
                    <Drawer
                        variant="temporary"
                        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        classes={{
                            paper: classes.drawerPaper,
                        }}
                        ModalProps={{
                            keepMounted: true,
                        }}
                    >
                        {drawer}
                    </Drawer>
                </Hidden>
                <Hidden xsDown
                        implementation="js">
                    <Drawer
                        classes={{
                            paper: classes.drawerPaper,
                        }}
                        variant="permanent"
                        open
                    >
                        {drawer}
                    </Drawer>
                </Hidden>
            </nav>
        </div>
    )
};

export default connect(
    null,
    mapDispatchToProps,
)(DrawerComponent)

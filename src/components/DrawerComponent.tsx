import React, { ReactElement } from "react";
import { AppBar, fade, Hidden, IconButton, List, Tooltip, Typography } from "@material-ui/core";
import Toolbar from "@material-ui/core/Toolbar";
import Drawer from "@material-ui/core/Drawer";
import DrawerListItem from "./DrawerListItem";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
    MenuRounded,
    PlayCircleOutlineRounded,
    ShuffleRounded,
    TimelineRounded,
    VideoLibraryRounded,
} from "@material-ui/icons";
import { WatchEpisodeRootActionTypes } from "../redux/watch-episode/types";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import { clearWatchState } from "../redux/watch-episode/actions";
import { ThunkDispatchType } from "../redux";

export const drawerWidth = "220px";

const mapDispatchToProps = (dispatch: ThunkDispatchType<WatchEpisodeRootActionTypes>): any => {
    return {
        clearWatchState: (): WatchEpisodeRootActionTypes => dispatch(clearWatchState()),
    };
};

type DrawerComponentProps = ReturnType<typeof mapDispatchToProps>;

const useStyles = makeStyles((theme) => ({
    drawer: {
        [theme.breakpoints.up("sm")]: {
            width: drawerWidth,
            flexShrink: 0,
        },
    },
    appBar: {
        [theme.breakpoints.up("sm")]: {
            marginLeft: drawerWidth,
        },
        zIndex: theme.zIndex.drawer + 1,
        boxShadow: "none",
    },
    appBarTitle: {
        color: "#cd2d37",
        fontFamily: "Raleway",
        fontSize: "24px",
        fontWeight: 800,
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
        [theme.breakpoints.up("sm")]: {
            display: "none",
        },
    },
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
        width: drawerWidth,
        backgroundColor: "#151515",
        border: 0,
    },
    shuffleIcon: {
        color: fade(theme.palette.common.white, 0.8),
    },
}));

const DrawerComponent = (props: DrawerComponentProps): ReactElement => {
    const theme = useTheme();
    const classes = useStyles();

    const { clearWatchState } = props;

    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleDrawerToggle = (): void => {
        setMobileOpen(!mobileOpen);
    };

    const history = useHistory();

    const watchRandomEpisode = (): void => {
        clearWatchState();
        history.push(`/watch/random`);
    };

    const drawer = (
        <div>
            <div className={classes.toolbar} />
            <List>
                <DrawerListItem text={"Watch"} onClick={handleDrawerToggle} Icon={PlayCircleOutlineRounded} />
                <DrawerListItem text={"Episodes"} onClick={handleDrawerToggle} Icon={VideoLibraryRounded} />
                <DrawerListItem text={"Events"} onClick={handleDrawerToggle} Icon={TimelineRounded} />
            </List>
        </div>
    );

    return (
        <div>
            <AppBar position="fixed" className={classes.appBar}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        className={classes.menuButton}>
                        <MenuRounded />
                    </IconButton>
                    <Typography noWrap className={classes.appBarTitle}>
                        PKA INDEX
                    </Typography>
                    <Tooltip title="Watch Random Episode">
                        <IconButton
                            className={classes.shuffleIcon}
                            onClick={watchRandomEpisode}
                            aria-label="Watch Random Episode">
                            <ShuffleRounded />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>
            <nav className={classes.drawer} aria-label="All links">
                <Hidden smUp implementation="js">
                    <Drawer
                        variant="temporary"
                        anchor={theme.direction === "rtl" ? "right" : "left"}
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        classes={{
                            paper: classes.drawerPaper,
                        }}
                        ModalProps={{
                            keepMounted: true,
                        }}>
                        {drawer}
                    </Drawer>
                </Hidden>
                <Hidden xsDown implementation="js">
                    <Drawer
                        classes={{
                            paper: classes.drawerPaper,
                        }}
                        variant="permanent"
                        open>
                        {drawer}
                    </Drawer>
                </Hidden>
            </nav>
        </div>
    );
};

export default connect(null, mapDispatchToProps)(DrawerComponent);

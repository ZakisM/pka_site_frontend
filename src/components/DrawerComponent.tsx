import React from "react";
import {AppBar, Divider, Hidden, IconButton, List, Typography} from "@material-ui/core";
import Toolbar from "@material-ui/core/Toolbar";
import MenuIcon from "@material-ui/icons/Menu";
import Drawer from "@material-ui/core/Drawer";
import DrawerListItem from "./DrawerListItem";
import TheatersIcon from "@material-ui/icons/Theaters";
import LiveTvIcon from "@material-ui/icons/LiveTv";
import EventIcon from "@material-ui/icons/Event";
import PeopleIcon from "@material-ui/icons/PeopleAlt";
import {makeStyles, useTheme} from "@material-ui/core/styles";

export const drawerWidth = 220;

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
        fontSize: '2.75ch',
        letterSpacing: '0.001ch',
        fontWeight: 600,
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
        backgroundColor: '#111111',
    },
}));

const DrawerComponent: React.FC = () => {
    const theme = useTheme();
    const classes = useStyles();

    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
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
                <DrawerListItem text={"Guests"}
                                Icon={PeopleIcon}/>
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
                        Painkiller Already Index
                    </Typography>
                </Toolbar>
            </AppBar>
            <nav className={classes.drawer}
                 aria-label="mailbox folders">
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

export default DrawerComponent;
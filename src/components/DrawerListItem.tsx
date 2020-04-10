import React from "react";
import {ListItem, ListItemIcon, ListItemText, SvgIcon, Typography} from "@material-ui/core";
import {Link, useRouteMatch} from "react-router-dom";
import {fade, makeStyles} from "@material-ui/core/styles";

interface DrawerListItemProps {
    text: string,
    Icon: typeof SvgIcon,
}

const useStyles = makeStyles(theme => ({
    link: {
        color: 'white',
        textDecoration: 'none',
    },
    item: {
        height: '5.7ch',
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.025),
        },
        '&:active': {
            backgroundColor: fade(theme.palette.common.white, 0.05),
        },
    },
    itemText: {
        marginLeft: '-12.5px',
    },
    active: {
        borderLeft: '5px solid #7a1d23',
        backgroundColor: fade(theme.palette.common.white, 0.05),
        pointerEvents: 'none',
        cursor: 'default',
    }
}));

const DrawerListItem: React.FC<DrawerListItemProps> = (props) => {
    const {text, Icon} = props;
    const classes = useStyles();

    const path = `/${text.toLowerCase()}`;

    let defaultMatch = useRouteMatch({
        exact: true,
        path: '/',
    });

    let match = useRouteMatch({
        path: path,
    });

    const inner = (
        <ListItem className={`${classes.item} ${match || (defaultMatch && text === "Watch") ? classes.active : null}`}
                  key={text}>
            <ListItemIcon>
                <Icon/>
            </ListItemIcon>
            <ListItemText>
                <Typography variant="button"
                            className={classes.itemText}>{text}</Typography>
            </ListItemText>
        </ListItem>
    );

    if (defaultMatch && text === "Watch") {
        return (
            inner
        )
    } else if (match) {
        return (
            inner
        )
    } else {
        return (
            <Link to={path}
                  className={classes.link}>
                {inner}
            </Link>
        )
    }
};

export default DrawerListItem;

import React from "react";
import {ListItem, ListItemIcon, ListItemText, SvgIcon} from "@material-ui/core";
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
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.025),
        },
        '&:active': {
            backgroundColor: fade(theme.palette.common.white, 0.05),
        },
    },
    active: {
        borderLeft: '5px solid #7a1d23',
        backgroundColor: fade(theme.palette.common.white, 0.05),
    }
}));

const DrawerListItem: React.FC<DrawerListItemProps> = (props) => {
    const {text, Icon} = props;
    const classes = useStyles();

    const path = `/${text.toLowerCase()}`;

    let match = useRouteMatch({
        path: path,
    });

    return (
        <Link to={path}
              className={classes.link}>
            <ListItem className={`${classes.item} ${match ? classes.active : null}`}
                      key={text}>
                <ListItemIcon>
                    <Icon/>
                </ListItemIcon>
                <ListItemText style={{marginLeft: '-10px'}}>
                    {text}
                </ListItemText>
            </ListItem>
        </Link>
    )
};

export default DrawerListItem;

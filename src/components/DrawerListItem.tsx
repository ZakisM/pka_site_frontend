import React, {type ReactElement} from 'react';
import {
    ListItem,
    ListItemIcon,
    ListItemText,
    type SvgIcon,
    Typography,
} from '@material-ui/core';
import {Link, useRouteMatch} from 'react-router-dom';
import {alpha, makeStyles} from '@material-ui/core/styles';

interface DrawerListItemProps {
    onClick: () => void;
    text: string;
    Icon: typeof SvgIcon;
}

const useStyles = makeStyles((theme) => ({
    link: {
        color: alpha(theme.palette.common.white, 0.5),
        textDecoration: 'none',
    },
    item: {
        height: '5.7ch',
        '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.0125),
        },
        '&:active': {
            backgroundColor: alpha(theme.palette.common.white, 0.025),
        },
    },
    itemText: {
        marginLeft: '-10px',
    },
    itemIconInactive: {
        color: alpha(theme.palette.common.white, 0.5),
    },
    active: {
        color: theme.palette.common.white,
        borderLeft: '5px solid #cd2d37',
        pointerEvents: 'none',
        cursor: 'default',
    },
}));

const DrawerListItem = (props: DrawerListItemProps): ReactElement => {
    const {text, Icon, onClick} = props;
    const classes = useStyles();

    const path = `/${text.toLowerCase()}`;

    const match = useRouteMatch({
        path: path,
    });

    const inner = (
        <ListItem
            className={`${classes.item} ${match ? classes.active : null}`}
            onClick={onClick}
            key={text}>
            <ListItemIcon
                className={`${match ? null : classes.itemIconInactive}`}>
                <Icon />
            </ListItemIcon>
            <ListItemText>
                <Typography variant="button" className={classes.itemText}>
                    {text}
                </Typography>
            </ListItemText>
        </ListItem>
    );

    if (match) {
        return inner;
    }

    return (
        <Link to={path} className={classes.link}>
            {inner}
        </Link>
    );
};

export default DrawerListItem;

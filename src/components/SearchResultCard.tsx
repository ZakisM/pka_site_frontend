import React from "react";
import {fade, makeStyles} from '@material-ui/core/styles';
import {Avatar, Card, CardHeader} from "@material-ui/core";

interface Props {
    episodeNumber: number,
    title: string,
    subtitle: string,
}

const useStyles = makeStyles(() => ({
    avatar: {
        backgroundColor: '#7a1d23',
        color: 'white',
        width: '5ch',
    },
    resultCard: {
        backgroundColor: fade('#7a1d23', 0.35),
        '&:hover': {
            backgroundColor: fade('#7a1d23', 0.5),
            cursor: 'pointer',
        },
        '&:active': {
            backgroundColor: fade('#7a1d23', 0.2),
            cursor: 'pointer',
        },
    },
}));

const SearchResultCard: React.FC<Props> = (props) => {
    const classes = useStyles();
    const {episodeNumber, title, subtitle} = props;

    return (
        <Card className={classes.resultCard}
        >
            <CardHeader
                avatar={
                    <Avatar variant="rounded"
                            aria-label="recipe"
                            className={classes.avatar}>
                        {episodeNumber}
                    </Avatar>
                }
                title={title}
                subheader={subtitle}
            />
        </Card>
    )
};

export default SearchResultCard;

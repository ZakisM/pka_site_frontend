import {alpha} from '@material-ui/core';
import Tooltip from '@material-ui/core/Tooltip';
import {type Theme, withStyles} from '@material-ui/core/styles';

const CustomTooltip = withStyles((theme: Theme) => ({
    tooltip: {
        color: alpha(theme.palette.common.white, 0.9),
        backgroundColor: '#1a1a1a',
        boxShadow: theme.shadows[1],
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '3px',
        fontSize: 13,
    },
}))(Tooltip);

export default CustomTooltip;

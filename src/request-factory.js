import Request from './request';

export default {
    make: (props) => {
        return class extends Request {
            static defaultProps = {
                ...Request.defaultProps,
                ...props,
            };
        };
    },
};

import React from 'react';
import PT from 'prop-types';
import lodash from 'lodash';

const makeOnce = (func, count = 1) => (...args) => {
    if (count > 0) {
        count--;
        return func(...args);
    }
};

const RequestState = (props) => <div props={props} style={{display: 'none'}} />;

const defaultState = {
    status: 'Initial',
    inputs: [],
    data: undefined,
    error: undefined,
};

class Request extends React.Component {
    /**
     * request status order:
     *  - Initial   <= Start to send request after mount
     *  - Pending   <= Show it immediately. Defaults to render null;
     *  - Loading   <= If request time too long
     *  - Loaded    <= Request success
     *  - Failed    <= Request failed
     */
    static validStatusEnum = ['Initial', 'Pending', 'Loading', 'Loaded', 'Failed'];

    static propTypes = {
        children: PT.func.isRequired,
        fetch: PT.func.isRequired,
        afterFetch: PT.func,
        enable: PT.bool,
        inputs: PT.array,
        renderDisable: PT.func,
        renderPending: PT.func,
        renderLoading: PT.func,
        renderFailed: PT.func,
        onBeforeFetch: PT.func,
        onError: PT.func,
        onLoaded: PT.func,
        showLoadingOverTime: PT.number,
        childrenWrapper: PT.func,
    };

    static defaultProps = {
        enable: true,
        inputs: [],
        showLoadingOverTime: 1000,
        renderDisable: () => null,
        renderPending: () => null,
        renderLoading: () => <div>loading...</div>,
        renderFailed: (error) => <div>
            <h2>Request Failed!</h2>
            <p>Error Message: {error.message}</p>
            <pre>Error Stack: {error.stack}</pre>
        </div>,
        childrenWrapper: (children) => children,
    };

    state = defaultState;

    static getDerivedStateFromProps(nextProps, prevState) {
        const {inputs} = nextProps;
        const {inputs: preInputs} = prevState;
        if ((inputs.length !== preInputs.length)
            || lodash.some(inputs, (x, i) => !lodash.isEqual(x, preInputs[i]))
        ) {
            return {...defaultState, inputs};
        } else {
            return null;
        }
    }

    componentWillUnmount() {
        this._clearTimeout();
    }

    onLoaded(data) {
        const {onLoaded} = this.props;
        if (onLoaded) onLoaded(data);
    }

    onError(data) {
        const {onError} = this.props;
        if (onError) onError(data);
    }

    _clearTimeout() {
        if (this.timeoutTrigger) clearTimeout(this.timeoutTrigger);
    }

    _startFetch() {
        const {showLoadingOverTime} = this.props;
        this.setState({status: 'Pending'});

        this.timeoutTrigger = setTimeout(() => {
            if (this.state.status === 'Pending') {
                this.setState({status: 'Loading'});
            }
        }, showLoadingOverTime);
    }

    _afterFetch(data) {
        const {afterFetch} = this.props;
        if (afterFetch) return afterFetch(data);
        else return data;
    }

    _fetchDone(error, data) {
        this._clearTimeout();

        if (error) {
            this.onError(error);
            this.setState({status: 'Failed', error});
        } else {
            data = this._afterFetch(data);
            this.onLoaded(data);
            this.setState({status: 'Loaded', data});
        }
    }

    /**
     * You no need to catch this function error
     */
    async fetch() {
        const {fetch} = this.props;
        const done = makeOnce(this._fetchDone.bind(this));
        try {
            this._startFetch();
            const data = await fetch(done);
            done(null, data);
        } catch (err) {
            done(err);
        }
    }

    refetch() {
        this.setState(defaultState);
        this.fetch();
    }

    renderDisable() {
        const {renderDisable = this.defaultRenderDisable} = this.props;
        return renderDisable();
    }

    renderInitial() {
        this.fetch();
        return null;
    }

    renderPending() {
        return this.props.renderPending();
    }

    renderLoading() {
        return this.props.renderLoading();
    }

    renderLoaded() {
        const {children, childrenWrapper} = this.props;
        return childrenWrapper(children(this.state.data));
    }

    renderFailed() {
        const {error} = this.state;
        return this.props.renderFailed(error);
    }

    render() {
        if (!this.props.enable) return this.renderDisable();

        const {status} = this.state;
        if (!Request.validStatusEnum.includes(status)) throw new Error(`Invalid status: ${status}`);

        const reqState = <RequestState {...this.state} key="requestState"/>;
        const methodName = `render${status}`;
        if (!this[methodName]) throw new Error(`Not found status render. MethodName: ${methodName}`);
        return [reqState, this[methodName]()];
    }
}

export default Request;

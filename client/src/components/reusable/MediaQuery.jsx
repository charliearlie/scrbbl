import React, { Component, Fragment } from 'react';

export const Devices = {
    mobile: 'mobile',
    tablet: 'tablet',
    desktop: 'desktop',
};

const MinScreenSizes = {
    mobile: 280,
    tablet: 415,
    desktop: 1025
}

class MediaQuery extends Component {
    constructor(props) {
        super(props);

        this.state = {
            currentDevice: this.getWindowSize(window.innerWidth),
        }

        this.handleResize = this.handleResize.bind(this);
    }

    componentDidMount() {
        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize');
    }

    getWindowSize(width) {
        if (width >= MinScreenSizes.mobile && width < MinScreenSizes.tablet) return Devices.mobile;
        if (width >= MinScreenSizes.tablet && width < MinScreenSizes.desktop) return Devices.tablet;
        if (width >= MinScreenSizes.desktop) return Devices.desktop;
    }

    handleResize() {
        const width = window.innerWidth;

        if (width < MinScreenSizes.mobile) return;
        const currentDevice = this.getWindowSize(width);

        this.setState({ currentDevice });
    }

    render() {
        return (
            <Fragment>
                {this.props.children(this.state.currentDevice)}
            </Fragment>
        );
    }
}

export default MediaQuery;

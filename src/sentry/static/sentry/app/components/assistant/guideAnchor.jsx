import PropTypes from 'prop-types';
import classNames from 'classnames';
import React from 'react';
import styled from 'react-emotion';
import createReactClass from 'create-react-class';
import Reflux from 'reflux';
import {registerAnchor, unregisterAnchor} from '../../actionCreators/guides';
import GuideStore from '../../stores/guideStore';
import {expandOut} from '../../styles/animations';

// A guide anchor provides a ripple-effect on an element on the page to draw attention
// to it. Guide anchors register with the guide store, which uses this information to
// determine which guides can be shown on the page.
const GuideAnchor = createReactClass({
  propTypes: {
    target: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['text', 'button']),
  },

  mixins: [Reflux.listenTo(GuideStore, 'onGuideStateChange')],

  getInitialState() {
    return {
      active: false,
    };
  },

  componentDidMount() {
    registerAnchor(this);
  },

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.active && this.state.active) {
      this.anchorElement.scrollIntoView({
        behavior: 'smooth',
      });
    }
  },

  componentWillUnmount() {
    unregisterAnchor(this);
  },

  onGuideStateChange(data) {
    if (
      data.currentGuide &&
      data.currentStep > 0 &&
      data.currentGuide.steps[data.currentStep - 1].target == this.props.target
    ) {
      this.setState({active: true});
    } else {
      this.setState({active: false});
    }
  },

  render() {
    let {target, type} = this.props;

    return (
      <span
        ref={el => (this.anchorElement = el)}
        style={{position: 'relative'}}
        className={classNames('guide-anchor', type)}
      >
        {this.props.children}
        <StyledGuideAnchor
          type={type}
          className={classNames('guide-anchor-ping', target)}
          active={this.state.active}
        />
      </span>
    );
  },
});

const StyledGuideAnchor = styled('div')`
  width: 12px;
  height: 12px;
  cursor: pointer;
  z-index: 999;
  position: relative;
  pointer-events: none;
  animation: ${expandOut} 1.5s ease-out infinite;
  visibility: hidden;

  &,
  &:before,
  &:after {
    position: absolute;
    display: block;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background-color: ${p => p.theme.greenLight};
    border-radius: 50%;
  }

  &:before,
  &:after {
    content: '';
  }

  &:before {
    width: 75%;
    height: 75%;
    background-color: ${p => p.theme.greenDark};
  }

  &:after {
    width: 50%;
    height: 50%;
    color: ${p => p.theme.green};
  }

  ${p => (p.active ? 'visibility: visible;' : '')} ${p =>
      p.type == 'text'
        ? `
    display: inline-block;
    position: relative;
  `
        : ''};
`;

export default GuideAnchor;

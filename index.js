import React, { Component } from 'react';
import ReactNative, { requireNativeComponent, View, UIManager, StyleSheet, Platform } from 'react-native';
import ScrollResponder from 'react-native/Libraries/Components/ScrollResponder';
import createReactClass from 'create-react-class';

const NativeScrollView = requireNativeComponent('DirectedScrollView');
const NativeScrollViewChild = requireNativeComponent('DirectedScrollViewChild');

var ScrollResponderModified = ScrollResponder.Mixin;
ScrollResponderModified.mixins = [
    {
      componentWillUnmount: function() {
        // This null check is a fix for a broken version of uglify-es. Should be deleted eventually
        // https://github.com/facebook/react-native/issues/17348
        this._subscribableSubscriptions && this._subscribableSubscriptions.forEach(
          (subscription) => subscription.remove()
        );
        this._subscribableSubscriptions = null;
      },
      addListenerOn: function(
        eventEmitter: EventEmitter,
        eventType: string,
        listener: Function,
        context: Object
    ) {
         if ( !this._subscribableSubscriptions ) {
              this._subscribableSubscriptions = [];
         }

        this._subscribableSubscriptions.push(
          eventEmitter.addListener(eventType, listener, context)
        );
      }
    }
];

const ScrollView = createReactClass({
  mixins: [ScrollResponderModified],
  getInitialState: function() {
    return this.scrollResponderMixinGetInitialState();
  },
  setNativeProps: function(props) {
    this._scrollViewRef && this._scrollViewRef.setNativeProps(props);
  },
  getScrollResponder: function() {
    return this;
  },
  getScrollableNode: function() {
    return ReactNative.findNodeHandle(this._scrollViewRef);
  },
  scrollTo: function({ x, y, animated }) {
     UIManager.dispatchViewManagerCommand(
      this.getScrollableNode(),
      UIManager.DirectedScrollView.Commands.scrollTo,
      [x || 0, y || 0, animated !== false],
    );
  },
  zoomToStart: function({ animated }) {
     UIManager.dispatchViewManagerCommand(
      this.getScrollableNode(),
      UIManager.DirectedScrollView.Commands.zoomToStart,
      [animated !== false],
    );
  },
  _scrollViewRef: null,
  _setScrollViewRef: function(ref) {
    this._scrollViewRef = ref;
  },
  componentDidMount: function() {
    setTimeout(() => {
      this.zoomToStart({animated: false});
    }, 0);
  },
  render: function() {
    return (
      <NativeScrollView
        {...this.props}
        ref={this._setScrollViewRef}
        onScrollBeginDrag={this.scrollResponderHandleScrollBeginDrag}
        onScrollEndDrag={this.scrollResponderHandleScrollEndDrag}
        onScroll={this.scrollResponderHandleScroll}
        onMomentumScrollBegin={this.scrollResponderHandleMomentumScrollBegin}
        onMomentumScrollEnd={this.scrollResponderHandleMomentumScrollEnd}
        onStartShouldSetResponder={this.scrollResponderHandleStartShouldSetResponderCapture}
        onScrollShouldSetResponder={this.scrollResponderHandleScrollShouldSetResponder}
        onResponderGrant={this.scrollResponderHandleResponderGrant}
        onResponderTerminationRequest={this.scrollResponderHandleTerminationRequest}
        onResponderTerminate={this.scrollResponderHandleTerminate}
        onResponderRelease={this.scrollResponderHandleResponderRelease}
        onResponderReject={this.scrollResponderHandleResponderReject}
      >
        <View style={this.props.contentContainerStyle} pointerEvents={'box-none'}>
          {this.props.children}
        </View>
      </NativeScrollView>
    );
  }
});

export default ScrollView;

export const ScrollViewChild = createReactClass({
  render: function() {
    return (
      <NativeScrollViewChild {...this.props}>
        {this.props.children}
      </NativeScrollViewChild>
    );
  }
});

export const scrollViewWillBeginDragging = 'scrollViewWillBeginDragging';

export const scrollViewDidEndDragging = 'scrollViewDidEndDragging';

"use strict";

var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;
var React = require('react');

// React Router
var DocumentTitle = require('react-document-title');
var BridgeQuote = require('../modules/bridge-quote-flow/components/bridge-quote-flow.jsx');

// React components
var TopBar = require('../shared/components/header/top-bar.jsx');
var Sidebar = require('../shared/components/sidebar.jsx');

// required to use React Bootstrap in child modules
require('react-bootstrap');

var topBarConfig = {
  wrapperClassName: 'navbar-inverse navbar-fixed-top top-bar container-fluid'
};

var App =
  React.createClass({

    mixins: [IntlMixin],

    getInitialState: function() {
      return { showSidebar: false };
    },

    expandSidebar: function() {
      if (session.isLoggedIn()) {
        this.setState({showSidebar: this.state.showSidebar ? false : true});
      } else {
        this.setState({showSidebar: false});
      }
    },

    render:function(){
      return (
        <div>
          <TopBar
            brandName={topBarConfig.brandName}
            wrapperClassName={topBarConfig.wrapperClassName}
            expandSidebar={this.expandSidebar}
          />
          {this.state.showSidebar ?
            <Sidebar sidebarClassName="sidebar sidebar-wallets"></Sidebar> : false
          }
          <div className="container">
            <div className="row">
              <div className="col-sm-12 col-md-12 main">
                <DocumentTitle title={topBarConfig.brandName}>
                  <BridgeQuote/>
                </DocumentTitle>
              </div>
            </div>
          </div>
        </div>
      )
    }
});

module.exports = App;

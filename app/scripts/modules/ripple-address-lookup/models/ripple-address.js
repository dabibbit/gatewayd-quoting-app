"use strict";

var path = require('path');
var _ = require('lodash');
var $ = require('jquery');
var appConfig = require('../../../../../app-config.json');

var Backbone = require('backbone');
var ValidationMixins = require('../../../shared/helpers/validation_mixin');

var adminDispatcher = require('../../../dispatchers/admin-dispatcher');
var addressActions = require('../config.json').actions;


Backbone.$ = $;

var RippleAddress = Backbone.Model.extend({
  defaults: {
    federatedAddress: ""
  },

  validationRules: {
    links: ['isRequired', 'isArray']
  },

  url: function() {
    var baseUrl = appConfig.baseUrl || location.origin;
    var federatedAddress = this.get('federatedAddress') || '';

    if (!federatedAddress) {
      return '';
    }

    //todo get this gateway url from input or config
    return baseUrl + '/.well-known/webfinger.json?resource=acct:' +
           encodeURIComponent(this.get('federatedAddress'));
  },

  initialize: function() {
    _.bindAll(this);

    adminDispatcher.register(this.dispatchCallback);
  },

  setFederatedAddress: function(address) {

    //need to reset other model attrs when we change the sender
    this.clear({silent: true});
    this.set("federatedAddress", address);
  },

  resolveAddress: function() {
    this.fetchRippleAddress();
  },

  //todo: look into handling this
  handleFetchError: function() {
  },

  fetchRippleAddress: function() {
    this.fetch({
      validate: true,
      error: this.handleFetchError
    });
  },

  dispatchCallback: function(payload) {
    if (!_.isUndefined(this[payload.actionType])) {
      this[payload.actionType](payload.data);
    }
  }
});

//add validation mixin
_.extend(RippleAddress.prototype, ValidationMixins);

module.exports = RippleAddress;

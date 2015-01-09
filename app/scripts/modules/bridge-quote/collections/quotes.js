"use strict";

// todo: clean this up and modularize with variable file name/path
// handle secrets. Make npm module for this in the future
var secrets = require('../../../../../secrets');

var path = require('path');
var _ = require('lodash');
var $ = require('jquery');
var Backbone = require('backbone');
var adminDispatcher = require('../../../dispatchers/admin-dispatcher');
var quoteConfigActions = require('../config.json').actions;
var Model = require('../models/quote');

Backbone.$ = $;

var Quotes = Backbone.Collection.extend({
  model: Model,

  getSecret: function(key) {
    if (secrets[key]) {
      return secrets[key];
    }

    return false;
  },

  comparator: function(a, b) {
    return b.id - a.id; // by cheapest path?
  },

  initialize: function() {
    _.bindAll(this);

    adminDispatcher.register(this.dispatcherCallback);
  },

  dispatcherCallback: function(payload) {
    var handleAction = {};

    handleAction[quoteConfigActions.updateUrlWithParams] = this.updateUrlWithParams;
    handleAction[quoteConfigActions.fetchQuotes] = this.fetchQuotes;

    if (!_.isUndefined(this[payload.actionType])) {
      this[payload.actionType](payload.data);
    }
  },

  // update template url with real params
  updateUrlWithParams: function(quoteQueryParams) {
    if (_.isUndefined(quoteQueryParams) || _.isEmpty(quoteQueryParams)) {
      return false;
    }

    var external = this.get('external');
    var updatedUrl = this.url;

    // updatedUrl = updatedUrl.replace(/{sender}/, quoteQueryParams.source_address);
    // updatedUrl = updatedUrl.replace(/{receiver}/, quoteQueryParams.destination_address);
    // updatedUrl = updatedUrl.replace(/{amount}/,
    //   quoteQueryParams.destination_amount + '+' + quoteQueryParams.destination_currency);
    //
    console.log("aaaaaaaaaaaaaaaaaaaaa", this.url);

    updatedUrl = path.join(
      updatedUrl,
      'quotes',
      'acct:' + quoteQueryParams.source_address,
      'acct:' + quoteQueryParams.destination_address,
      quoteQueryParams.destination_amount + '+' + quoteQueryParams.destination_currency
    );

    this.url = updatedUrl;
  },

  fetchQuotes: function() {
    var credentials = this.getSecret('credentials');

    this.fetch({
      beforeSend: function (xhr) {
        xhr.setRequestHeader ('Authorization', credentials);
      }
    });
  },

  parse: function(data) {
    return data.bridge_payments;
  }
});

module.exports = Quotes;

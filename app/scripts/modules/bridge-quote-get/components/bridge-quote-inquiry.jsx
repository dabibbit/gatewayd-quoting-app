"use strict";

var _ = require('lodash');
var React = require('react');
var Modal = require('react-bootstrap').Modal;
var Row = require('react-bootstrap').Row;
var Col = require('react-bootstrap').Col;
var Input = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;
var quoteActions = require('../actions');
var BridgeQuoteInquiryModel = require('../models/quote-inquiry');
var QuotesCollection = require('../collections/quotes');
var FormValidationMixin = require('../../../shared/mixins/components/form_validation_mixin');

var QuoteInquiryForm = React.createClass({
  getDefaultProps: function() {
    return {
      wrapperClassName: ''
    };
  },

  mixins: [FormValidationMixin],

  model: BridgeQuoteInquiryModel,

  collection: new QuotesCollection(),

  refNameTypeMap: {
    source_address: 'string',
    destination_address: 'string',
    destination_currency: 'string',
    destination_amount: 'number'
  },

  // used in getInitialState mixin method
  initialState: {
    submitButtonLabel: 'Get Quotes'
  },

  isFirstLoad: true,

  updateInputField: function(refName, value) {
    var updatedInput = _.extend(this.state[refName], {
      value: value
    });

    if (this.isMounted()) {
      this.setState(updatedInput);
    }
  },

  updateDestinationAddress: function(model, newAddress) {
    this.updateInputField('destination_address', newAddress);
  },

  updateDestinationCurrency: function(model, newCurrency) {
    this.updateInputField('destination_currency', newCurrency);
  },

  updateDestinationAmount: function(model, newAmount) {
    this.updateInputField('destination_amount', newAmount);
  },

  // list of custom event bindings and actions on mount
  // used in componentDidMount mixin method
  handleAfterMount: function() {
    this.model.on('change:destination_address', this.updateDestinationAddress);
    this.model.on('change:destination_currency', this.updateDestinationCurrency);
    this.model.on('change:destination_amount', this.updateDestinationAmount);
    this.model.on('error', this.handleError);

    this.collection.on('sync', this.handleSuccess);
    this.collection.on('error', this.handleError);
  },

  // list of custom event unbindings and actions on unmount
  // used in componentWillUnmount mixin method
  handleAfterUnmount: function() {
    this.model.off('change error');
    this.collection.off('sync error');
    quoteActions.reset();
  },

  componentDidUpdate: function() {

    if (!this.props.isDisabled) {
      this.activateForm();
    } else {

      // initialize first load if this module is disabled
      // just a flag to only autofocus on first load
      this.isFirstLoad = true;
    }
  },

  //todo: this currently focuses. Should it toggle state of entire form?
  activateForm: function() {
    if (this.isFirstLoad) {
      this.refs.destination_address.refs.input.getDOMNode().focus();
    }

    this.isFirstLoad = false;
  },

  //TODO use this to check if model is valid. Part of todo below
  handleError: function(collection, error) {
    console.log('Erra', arguments);
    console.log('error.responseText', JSON.parse(error.responseText).errors[0]);

    this.setState({
      formError: JSON.parse(error.responseText).errors[0],
      submitButtonLabel: 'Re-Submit Quote Request?'
    });
  },

  handleSuccess: function(collection) {
    if (!collection.length) {
      this.handleError(collection, {
        error: {
          responseText: '{error: ["No quotes available"]}'
        }
      });

      return false;
    }

    if (_.isFunction(this.props.onSuccessCb)) {
      this.props.onSuccessCb({
        quotes: collection.toJSON()
      });
    }

    this.setState({
      submitButtonLabel: 'Quotes Retrieved',
      formError: ''
    });
  },

  // list of actions to invoke after form input changes
  // used in handleChange mixin method
  handleAfterChange: function(refName, fieldValue) {
    quoteActions.updateAttributeData(refName, fieldValue);
  },

  // list of actions to dispatch when validating field on blur
  // used in validateField mixin method
  handleValidations: function(refName, fieldValue) {
    quoteActions.validateField(refName, fieldValue);
  },

  // list of actions to dispatch after successful creation
  // used in dispatchCreateComplete mixin method
  handleAfterCreate: function(data) {},

  // on model sync error
  handleSubmissionError: function() {},

  createCollectionUrl: function() {
    var url = this.props.bridgeQuoteUrl;

    return url;
  },

  handleSubmit: function(e) {
    e.preventDefault();

    var quoteQueryParams = _.extend({source_address: this.props.federatedAddress},
                                    this.buildFormObject(this.refs));

    this.setState({
      submitButtonLabel: 'Getting Quotes...',
    });

    if (this.model.isValid()) {
      quoteActions.setQuotingUrl(this.props.bridgeQuoteUrl);
      quoteActions.updateUrlWithParams(quoteQueryParams);
      quoteActions.fetchQuotes();
    } else {
      this.handleSubmissionError();
    }
  },

  render: function() {
    var isDisabled = (this.props.isDisabled === true) ? true : false;
    var destination_address = this.state.destination_address;
    var destination_currency = this.state.destination_currency;
    var destination_amount = this.state.destination_amount;
    var source_address = this.state.source_address;

    return (
      <form onSubmit={this.handleSubmit} className={this.props.wrapperClassName}>
        <Input
          type="text"
          ref="destination_address"
          label="Destination Address:"
          bsStyle={this.validationMap[destination_address.inputState]}
          disabled={isDisabled}
          onBlur={this.validateField.bind(this, 'destination_address')}
          onChange={this.handleChange.bind(this, 'destination_address')}
          value={destination_address.value}
          hasFeedback
        />
        {this.errorMessageLabel(destination_address.errorMessage)}

        <Input
          type="text"
          ref="destination_amount"
          label="Destination Amount:"
          bsStyle={this.validationMap[destination_amount.inputState]}
          disabled={isDisabled}
          onBlur={this.validateField.bind(this, 'destination_amount')}
          onChange={this.handleChange.bind(this, 'destination_amount')}
          value={destination_amount.value}
          hasFeedback
        />
        {this.errorMessageLabel(destination_amount.errorMessage)}

        <Input
          type="tel"
          ref="destination_currency"
          label="Destination Currency:"
          bsStyle={this.validationMap[destination_currency.inputState]}
          disabled={isDisabled}
          onBlur={this.validateField.bind(this, 'destination_currency')}
          onChange={this.handleChange.bind(this, 'destination_currency')}
          value={destination_currency.value}
          hasFeedback
        />
        {this.errorMessageLabel(destination_currency.errorMessage)}

        <br />

        <Button
          bsStyle="primary"
          bsSize="large"
          type="submit"
          disabled={isDisabled}
          block
        >
          {this.state.submitButtonLabel}
        </Button>
        {this.errorMessageLabel(this.state.formError)}
        <br />
      </form>
    );
  }
});

module.exports = QuoteInquiryForm;
import {Box} from 'grid-emotion';
import PropTypes from 'prop-types';
import React from 'react';

import createReactClass from 'create-react-class';

import {addErrorMessage} from '../../../../actionCreators/indicator';
import ApiMixin from '../../../../mixins/apiMixin';
import Form from '../../components/forms/form';
import JsonForm from '../../components/forms/jsonForm';
import organizationSettingsFields from '../../../../data/forms/organizationGeneralSettings';
import OrganizationState from '../../../../mixins/organizationState';

const NewOrganizationSettingsForm = createReactClass({
  displayName: 'NewOrganizationSettingsForm',

  propTypes: {
    location: PropTypes.object,
    orgId: PropTypes.string.isRequired,
    access: PropTypes.object.isRequired,
    initialData: PropTypes.object.isRequired,
    onSave: PropTypes.func.isRequired,
  },

  mixins: [ApiMixin, OrganizationState],

  render() {
    let {initialData, orgId, onSave, access} = this.props;

    //Only for adding the Flag to 2FA Enforcement.
    if (this.getFeatures().has('require-2fa')) {
      let security_panel = organizationSettingsFields.find(
        panel => panel.title == 'Security & Privacy'
      );
      if (!security_panel.fields.find(field => field.name == 'require2FA'))
        security_panel.fields.unshift({
          name: 'require2FA',
          type: 'boolean',
          label: 'Require Two-Factor Authentication',
          help: 'Require two-factor authentication for all members.',
        });
    }

    return (
      <Form
        className="ref-organization-settings"
        apiMethod="PUT"
        apiEndpoint={`/organizations/${orgId}/`}
        saveOnBlur
        allowUndo
        initialData={initialData}
        onSubmitSuccess={(resp, model, fieldName, change) => {
          // Special case for slug, need to forward to new slug
          if (typeof onSave === 'function') {
            onSave(initialData, model.initialData);
          }
        }}
        onSubmitError={error => {
          if (error.responseJSON && 'require2FA' in error.responseJSON) {
            return addErrorMessage(
              'Unable to save change. Enable two-factor authentication on your account first.'
            );
          }
          return addErrorMessage('Unable to save change');
        }}
      >
        <Box>
          <JsonForm
            access={access}
            location={this.props.location}
            forms={organizationSettingsFields}
          />
        </Box>
      </Form>
    );
  },
});

export default NewOrganizationSettingsForm;

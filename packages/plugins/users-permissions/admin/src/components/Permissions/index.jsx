import React, { useState } from 'react';

import { Tabs, Checkbox, Box, Typography } from '@strapi/design-system';
import { styled } from 'styled-components';

import { Flex } from '@strapi/design-system';
import { useIntl } from 'react-intl';

import { useUsersPermissions } from '../../contexts/UsersPermissionsContext';



// CONSTANTS
const TAB_LABELS = [
  {
    labelId: '🛑',
    defaultMessage: 'Collection Types',
    id: 'collectionTypes',
  },
  {
    labelId: '🛑',
    id: 'singleTypes',
    defaultMessage: 'Single Types',
  },
  {
    labelId: '🛑',
    defaultMessage: 'Plugins',
    id: 'plugins',
  },
];

// STYLES

const BoxWrapper = styled.div`
  display: inline-flex;
  min-width: 100%;
  position: relative;
`;

const Wrapper = styled(Flex)`
  height: 50px;
  border: 1px solid transparent;
`;

// TODO width
const Cell = styled(Flex)`
  width: 12rem;
  position: relative;
`;

const TypesCheckboxFlex = styled(Flex)`
  width: 10rem; // Adjust this value as needed
  alignItems: "center";
  paddingLeft: 6;
  shrink: 0;
`;

const rowHeight = 100; // temp

// DATA

const Permissions = () => {
  const {  modifiedData } = useUsersPermissions();
  const { formatMessage } = useIntl();

  // Sort the data from the API into different tabs
  const separatedData = Object.entries(modifiedData).reduce(
    (acc, [key, { isCollectionType, controllers }]) => {
      const [pluginName] = key.split('::');

      const isPlugin = pluginName === 'plugin';

      if (isPlugin) {
        acc.plugins.push({ key, value: { controllers } });

        return acc;
      }

      if (isCollectionType) {
        acc.collectionTypes.push({ key, value: { controllers } });
      } else {
        acc.singleTypes.push({ key, value: { controllers } });
      }

      return acc;
    },
    {
      collectionTypes: [],
      singleTypes: [],
      plugins: [],
    }
  );

  // Collection types data
  const collectionTypesData = separatedData.collectionTypes.map(({ value }) => {
    const controllers = value.controllers;

    const subcategories = Object.entries(controllers).map(([subcategoryName, actions]) => {
      const actionsArray = Object.entries(actions).map(([actionName, actionDetails]) => {
        return {
          name: actionName,
          enabled: actionDetails.enabled,
        };
      });

      // Return the new subcategory object
      return {
        name: subcategoryName,
        label: subcategoryName.charAt(0).toUpperCase() + subcategoryName.slice(1),
        actions: actionsArray,
      };
    });

    return subcategories;
  }).flat();

  const COLLECTION_TYPES_ACTIONS = [];

  collectionTypesData.forEach(subcategory => {
    subcategory.actions.forEach(action => {
      if (!COLLECTION_TYPES_ACTIONS.find(a => a.actionId === action.name)) {
        COLLECTION_TYPES_ACTIONS.push({ label: action.name, actionId: action.name });
      }
    });
  });

  // Single types data
  const singleTypesData = separatedData.singleTypes.map(({ value }) => {
    const controllers = value.controllers;

    const subcategories = Object.entries(controllers).map(([subcategoryName, actions]) => {
      const actionsArray = Object.entries(actions).map(([actionName, actionDetails]) => {
        return {
          name: actionName,
          enabled: actionDetails.enabled,
        };
      });

      // Return the new subcategory object
      return {
        name: subcategoryName,
        label: subcategoryName.charAt(0).toUpperCase() + subcategoryName.slice(1),
        actions: actionsArray,
      };
    });

    return subcategories;
  }).flat();

  const SINGLE_TYPES_ACTIONS = [];

  singleTypesData.forEach(subcategory => {
    subcategory.actions.forEach(action => {
      if (!SINGLE_TYPES_ACTIONS.find(a => a.actionId === action.name)) {
        SINGLE_TYPES_ACTIONS.push({ label: action.name, actionId: action.name });
      }
    });
  });

  // Plugins data
  const pluginsData = separatedData.plugins.map(({ value }) => {
    const controllers = value.controllers;

    const subcategories = Object.entries(controllers).map(([subcategoryName, actions]) => {
      const actionsArray = Object.entries(actions).map(([actionName, actionDetails]) => {
        return {
          name: actionName,
          enabled: actionDetails.enabled,
        };
      });

      // Return the new subcategory object
      return {
        name: subcategoryName,
        label: subcategoryName.charAt(0).toUpperCase() + subcategoryName.slice(1),
        actions: actionsArray,
      };
    });

    return subcategories;
  }).flat();

  const PLUGINS_ACTIONS = [];

  pluginsData.forEach(subcategory => {
    subcategory.actions.forEach(action => {
      if (!PLUGINS_ACTIONS.find(a => a.actionId === action.name)) {
        PLUGINS_ACTIONS.push({ label: action.name, actionId: action.name });
      }
    });
  });

  // LOCAL STATE FOR CHECKBOXES

  const [collectionTypesState, setCollectionTypeState] = useState(collectionTypesData);
  const [singleTypesState, setSingleTypesState] = useState(singleTypesData);
  const [pluginsState, setPluginsState] = useState(pluginsData);

  // console.log('singleTypesState', singleTypesState)
  // console.log('collectionTypesState', collectionTypesState)
  console.log('pluginsState', pluginsState);

  // Initialize the types data
  const typesData = {
    collection: {
      data: collectionTypesData,
      state: [collectionTypesState, setCollectionTypeState],
      actions: COLLECTION_TYPES_ACTIONS,
    },
    single: {
      data: singleTypesData,
      state: [singleTypesState, setSingleTypesState],
      actions: SINGLE_TYPES_ACTIONS,
    },
    plugin: {
      data: pluginsData,
      state: [pluginsState, setPluginsState],
      actions: PLUGINS_ACTIONS,
    },
  };

  // ACTION HANDLERS
  const handleActionChange = (subcategoryIndex, actionIndex, value, all = false, type) => {
    const setState = typesData[type].state[1];
    console.log(subcategoryIndex)

    setState(prevData => {
      const newData = [...prevData];
      if (all) {
        newData[subcategoryIndex].actions.forEach(action => {
          action.enabled = value;
        });
      } else {
        newData[subcategoryIndex].actions[actionIndex].enabled = value;
      }
      return newData;
    });
  };

  const handleTypeCheckboxChange = (subcategoryIndex, value, type) => {
    console.log(subcategoryIndex)
    handleActionChange(subcategoryIndex, null, value, true, type);
  };

  const handleHeaderCheckboxChange = (actionName, type) => {
    const setState = typesData[type].state[1];

    setState(prevData => {
      const newData = [...prevData];
      newData.forEach(subcategory => {
        subcategory.actions.forEach(action => {
          if (action.name === actionName) {
            action.enabled = !action.enabled;
          }
        });
      });
      return newData;
    });
  };

  const areAllActionsEnabled = (actionName, type) => {
    const state = typesData[type].state[0];
    return state.every(subcategory =>
      subcategory.actions.every(action =>
        action.name !== actionName || action.enabled
      )
    );
  };

  // End of handlers


  // Returned components

  return (


  <Box background={'neutral0'}>

    <Tabs.Root defaultValue={TAB_LABELS[0].id}>
      <Tabs.List
        aria-label={formatMessage({
          id: 'Settings.permissions.users.tabs.label',
          defaultMessage: 'Tabs Permissions',
        })}
      >
        {TAB_LABELS.map((tabLabel) => (
          <Tabs.Trigger key={tabLabel.id} value={tabLabel.id}>
            {formatMessage({ id: tabLabel.labelId, defaultMessage: tabLabel.defaultMessage })}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      <Tabs.Content value={TAB_LABELS[0].id}>
        {/* headers row */}
        <Box paddingBottom={4} paddingTop={6} style={{ paddingLeft: `20rem` }} >
          <Flex gap={0} marginLeft={11} marginRight={10}
          >
            {COLLECTION_TYPES_ACTIONS.map(({ label, actionId }) => {
              return (
                <Flex
                  shrink={0}
                  width={'12rem'} // cells width
                  direction="column"
                  alignItems="center"
                  justifyContent="center"
                  key={actionId}
                  gap={3}
                >
                  <Typography variant="sigma" textColor="neutral500">
                    {formatMessage({
                      id: `Settings.roles.form.permissions.${label.toLowerCase()}`,
                      defaultMessage: label,
                    })}
                  </Typography>
                  <Checkbox
                    disabled={false}
                    onCheckedChange={(value) => { handleHeaderCheckboxChange(actionId, 'collection')}}
                    name={actionId}
                    aria-label={formatMessage(
                      {
                        id: `Settings.permissions.select-all-by-permission`,
                        defaultMessage: 'Select all {label} permissions',
                      },
                      {
                        label: formatMessage({
                          id: `Settings.roles.form.permissions.${label.toLowerCase()}`,
                          defaultMessage: label,
                        }),
                      }
                    )}
                    checked={areAllActionsEnabled(actionId, 'collection')}
                  />
                </Flex>
              );
            })}
            <Flex
              shrink={0}
              width={'15rem'} // adjust this value as needed
              direction="column"
              alignItems="center" // This will vertically center the Typography component
              justifyContent="center"
              paddingBottom={'3rem'}
            >
              <Typography variant="sigma" textColor="neutral500">
                {formatMessage({
                  id: `Settings.roles.form.permissions.route`,
                  defaultMessage: 'Route',
                })}
              </Typography>
            </Flex>
          </Flex>
        </Box>

        { /* Types checkboxes */ }
        {collectionTypesState.map(({ name, label, actions }, subcategoryIndex) => {
          const isGrey = subcategoryIndex % 2 === 0;
          return (
            <BoxWrapper key={subcategoryIndex}>
              <Wrapper
                height={rowHeight}
                flex={1}
                alignItems="center"
                background={isGrey ? 'neutral100' : 'neutral0'}
              >
                <Flex alignItems="center" paddingLeft={6} shrink={0} >
                  <Box paddingRight={2} >
                    <Checkbox
                      name={name}
                      aria-label={formatMessage(
                        {
                          id: `Settings.permissions.select-all-by-permission`,
                          defaultMessage: 'Select all {label} permissions',
                        },
                        { label: label }
                      )}
                      onCheckedChange={(value) => handleTypeCheckboxChange(subcategoryIndex, value, 'collection')}
                      checked={actions.every(action => action.enabled)}
                    />
                  </Box>
                  <TypesCheckboxFlex>
                    <Typography ellipsis>{label}</Typography>
                  </TypesCheckboxFlex>
                </Flex>

                {/* actions checkboxes */ }
                <Flex style={{ flex: 1, paddingLeft: `11em`}}  alignItems="stretch">
                  {actions.map(({ name: actionName, enabled }, actionIndex) => {
                    return (
                      <Cell key={`Action-${actionIndex}`} justifyContent="center" alignItems="center">
                        <Checkbox
                          name={actionName}
                          onCheckedChange={(value) => {
                            handleActionChange(subcategoryIndex, actionIndex, value, false,'collection');
                          }}
                          checked={enabled}
                        />
                      </Cell>
                    );
                  })}
                </Flex>
              </Wrapper>
            </BoxWrapper>
          );
        })}
      </Tabs.Content>
      <Tabs.Content value={TAB_LABELS[1].id}>
        {/* headers row */}
        <Box paddingBottom={4} paddingTop={6} style={{ paddingLeft: `20rem` }} >
          <Flex gap={0} marginLeft={11} marginRight={10}
          >
            {SINGLE_TYPES_ACTIONS.map(({ label, actionId }) => {
              return (
                <Flex
                  shrink={0}
                  width={'12rem'} // cells width
                  direction="column"
                  alignItems="center"
                  justifyContent="center"
                  key={actionId}
                  gap={3}
                >
                  <Typography variant="sigma" textColor="neutral500">
                    {formatMessage({
                      id: `Settings.roles.form.permissions.${label.toLowerCase()}`,
                      defaultMessage: label,
                    })}
                  </Typography>
                  <Checkbox
                    disabled={false}
                    onCheckedChange={(value) => { handleHeaderCheckboxChange(actionId, 'single')}}
                    name={actionId}
                    aria-label={formatMessage(
                      {
                        id: `Settings.permissions.select-all-by-permission`,
                        defaultMessage: 'Select all {label} permissions',
                      },
                      {
                        label: formatMessage({
                          id: `Settings.roles.form.permissions.${label.toLowerCase()}`,
                          defaultMessage: label,
                        }),
                      }
                    )}
                    checked={areAllActionsEnabled(actionId, 'single')}
                  />
                </Flex>
              );
            })}
            <Flex
              shrink={0}
              width={'15rem'} // adjust this value as needed
              direction="column"
              alignItems="center" // This will vertically center the Typography component
              justifyContent="center"
              paddingBottom={'3rem'}
            >
              <Typography variant="sigma" textColor="neutral500">
                {formatMessage({
                  id: `Settings.roles.form.permissions.route`,
                  defaultMessage: 'Route',
                })}
              </Typography>
            </Flex>
          </Flex>
        </Box>
        {/* end headers row */}
        {singleTypesState.map(({ name, label, actions }, subcategoryIndex) => {
          const isGrey = subcategoryIndex % 2 === 0;
          return (
            <BoxWrapper key={subcategoryIndex}>
              <Wrapper
                height={rowHeight}
                flex={1}
                alignItems="center"
                background={isGrey ? 'neutral100' : 'neutral0'}
              >

                { /* Types checkboxes */ }
                <Flex alignItems="center" paddingLeft={6} shrink={0} >
                  <Box paddingRight={2} >
                    <Checkbox
                      name={name}
                      aria-label={formatMessage(
                        {
                          id: `Settings.permissions.select-all-by-permission`,
                          defaultMessage: 'Select all {label} permissions',
                        },
                        { label: label }
                      )}
                      onCheckedChange={(value) => handleTypeCheckboxChange(subcategoryIndex, value, 'single')}
                      checked={actions.every(action => action.enabled)}
                    />
                  </Box>
                  <TypesCheckboxFlex>
                  <Typography ellipsis>{label}</Typography>
                  </TypesCheckboxFlex>
                </Flex>

                {/* actions checkboxes */ }
                <Flex style={{ flex: 1, paddingLeft: `11em`}}  alignItems="stretch">
                  {actions.map(({ name: actionName, enabled }, actionIndex) => {
                    return (
                      <Cell key={`Action-${actionIndex}`} justifyContent="center" alignItems="center">
                        <Checkbox
                          name={actionName}
                          onCheckedChange={(value) => {
                            handleActionChange(subcategoryIndex, actionIndex, value, false,'single');
                          }}
                          checked={enabled}
                        />
                      </Cell>
                    );
                  })}
                </Flex>
              </Wrapper>
            </BoxWrapper>
          );
        })}
      </Tabs.Content>
      <Tabs.Content value={TAB_LABELS[2].id}>
        {/* headers row */}
        <Box paddingBottom={4} paddingTop={6} style={{ paddingLeft: `20rem` }} >
          <Flex gap={0} marginLeft={11} marginRight={10}
          >
            {PLUGINS_ACTIONS.map(({ label, actionId }) => {
              return (
                <Flex
                  shrink={0}
                  width={'12rem'} // cells width
                  direction="column"
                  alignItems="center"
                  justifyContent="center"
                  key={actionId}
                  gap={3}
                >
                  <Typography variant="sigma" textColor="neutral500">
                    {formatMessage({
                      id: `Settings.roles.form.permissions.${label.toLowerCase()}`,
                      defaultMessage: label,
                    })}
                  </Typography>
                  <Checkbox
                    disabled={false}
                    onCheckedChange={(value) => { handleHeaderCheckboxChange(actionId, 'plugin')}}
                    name={actionId}
                    aria-label={formatMessage(
                      {
                        id: `Settings.permissions.select-all-by-permission`,
                        defaultMessage: 'Select all {label} permissions',
                      },
                      {
                        label: formatMessage({
                          id: `Settings.roles.form.permissions.${label.toLowerCase()}`,
                          defaultMessage: label,
                        }),
                      }
                    )}
                    checked={areAllActionsEnabled(actionId, 'plugin')}
                  />
                </Flex>
              );
            })}
            <Flex
              shrink={0}
              width={'15rem'} // adjust this value as needed
              direction="column"
              alignItems="center" // This will vertically center the Typography component
              justifyContent="center"
              paddingBottom={'3rem'}
            >
              <Typography variant="sigma" textColor="neutral500">
                {formatMessage({
                  id: `Settings.roles.form.permissions.route`,
                  defaultMessage: 'Route',
                })}
              </Typography>
            </Flex>
          </Flex>
        </Box>
        {/* end headers row */}
        {pluginsState.map(({ name, label, actions }, subcategoryIndex) => {
          const isGrey = subcategoryIndex % 2 === 0;
          return (
            <BoxWrapper key={subcategoryIndex}>
              <Wrapper
                height={rowHeight}
                flex={1}
                alignItems="center"
                background={isGrey ? 'neutral100' : 'neutral0'}
              >

                { /* Types checkboxes */ }
                <Flex alignItems="center" paddingLeft={6} shrink={0} >
                  <Box paddingRight={2} >
                    <Checkbox
                      name={name}
                      aria-label={formatMessage(
                        {
                          id: `Settings.permissions.select-all-by-permission`,
                          defaultMessage: 'Select all {label} permissions',
                        },
                        { label: label }
                      )}
                      onCheckedChange={(value) => handleTypeCheckboxChange(subcategoryIndex, value, 'plugin')}
                      checked={actions.every(action => action.enabled)}
                    />
                  </Box>
                  <TypesCheckboxFlex>
                    <Typography ellipsis>{label}</Typography>
                  </TypesCheckboxFlex>
                </Flex>

                {/* actions checkboxes */ }
                <Flex style={{ flex: 1, paddingLeft: `11em`}}  alignItems="stretch">
                  {actions.map(({ name: actionName, enabled }, actionIndex) => {
                    return (
                      <Cell key={`Action-${actionIndex}`} justifyContent="center" alignItems="center">
                        <Checkbox
                          name={actionName}
                          onCheckedChange={(value) => {
                            handleActionChange(subcategoryIndex, actionIndex, value, false,'plugin');
                          }}
                          checked={enabled}
                        />
                      </Cell>
                    );
                  })}
                </Flex>
              </Wrapper>
            </BoxWrapper>
          );
        })}
      </Tabs.Content>
    </Tabs.Root>
    </Box>
  );
};

export default Permissions;

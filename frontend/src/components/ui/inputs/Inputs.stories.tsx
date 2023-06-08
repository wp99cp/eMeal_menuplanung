import type { Meta, StoryObj } from '@storybook/react';
import SimpleInputField, { SimpleInputFieldPropsType } from '@ui/inputs/SimpleInputField';
import { Paragraph } from '@ui/components/Text';
import { useState } from 'react';
import StatefulInputField, {
  FieldState,
  StatefulInputFieldPropsType,
} from '@ui/inputs/StatefulInputField';
import AutoSafeEnabledInputField from '@ui/inputs/AutoSafeEnabledInputField';

const meta: Meta<typeof SimpleInputField> = {
  component: SimpleInputField,
};
export default meta;

type Story = StoryObj<typeof SimpleInputField>;

function ComponentUnderTest(args: SimpleInputFieldPropsType) {
  const [content, setContent] = useState('');
  const [content1, setContent2] = useState('');

  return (
    <>
      <Paragraph>
        This is a paragraph, that is immediately before an input field. This could be some
        long text or even a very shor paragraph...
      </Paragraph>

      <SimpleInputField {...args}>
        <p>Test</p>
      </SimpleInputField>

      <Paragraph>
        ...and this is a paragraph, that is immediately after an input field.
      </Paragraph>

      <SimpleInputField {...args} valueHook={[content, setContent]} />
      <Paragraph>Content of input field: {content}</Paragraph>

      <StatefulInputField
        {...(args as StatefulInputFieldPropsType)}
        valueHook={[content1, setContent2]}
        strokeValidation={async (value) => {
          console.log('running strokeValidation', value);
          if (value.length < 5) return { state: FieldState.ERROR, stateMsg: 'Too short' };
          return { state: FieldState.LOADING, stateMsg: 'Your input gets validated...' };
        }}
        inputValidation={async (value) => {
          console.log('running inputValidation', value);
          if (value.length < 5) return { state: FieldState.ERROR, stateMsg: 'Too short' };
          return {
            state: FieldState.SUCCESS,
            stateMsg: 'Your input is valid and saved!',
          };
        }}
      />

      <Paragraph>Content of input field: {content}</Paragraph>

      <StatefulInputField
        {...(args as StatefulInputFieldPropsType)}
        placeholder="This can only be a valid email address"
        prefix=""
        type="email"
      />

      <Paragraph>Content of input field: {content}</Paragraph>

      <AutoSafeEnabledInputField
        {...(args as StatefulInputFieldPropsType)}
        strokeValidation={async (value) => {
          console.log('running strokeValidation', value);
          if (value.length < 5) return { state: FieldState.ERROR, stateMsg: 'Too short' };
          return { state: FieldState.LOADING, stateMsg: 'Your input gets validated...' };
        }}
        inputValidation={async (value) => {
          console.log('running inputValidation', value);
          if (value.length < 5) return { state: FieldState.ERROR, stateMsg: 'Too short' };
          return {
            state: FieldState.SUCCESS,
            stateMsg: 'Your input is valid and saved!',
          };
        }}
        autoSaveCallback={async (value) => {
          console.log('running saveCallback', value);
        }}
        placeholder="this will be auto-saved"
        prefix=""
      />
    </>
  );
}

export const Default: Story = {
  args: {
    id: 'this_is_the_id',
    autoComplete: 'off',
    autofocus: false,
    disabled: false,
    max: undefined,
    maxLength: undefined,
    min: undefined,
    name: 'This is the name',
    placeholder: '123-12334-123455-23',
    readonly: false,
    required: false,
    step: undefined,
    type: 'text',
    label_description: 'This is the label description',
    prefix: 'ID:',
    valueHook: undefined,
    className: '',
  },
  render: (args) => <ComponentUnderTest {...args} />,
};

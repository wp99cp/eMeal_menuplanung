import type { Meta, StoryObj } from '@storybook/react';
import SimpleInputField, {
  SimpleInputFieldPropsType,
} from '@ui/inputs/inputField/SimpleInputField';
import { Paragraph } from '@ui/components/Text';
import { useState } from 'react';
import StatefulInputField, {
  StatefulInputFieldPropsType,
} from '@ui/inputs/inputField/StatefulInputField';
import AutoSafeEnabledInputField from '@ui/inputs/inputField/AutoSafeEnabledInputField';
import SimpleTextArea, {
  SimpleTextAreaPropsType,
} from '@ui/inputs/textArea/SimpleTextArea';
import { FieldState } from '@ui/utils/statefullness';
import StatefulTextArea, {
  StatefulTextAreaPropsType,
} from '@ui/inputs/textArea/StatefulTextArea';
import AutoSafeEnabledTextArea from '@ui/inputs/textArea/AutoSafeEnabledTextArea';

const meta: Meta<typeof SimpleInputField> = {
  component: SimpleInputField,
};
export default meta;

type Story = StoryObj<typeof SimpleInputField>;

function DefaultComponentUnderTest(args: SimpleInputFieldPropsType) {
  const [content, setContent] = useState('');
  const [content1, setContent1] = useState('');
  const [content2, setContent2] = useState('');

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
        valueHook={[content1, setContent1]}
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

      <Paragraph>Content of input field: {content1}</Paragraph>

      <StatefulInputField
        {...(args as StatefulInputFieldPropsType)}
        placeholder="This can only be a valid email address"
        prefix=""
        type="email"
      />
      <Paragraph>...just another paragraph.</Paragraph>

      <AutoSafeEnabledInputField
        {...(args as StatefulInputFieldPropsType)}
        valueHook={[content2, setContent2]}
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

      <Paragraph>Content of input field: {content2}</Paragraph>
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
  render: (args) => <DefaultComponentUnderTest {...args} />,
};

function TextAreaComponentUnderTest(args: SimpleTextAreaPropsType) {
  const [value, setValue] = useState('');

  return (
    <>
      <SimpleTextArea {...args} />
      <StatefulTextArea {...(args as StatefulTextAreaPropsType)} />
      <AutoSafeEnabledTextArea
        {...(args as StatefulTextAreaPropsType)}
        valueHook={[value, setValue]}
        strokeValidation={async (value) => {
          console.log('running strokeValidation', value);
          return {
            state: FieldState.DEFAULT,
            stateMsg: 'Your input is valid and saved!',
          };
        }}
        inputValidation={async (value) => {
          console.log('running inputValidation', value);

          // check if there are any non-alphanumeric characters
          // spaces, dashes and underscores are also allowed
          // as well as dots and commas
          if (value.match(/[^a-zA-Z0-9\s\-_.,]/g))
            return {
              state: FieldState.ERROR,
              stateMsg: 'Only alphanumeric characters allowed',
            };

          return {
            state: FieldState.SUCCESS,
            stateMsg: 'Your input is valid and saved!',
          };
        }}
        autoSaveCallback={async (value) => {
          console.log('running saveCallback', value);
        }}
      />

      <pre>{value}</pre>
    </>
  );
}

export const TextArea: Story = {
  args: {
    id: 'this_is_the_id',
    autofocus: false,
    disabled: false,
    max: undefined,
    name: 'This is the name',
    placeholder: '123-12334-123455-23',
    readonly: false,
    required: false,
    label_description: 'This is the label description',
    prefix: 'ID:',
    valueHook: undefined,
    className: '',
  },
  render: (args) => <TextAreaComponentUnderTest {...args} />,
};

import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import { MyComponent } from '../src';

const meta: ComponentMeta<typeof MyComponent> = {
  title: 'My Component',
  component: MyComponent,
};

export default meta;

const Template: ComponentStory<typeof MyComponent> = (args) => (
  <MyComponent {...args} />
);

export const Default = Template.bind({});
Default.args = {
  label: 'Test Label',
};

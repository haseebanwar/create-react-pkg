import { MyComponent } from '../';

const meta = {
  title: 'My Component',
  component: MyComponent,
};

export default meta;

const Template = (args) => <MyComponent {...args} />;

export const Default = Template.bind({});
Default.args = {};

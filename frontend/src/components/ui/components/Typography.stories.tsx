import type { Meta, StoryObj } from '@storybook/react';
import { Paragraph } from '@ui/components/Text';
import { Subsubtitle, Subtitle, Title } from '@ui/components/titles';

const meta: Meta<typeof Paragraph> = {
  component: Paragraph,
};

export default meta;
type Story = StoryObj<typeof Paragraph>;

export const Default: Story = {
  render: () => (
    <>
      <Title>Lorem Ipsum</Title>

      <Subtitle>Quam at vestibulum bibendum.</Subtitle>

      <Paragraph>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus egestas quam
        est, eget elementum ipsum dapibus in. In vitae purus nec sem iaculis faucibus.
        Praesent volutpat faucibus felis, a ullamcorper augue fermentum at. Mauris
        scelerisque lacinia urna, nec varius nunc maximus sed. Praesent rhoncus quam at
        vestibulum bibendum. Morbi blandit commodo aliquet. Curabitur ultricies auctor
        felis a auctor. Maecenas elit sem, bibendum vel nunc at, faucibus eleifend nulla.
        Integer commodo tincidunt lectus, a ullamcorper tortor egestas id.
      </Paragraph>

      <Paragraph>
        Donec consectetur neque ac arcu imperdiet, in aliquet enim efficitur. Duis finibus
        metus velit, eget ornare leo fringilla ac. In vestibulum nibh eu augue convallis
        egestas. Ut ullamcorper nibh at dolor tempor, a luctus elit gravida. Mauris
        pretium ut felis nec finibus. Integer varius dui vitae laoreet bibendum.
        Pellentesque tristique sapien lorem, vel lobortis augue mattis et. Vivamus lacinia
        scelerisque hendrerit. Donec dictum at justo at tincidunt. Nulla urna massa,
        facilisis vel malesuada rhoncus, rhoncus sed enim. Cras at ipsum id ante interdum
        pellentesque vitae sit amet mauris. Curabitur viverra molestie elit ac facilisis.
        Pellentesque elit urna, tristique eget efficitur vitae, pellentesque eu nulla.
        Mauris eu sem rhoncus, porta dolor id, malesuada nibh.
      </Paragraph>

      <Subtitle>Quam at vestibulum bibendum.</Subtitle>

      <Paragraph>
        Aenean magna mi, elementum ac felis sagittis, cursus imperdiet odio. Sed blandit
        sollicitudin turpis vitae volutpat. Donec vitae eros ex. Lorem ipsum dolor sit
        amet, consectetur adipiscing elit. In lobortis non leo nec iaculis. Proin massa
        risus, egestas sed laoreet nec, dictum vitae quam. Nulla est diam, cursus laoreet
        venenatis vel, sodales sit amet mi. Fusce ut pretium lectus. Sed non urna
        lobortis, fringilla leo ac, gravida tortor. Curabitur rhoncus ipsum diam. Nullam
        eleifend tellus ipsum.
      </Paragraph>

      <Subsubtitle>Mauris pretium ut felis nec finibus.</Subsubtitle>

      <Paragraph>
        Aenean magna mi, elementum ac felis sagittis, cursus imperdiet odio. Sed blandit
        sollicitudin turpis vitae volutpat. Donec vitae eros ex. Lorem ipsum dolor sit
        amet, consectetur adipiscing elit. In lobortis non leo nec iaculis. Proin massa
        risus, egestas sed laoreet nec, dictum vitae quam. Nulla est diam, cursus laoreet
        venenatis vel, sodales sit amet mi. Fusce ut pretium lectus. Sed non urna
        lobortis, fringilla leo ac, gravida tortor. Curabitur rhoncus ipsum diam. Nullam
        eleifend tellus ipsum.
      </Paragraph>
    </>
  ),
};

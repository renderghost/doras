import '@doras/components';
import type { DorasEmailField, DorasErrorSummary, DorasTextField } from '@doras/components';
import { specs } from '@doras/specs';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { expect, userEvent, waitFor } from 'storybook/test';
import { host } from '../helpers.ts';

const meta: Meta = {
  title: 'System feedback/Error summary',
  component: 'doras-error-summary',
  parameters: { doras: { spec: specs['error-summary'] } },
};

export default meta;
type Story = StoryObj;

/** On submit, the summary lists the errors and takes focus; each link moves focus to its field. */
export const OnSubmit: Story = {
  name: 'On submit',
  render: () => {
    const submit = (e: SubmitEvent) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const name = form.querySelector<DorasTextField>('#name');
      const email = form.querySelector<DorasEmailField>('#email');
      const summary = form.querySelector<DorasErrorSummary>('doras-error-summary');
      if (!name || !email || !summary) return;
      name.error = name.value ? '' : 'Enter your name';
      email.error = email.value ? '' : 'Enter your email address';
      void summary.show(
        [name, email].filter((f) => f.error).map((f) => ({ message: f.error ?? '', target: f.id })),
      );
    };
    return html`<form
      novalidate
      style="display: grid; gap: 1rem; max-inline-size: 26rem"
      @submit=${submit}
    >
      <doras-error-summary></doras-error-summary>
      <doras-text-field id="name" label="Your name" name="name"></doras-text-field>
      <doras-email-field id="email" label="Email address" name="email"></doras-email-field>
      <div><doras-button type="submit">Continue</doras-button></div>
    </form>`;
  },
  play: async ({ canvasElement }) => {
    const summary = host<DorasErrorSummary>(canvasElement, 'doras-error-summary');
    await userEvent.click(
      host<HTMLElement>(canvasElement, 'doras-button').shadowRoot?.querySelector(
        'button',
      ) as HTMLElement,
    );
    await waitFor(() => expect(summary.shadowRoot?.activeElement).toHaveClass('summary'));
    const links = summary.shadowRoot?.querySelectorAll('a') ?? [];
    await expect(links).toHaveLength(2);
    await userEvent.click(links[1] as HTMLElement);
    const email = host<HTMLElement>(canvasElement, 'doras-email-field');
    await expect(email.shadowRoot?.activeElement).toBe(email.shadowRoot?.querySelector('input'));
  },
};

export const Shown: Story = {
  render: () =>
    html`<doras-error-summary
      style="max-inline-size: 26rem"
      .errors=${[
        { message: 'Enter your name', target: 'name' },
        { message: 'Enter your email address', target: 'email' },
      ]}
    ></doras-error-summary>`,
};

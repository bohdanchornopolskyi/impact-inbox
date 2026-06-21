import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  AuthBackLink,
  AuthNotice,
  AuthNoticeEmail,
  AuthShellDivider,
  Button,
  Input,
  MailCheckIcon,
  PasswordInput,
  authInlineLinkClass,
  authShellLinkClass,
} from "@repo/ui/client";
import { AuthShell } from "./auth-shell";
import { FormError } from "../form-error/form-error";

const meta = {
  title: "Patterns/AuthShell",
  component: AuthShell,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AuthShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignIn: Story = {
  args: {
    title: "Welcome back",
    description: "Sign in to your workspace.",
    logoHref: "#",
    footer: (
      <>
        New to Impact Inbox?{" "}
        <a href="#" className={authShellLinkClass()}>
          Create an account
        </a>
      </>
    ),
    children: null,
  },
  render: (args) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
      <AuthShell {...args}>
        <form onSubmit={(event) => event.preventDefault()}>
          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
          />
          <PasswordInput
            id="password"
            label="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            labelAction={
              <a href="#" className={authInlineLinkClass()}>
                Forgot?
              </a>
            }
          />
          <FormError message="Invalid email or password." />
          <Button type="submit" variant="primary" size="lg" fullWidth className="mt-1">
            Sign in
          </Button>
        </form>
      </AuthShell>
    );
  },
};

export const SignUp: Story = {
  args: {
    title: "Create your account",
    description: "Start a free 7-day trial — no card required.",
    logoHref: "#",
    footer: (
      <>
        Already have an account?{" "}
        <a href="#" className={authShellLinkClass()}>
          Sign in
        </a>
      </>
    ),
    children: null,
  },
  render: (args) => (
    <AuthShell {...args}>
      <form onSubmit={(event) => event.preventDefault()}>
        <Input id="name" label="Full name" placeholder="Maya Chen" />
        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="you@company.com"
        />
        <PasswordInput
          id="password"
          label="Password"
          placeholder="Create a password"
          hint="At least 8 characters."
        />
        <Button type="submit" variant="primary" size="lg" fullWidth className="mt-1">
          Create account
        </Button>
      </form>
    </AuthShell>
  ),
};

export const VerifyEmail: Story = {
  args: {
    logoHref: "#",
    children: null,
  },
  render: (args) => (
    <AuthShell {...args}>
      <AuthNotice icon={<MailCheckIcon />} title="Check your inbox">
        <>
          We sent a verification link to{" "}
          <AuthNoticeEmail email="you@company.com" />. Click it to activate your
          account and start your trial.
        </>
      </AuthNotice>
      <Button variant="secondary" size="lg" fullWidth className="mt-[22px]">
        Open email app
      </Button>
      <p className="mt-4 text-center text-ui-base text-text-tertiary">
        Didn&apos;t get it?{" "}
        <button type="button" className={authShellLinkClass()}>
          Resend email
        </button>
      </p>
      <AuthShellDivider />
      <AuthBackLink href="#" className="mt-[18px]" />
    </AuthShell>
  ),
};

export const ForgotPassword: Story = {
  args: {
    title: "Reset your password",
    description: "Enter your account email and we'll send a reset link.",
    logoHref: "#",
    children: null,
  },
  render: (args) => {
    const [email, setEmail] = useState("");

    return (
      <AuthShell {...args}>
        <form onSubmit={(event) => event.preventDefault()}>
          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
          />
          <Button type="submit" variant="primary" size="lg" fullWidth className="mt-1">
            Send reset link
          </Button>
        </form>
        <AuthBackLink href="#" className="mt-4" />
      </AuthShell>
    );
  },
};

export const ResetPassword: Story = {
  args: {
    title: "Choose a new password",
    description: "Enter a new password for your account.",
    logoHref: "#",
    children: null,
  },
  render: (args) => (
    <AuthShell {...args}>
      <form onSubmit={(event) => event.preventDefault()}>
        <PasswordInput
          id="newPassword"
          label="New password"
          placeholder="Create a password"
          hint="At least 8 characters."
        />
        <PasswordInput
          id="confirmNewPassword"
          label="Confirm password"
          placeholder="Confirm your password"
        />
        <Button type="submit" variant="primary" size="lg" fullWidth className="mt-1">
          Update password
        </Button>
      </form>
      <AuthBackLink href="#" className="mt-4" />
    </AuthShell>
  ),
};

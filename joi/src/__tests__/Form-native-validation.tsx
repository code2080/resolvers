import React from 'react';
import { render, screen, act } from '@testing-library/react';
import user from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import * as Joi from 'joi';
import { joiResolver } from '..';

const schema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

interface FormData {
  username: string;
  password: string;
}

interface Props {
  onSubmit: (data: FormData) => void;
}

function TestComponent({ onSubmit }: Props) {
  const { register, handleSubmit } = useForm<FormData>({
    resolver: joiResolver(schema),
    shouldUseNativeValidation: true,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('username')} placeholder="username" />

      <input {...register('password')} placeholder="password" />

      <button type="submit">submit</button>
    </form>
  );
}

test("form's native validation with Joi", async () => {
  const handleSubmit = jest.fn();
  render(<TestComponent onSubmit={handleSubmit} />);

  // username
  let usernameField = screen.getByPlaceholderText(
    /username/i,
  ) as HTMLInputElement;
  expect(usernameField.validity.valid).toBe(true);
  expect(usernameField.validationMessage).toBe('');

  // password
  let passwordField = screen.getByPlaceholderText(
    /password/i,
  ) as HTMLInputElement;
  expect(passwordField.validity.valid).toBe(true);
  expect(passwordField.validationMessage).toBe('');

  await act(async () => {
    user.click(screen.getByText(/submit/i));
  });

  // username
  usernameField = screen.getByPlaceholderText(/username/i) as HTMLInputElement;
  expect(usernameField.validity.valid).toBe(false);
  expect(usernameField.validationMessage).toBe(
    '"username" is not allowed to be empty',
  );

  // password
  passwordField = screen.getByPlaceholderText(/password/i) as HTMLInputElement;
  expect(passwordField.validity.valid).toBe(false);
  expect(passwordField.validationMessage).toBe(
    '"password" is not allowed to be empty',
  );
});

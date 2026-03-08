import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LetterStep } from '../../src/components/LetterStep';
import type { SelectableRepresentative } from '../../src/types';

describe('LetterStep Component', () => {
  const mockSelectedReps: SelectableRepresentative[] = [
    {
      type: 'MP',
      id: 1,
      name: 'John Smith',
      email: 'john@example.com',
      party: 'Labour',
      constituency: 'Test Constituency'
    }
  ];

  const mockOnSend = jest.fn();
  const defaultProps = {
    selectedReps: mockSelectedReps,
    letterTemplate: 'Dear {{representative_name}},\n\nTest letter content.',
    onSend: mockOnSend,
    loading: false,
  };

  beforeEach(() => {
    mockOnSend.mockClear();
  });

  test('renders the letter step with initial template', () => {
    render(<LetterStep {...defaultProps} />);
    
    expect(screen.getByLabelText(/Your Name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Your Email:/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /Your Name:/i })).toBeInTheDocument();
    
    const textarea = screen.getByDisplayValue(/Dear {{representative_name}}/i);
    expect(textarea).toBeInTheDocument();
  });

  test('shows validation alert when name is empty', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<LetterStep {...defaultProps} />);
    
    const sendButton = screen.getByRole('button', { name: /Send/i });
    fireEvent.click(sendButton);
    
    expect(alertSpy).toHaveBeenCalledWith('Please fill in all fields.');
    expect(mockOnSend).not.toHaveBeenCalled();
    
    alertSpy.mockRestore();
  });

  test('shows validation alert when email is empty', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<LetterStep {...defaultProps} />);
    
    const nameInput = screen.getByLabelText(/Your Name:/i);
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    
    const sendButton = screen.getByRole('button', { name: /Send/i });
    fireEvent.click(sendButton);
    
    expect(alertSpy).toHaveBeenCalledWith('Please fill in all fields.');
    expect(mockOnSend).not.toHaveBeenCalled();
    
    alertSpy.mockRestore();
  });

  test('shows validation alert when email is invalid', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<LetterStep {...defaultProps} />);
    
    const nameInput = screen.getByLabelText(/Your Name:/i);
    const emailInput = screen.getByLabelText(/Your Email:/i);
    
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const sendButton = screen.getByRole('button', { name: /Send/i });
    fireEvent.click(sendButton);
    
    expect(alertSpy).toHaveBeenCalledWith('Please enter a valid email address.');
    expect(mockOnSend).not.toHaveBeenCalled();
    
    alertSpy.mockRestore();
  });

  test('calls onSend with correct data when form is valid', () => {
    render(<LetterStep {...defaultProps} />);
    
    const nameInput = screen.getByLabelText(/Your Name:/i);
    const emailInput = screen.getByLabelText(/Your Email:/i);
    const letterTextarea = screen.getByDisplayValue(/Dear {{representative_name}}/i);
    
    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(letterTextarea, { target: { value: 'Updated letter content' } });
    fireEvent.click(screen.getByRole('checkbox', { name: /i'm not a robot/i }));
    
    const sendButton = screen.getByRole('button', { name: /Send/i });
    fireEvent.click(sendButton);
    
    expect(mockOnSend).toHaveBeenCalledWith(
      'Test User',
      'test@example.com',
      'Updated letter content',
      true
    );
  });

  test('shows validation alert when robot confirmation is missing', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<LetterStep {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/Your Name:/i), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText(/Your Email:/i), {
      target: { value: 'test@example.com' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Send/i }));

    expect(alertSpy).toHaveBeenCalledWith(
      'Please confirm you are not a robot before sending.'
    );
    expect(mockOnSend).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  test('shows guidance about respectful messages', () => {
    render(<LetterStep {...defaultProps} />);
    
    expect(
      screen.getByText(/Abusive, threatening, or spam-like content will be blocked\./i)
    ).toBeInTheDocument();
  });

  test('blocks abusive language before sending', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<LetterStep {...defaultProps} />);

    fireEvent.change(screen.getByLabelText(/Your Name:/i), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByLabelText(/Your Email:/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.click(screen.getByRole('checkbox', { name: /i'm not a robot/i }));
    fireEvent.change(screen.getByDisplayValue(/Dear {{representative_name}}/i), {
      target: { value: 'This is fuck and should be blocked.' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Send/i }));

    expect(alertSpy).toHaveBeenCalledWith(
      'Please remove abusive or spam-like content before sending your message.'
    );
    expect(mockOnSend).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });

  test('displays "Sending..." when loading', () => {
    render(<LetterStep {...defaultProps} loading={true} />);
    
    const sendButton = screen.getByRole('button', { name: /Sending.../i });
    expect(sendButton).toBeDisabled();
  });

  test('displays success message when provided', () => {
    render(<LetterStep {...defaultProps} success="Letters sent successfully!" />);
    
    expect(screen.getByText('Letters sent successfully!')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Send/i })).not.toBeInTheDocument();
  });

  test('disables inputs when loading', () => {
    render(<LetterStep {...defaultProps} loading={true} />);
    
    const nameInput = screen.getByLabelText(/Your Name:/i);
    const emailInput = screen.getByLabelText(/Your Email:/i);
    const robotCheckbox = screen.getByRole('checkbox', { name: /i'm not a robot/i });
    const letterTextarea = screen.getByDisplayValue(/Dear {{representative_name}}/i);
    
    expect(nameInput).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(robotCheckbox).toBeDisabled();
    expect(letterTextarea).toBeDisabled();
  });

  test('disables inputs when success is shown', () => {
    render(<LetterStep {...defaultProps} success="Success!" />);
    
    const nameInput = screen.getByLabelText(/Your Name:/i);
    const emailInput = screen.getByLabelText(/Your Email:/i);
    const robotCheckbox = screen.getByRole('checkbox', { name: /i'm not a robot/i });
    const letterTextarea = screen.getByDisplayValue(/Dear {{representative_name}}/i);
    
    expect(nameInput).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(robotCheckbox).toBeDisabled();
    expect(letterTextarea).toBeDisabled();
  });

  test('send button has send-button class for testing', () => {
    render(<LetterStep {...defaultProps} />);
    
    const sendButton = screen.getByRole('button', { name: /Send/i });
    expect(sendButton).toHaveClass('send-button');
  });

  test('allows editing letter content', () => {
    render(<LetterStep {...defaultProps} />);
    
    const letterTextarea = screen.getByDisplayValue(/Dear {{representative_name}}/i);
    const newContent = 'Completely new letter';
    
    fireEvent.change(letterTextarea, { target: { value: newContent } });
    
    expect(screen.getByDisplayValue(newContent)).toBeInTheDocument();
  });
});
